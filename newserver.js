require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3003;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/login', limiter);

// Database Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const client = new MongoClient(mongoURI);
let db;

async function connectToDB() {
  try {
    await client.connect();
    db = client.db('project');
    console.log('Connected to MongoDB');
    
    // Create indexes
    await db.collection('slots').createIndex({ name: 1, date: 1 });
    await db.collection('postslots').createIndex({ name: 1, date: 1 });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('admins').createIndex({ email: 1 }, { unique: true });
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

// Database Middleware
app.use(async (req, res, next) => {
  if (!db) {
    try {
      await connectToDB();
    } catch (err) {
      return res.status(500).json({ message: 'Database connection failed' });
    }
  }
  next();
});

// Request Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Helper Functions
const validateObjectId = (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  next();
};

const excludePassword = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// ========== USER ENDPOINTS ========== //

// User Registration
app.post('/users', async (req, res) => {
  try {
    const { name, email, password, contact } = req.body;
    
    // Validation
    if (!name || !email || !password || !contact) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await db.collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      contact,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: result.insertedId
    });
  } catch (err) {
    console.error('Failed to create user:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create user' 
    });
  }
});

// User Login
// In server.js

// User Login
app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }
    
    // --- NEW: CHECK IF USER IS BLOCKED ---
    // This check runs before comparing the password.
    if (user.status === 'blocked') {
      return res.status(403).json({ 
        success: false,
        message: 'Your account has been blocked. Please contact support.' 
      });
    }
    
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: 'user' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    res.json({ 
      success: true,
      token,
      user: excludePassword(user)
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
});

// Get all users (protected)
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await db.collection('users').find().toArray();
    res.json({ 
      success: true,
      data: users.map(excludePassword) 
    });
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users' 
    });
  }
});

// Get single user (protected)
app.get('/users/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      data: excludePassword(user) 
    });
  } catch (err) {
    console.error('Failed to fetch user:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch user' 
    });
  }
});

// In server.js, add these two new endpoints

// --- PASSWORD RESET ENDPOINTS ---

// 1. REQUEST A PASSWORD RESET
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      // We send a success message even if the user doesn't exist
      // to prevent people from checking which emails are registered.
      return res.json({ success: true, message: 'If a user with that email exists, a password reset link has been sent.' });
    }

    // Generate a secure, random token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    // Set an expiry date for the token (e.g., 1 hour from now)
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save the token and expiry date to the user's document
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { resetToken, resetTokenExpiry } }
    );

    // In a real application, you would email this link to the user.
    // For this project, we will send it back in the response for simulation.
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    console.log(`Password Reset Link (for simulation): ${resetLink}`);

    res.json({ success: true, message: 'If a user with that email exists, a password reset link has been sent.' });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});


// 2. RESET THE PASSWORD
app.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find the user with a valid (non-expired) token
    const user = await db.collection('users').findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() } // Check if the token is not expired
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired.' });
    }

    // Hash the new password
    const hashedPassword = await require('bcryptjs').hash(password, 10);

    // Update the user's password and remove the token so it can't be used again
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { password: hashedPassword },
        $unset: { resetToken: "", resetTokenExpiry: "" }
      }
    );

    res.json({ success: true, message: 'Password has been reset successfully. Please log in.' });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// In server.js

// --- NEW: ADMIN PASSWORD RESET ENDPOINTS ---

// 1. ADMIN REQUESTS A PASSWORD RESET
app.post('/admin/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    // Find the admin in the 'admins' collection
    const admin = await db.collection('admins').findOne({ email });

    if (!admin) {
      return res.json({ success: true, message: 'If an admin with that email exists, a password reset link has been sent.' });
    }

    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save the token to the admin's document
    await db.collection('admins').updateOne(
      { _id: admin._id },
      { $set: { resetToken, resetTokenExpiry } }
    );

    // For simulation, we log the link. In production, you would email this.
    // Note the URL is different for the admin reset page.
    const resetLink = `http://localhost:3000/admin/reset-password/${resetToken}`;
    console.log(`ADMIN Password Reset Link (for simulation): ${resetLink}`);

    res.json({ success: true, message: 'If an admin with that email exists, a password reset link has been sent.' });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});


// 2. ADMIN RESETS THE PASSWORD
app.post('/admin/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find the admin with a valid token in the 'admins' collection
    const admin = await db.collection('admins').findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!admin) {
      return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired.' });
    }

    const hashedPassword = await require('bcryptjs').hash(password, 10);

    // Update the admin's password and remove the token
    await db.collection('admins').updateOne(
      { _id: admin._id },
      { 
        $set: { password: hashedPassword },
        $unset: { resetToken: "", resetTokenExpiry: "" }
      }
    );

    res.json({ success: true, message: 'Password has been reset successfully. Please log in.' });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});


// In server.js

// --- UPDATED: REVIEWS & RATINGS ENDPOINTS ---

// 1. SUBMIT A NEW REVIEW (User Protected)
app.post('/reviews', authenticateToken, async (req, res) => {
  try {
    // NEW: Accept bookingId in the request
    const { playgroundName, rating, comment, username, bookingId } = req.body;
    const userId = req.user.userId;

    if (!bookingId || !playgroundName || !rating || !comment || !username) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // --- CORE FIX: Check if a review for this booking already exists ---
    const existingReview = await db.collection('reviews').findOne({ bookingId: bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this booking.' });
    }

    const newReview = {
      bookingId, // Store the booking ID with the review
      playgroundName,
      userId,
      username,
      rating: Number(rating),
      comment,
      createdAt: new Date()
    };

    await db.collection('reviews').insertOne(newReview);
    res.status(201).json({ success: true, message: 'Thank you for your review!' });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error while submitting review.' });
  }
});


// 2. GET ALL REVIEWS (No changes needed here for now)
app.get('/reviews', async (req, res) => {
  try {
    const averageRatings = await db.collection('reviews').aggregate([
      {
        $group: {
          _id: "$playgroundName",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 }
        }
      }
    ]).toArray();
    res.json({ success: true, data: averageRatings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error while fetching reviews.' });
  }
});


// 3. NEW: GET REVIEWS SUBMITTED BY THE CURRENT USER
app.get('/my-reviews', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userReviews = await db.collection('reviews').find({ userId: userId }).toArray();
        res.json({ success: true, data: userReviews });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch your reviews.' });
    }
});

// ========== ADMIN ENDPOINTS ========== //

// In server.js

// --- 1. UPDATED: Admin Registration Route ---
app.post('/admin/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (await db.collection('admins').findOne({ email })) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection('admins').insertOne({
      name,
      email,
      password: hashedPassword,
      status: 'pending', // New admins are now pending by default
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Admin registration successful! Your account is pending approval.',
      adminId: result.insertedId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to register admin' });
  }
});


// --- 2. UPDATED: Admin Login Route ---
app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await db.collection('admins').findOne({ email });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // NEW: Check if the admin's status is pending
    if (admin.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Your account is still pending approval.' });
    }
    
    // NEW: Check if the admin's status is active
    if (admin.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Your account is not active.' });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ success: true, token, admin: excludePassword(admin) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to authenticate' });
  }
});


// --- 3. NEW: Routes for Managing Approvals ---

// GET all pending admin requests (Admin Protected)
app.get('/admin/pending', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
  try {
    const pendingAdmins = await db.collection('admins').find({ status: 'pending' }, { projection: { password: 0 } }).toArray();
    res.json({ success: true, data: pendingAdmins });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending admins.' });
  }
});

// UPDATE an admin's status to 'active' (Admin Protected)
app.put('/admin/approve/:adminId', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
  try {
    const { adminId } = req.params;
    const result = await db.collection('admins').updateOne(
      { _id: new ObjectId(adminId), status: 'pending' },
      { $set: { status: 'active', updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ success: false, message: 'Pending admin not found.' });
    res.json({ success: true, message: 'Admin approved successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to approve admin.' });
  }
});
// REJECT a pending admin request (delete the user) (Admin Protected)
app.delete('/admin/reject/:adminId', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    const { adminId } = req.params;
    const result = await db.collection('admins').deleteOne({ 
      _id: new ObjectId(adminId), 
      status: 'pending' 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Pending admin not found.' });
    }
    
    res.json({ success: true, message: 'Admin request rejected successfully.' });
  } catch (err) {
    console.error("Failed to reject admin:", err);
    res.status(500).json({ success: false, message: 'Failed to reject admin.' });
  }
});

// ========== SLOT ENDPOINTS ========== //
// In server.js

// CREATE A BOOKING MANUALLY (Admin Protected)
app.post('/admin/manual-booking', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    const { userId, username, name, date, slots, imageUrl } = req.body;

    if (!userId || !username || !name || !date || !slots || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Missing required booking information.' });
    }

    const newBooking = {
      userId,
      username,
      name,
      date,
      slots,
      imageUrl,
      
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Step 1: Create the new booking in the 'postslots' collection
    const result = await db.collection('postslots').insertOne(newBooking);

    // --- NEW LOGIC: UPDATE THE MASTER SLOT LIST ---
    // Step 2: Find the availability document for that day and playground
    const availabilityDoc = await db.collection('slots').findOne({ name, date });

    if (availabilityDoc) {
      // Step 3: Filter out the slots that were just booked
      const updatedAvailableSlots = availabilityDoc.slots.filter(
        slot => !slots.includes(slot)
      );

      // Step 4: Update the document in the 'slots' collection with the new, smaller list
      await db.collection('slots').updateOne(
        { _id: availabilityDoc._id },
        { $set: { slots: updatedAvailableSlots } }
      );
    }
    // --- END OF NEW LOGIC ---

    res.status(201).json({ success: true, message: 'Booking created and availability updated!', bookingId: result.insertedId });

  } catch (err) {
    console.error("Manual booking error:", err);
    res.status(500).json({ success: false, message: 'Server error while creating booking.' });
  }
});
// Create slots (admin protected)
app.post('/slots', authenticateToken, async (req, res) => {
  try {
    const { name, date, slots } = req.body;
    
    if (!name || !date || !slots || !Array.isArray(slots)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid slot data' 
      });
    }

    const result = await db.collection('slots').insertOne({
      name,
      date,
      slots,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Slots added successfully',
      slotId: result.insertedId
    });
  } catch (err) {
    console.error('Failed to add slots:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add slots' 
    });
  }
});

// Get all slots
app.get('/slots', async (req, res) => {
  try {
    const slots = await db.collection('slots')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ 
      success: true,
      data: slots 
    });
  } catch (err) {
    console.error('Failed to fetch slots:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch slots' 
    });
  }
});

// Get single slot
app.get('/slots/:id', validateObjectId, async (req, res) => {
  try {
    const slot = await db.collection('slots').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!slot) {
      return res.status(404).json({ 
        success: false,
        message: 'Slot not found' 
      });
    }
    
    res.json({ 
      success: true,
      data: slot 
    });
  } catch (err) {
    console.error('Failed to fetch slot:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch slot' 
    });
  }
});

// Update slot (admin protected)
app.put('/slots/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const { slots } = req.body;
    
    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid slot data' 
      });
    }

    const result = await db.collection('slots').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          slots,
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Slot not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Slot updated successfully' 
    });
  } catch (err) {
    console.error('Failed to update slot:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update slot' 
    });
  }
});

// ========== BOOKING ENDPOINTS ========== //

// Create booking (user protected)
app.post('/postslots', authenticateToken, async (req, res) => {
  try {
    const { name, date, slots, username, imageUrl } = req.body;
    
    if (!name || !date || !slots || !username) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing booking information' 
      });
    }

    const result = await db.collection('postslots').insertOne({
  name,
  date,
  slots,
  username,
  imageUrl, // Add this line
  userId: req.user.userId,
  status: 'confirmed',
  createdAt: new Date(),
  updatedAt: new Date()
});

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      bookingId: result.insertedId
    });
  } catch (err) {
    console.error('Failed to create booking:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create booking' 
    });
  }
});
// In server.js

// --- NEW: GET BOOKINGS FOR A SPECIFIC USER (User Protected) ---
app.get('/my-bookings', authenticateToken, async (req, res) => {
  // The authenticateToken middleware gives us req.user
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const userId = req.user.userId;
    
    // Find all bookings in the 'postslots' collection that match the logged-in user's ID
    const userBookings = await db.collection('postslots').find({ userId: userId }).toArray();
    
    res.json({ success: true, data: userBookings });

  } catch (err) {
    console.error("Failed to fetch user bookings:", err);
    res.status(500).json({ success: false, message: 'Server error while fetching bookings.' });
  }
});
// --- NEW: CANCEL A BOOKING (User Protected) ---
app.delete('/my-bookings/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    // Step 1: Find the booking to ensure it belongs to the user and to get its details
    const booking = await db.collection('postslots').findOne({
      _id: new ObjectId(bookingId),
      userId: userId
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or you do not have permission to cancel it.' });
    }

    // Step 2: Delete the user's booking
    await db.collection('postslots').deleteOne({ _id: new ObjectId(bookingId) });

    // Step 3: Add the slots back to the master availability list
    const availabilityDoc = await db.collection('slots').findOne({
      name: booking.name,
      date: booking.date
    });

    if (availabilityDoc) {
      // If a document for that day exists, add the slots back and sort them
      const updatedSlots = [...new Set([...availabilityDoc.slots, ...booking.slots])].sort();
      await db.collection('slots').updateOne(
        { _id: availabilityDoc._id },
        { $set: { slots: updatedSlots } }
      );
    } else {
      // If no availability document exists for that day, create one
      await db.collection('slots').insertOne({
        name: booking.name,
        date: booking.date,
        slots: booking.slots.sort()
      });
    }

    res.json({ success: true, message: 'Booking cancelled successfully!' });

  } catch (err) {
    console.error("Failed to cancel booking:", err);
    res.status(500).json({ success: false, message: 'Server error while cancelling booking.' });
  }
});

// In server.js, add this new endpoint

// --- NEW: CANCEL A SINGLE SLOT FROM A BOOKING (User Protected) ---
app.delete('/my-bookings/:bookingId/slots', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { slotTime } = req.body; // The time slot to remove is sent in the body
    const userId = req.user.userId;

    if (!slotTime) {
      return res.status(400).json({ success: false, message: 'Slot time is required.' });
    }

    // Step 1: Find the booking to ensure it belongs to the user
    const booking = await db.collection('postslots').findOne({
      _id: new ObjectId(bookingId),
      userId: userId
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or you do not have permission to modify it.' });
    }

    // Step 2: Remove the specific slot from the booking's slots array
    const updatedSlots = booking.slots.filter(s => s !== slotTime);

    // If all slots are removed, delete the entire booking. Otherwise, update it.
    if (updatedSlots.length === 0) {
      await db.collection('postslots').deleteOne({ _id: new ObjectId(bookingId) });
    } else {
      // TODO: Recalculate price if you have dynamic pricing implemented
      await db.collection('postslots').updateOne(
        { _id: new ObjectId(bookingId) },
        { $set: { slots: updatedSlots } }
      );
    }

    // Step 3: Add the single slot back to the master availability list
    const availabilityDoc = await db.collection('slots').findOne({
      name: booking.name,
      date: booking.date
    });

    if (availabilityDoc) {
      const newAvailableSlots = [...new Set([...availabilityDoc.slots, slotTime])].sort();
      await db.collection('slots').updateOne(
        { _id: availabilityDoc._id },
        { $set: { slots: newAvailableSlots } }
      );
    } else {
      await db.collection('slots').insertOne({
        name: booking.name,
        date: booking.date,
        slots: [slotTime]
      });
    }

    res.json({ success: true, message: 'Slot cancelled successfully!' });

  } catch (err) {
    console.error("Failed to cancel slot:", err);
    res.status(500).json({ success: false, message: 'Server error while cancelling slot.' });
  }
});



// Get all bookings (admin protected)
app.get('/postslots', authenticateToken, async (req, res) => {
  try {
    let query = {};
    
    // If regular user, only show their bookings
    if (req.user.role === 'user') {
      query.userId = req.user.userId;
    }
    
    const bookings = await db.collection('postslots')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
      
    res.json({ 
      success: true,
      data: bookings 
    });
  } catch (err) {
    console.error('Failed to fetch bookings:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch bookings' 
    });
  }
});

// Get single booking
app.get('/postslots/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const booking = await db.collection('postslots').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }
    
    // Check if user owns this booking or is admin
    if (booking.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized access' 
      });
    }
    
    res.json({ 
      success: true,
      data: booking 
    });
  } catch (err) {
    console.error('Failed to fetch booking:', err);
    res.status(400).json({ 
      success: false,
      message: 'Invalid booking ID' 
    });
  }
});

// Update booking
app.put('/postslots/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const { slots } = req.body;
    
    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid slot data' 
      });
    }

    // First check if booking exists and user has permission
    const booking = await db.collection('postslots').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }
    
    if (booking.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized access' 
      });
    }

    const result = await db.collection('postslots').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          slots,
          updatedAt: new Date() 
        } 
      }
    );

    res.json({ 
      success: true,
      message: 'Booking updated successfully' 
    });
  } catch (err) {
    console.error('Failed to update booking:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update booking' 
    });
  }
});

// Delete booking
app.delete('/postslots/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    // First check if booking exists and user has permission
    const booking = await db.collection('postslots').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }
    
    if (booking.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized access' 
      });
    }

    const result = await db.collection('postslots').deleteOne({
      _id: new ObjectId(req.params.id)
    });
    
    res.json({ 
      success: true,
      message: 'Booking deleted successfully' 
    });
  } catch (err) {
    console.error('Failed to delete booking:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete booking' 
    });
  }
});

// ========== OTHER ENDPOINTS ========== //

// Get cities
app.get('/cities', async (req, res) => {
  try {
    const cities = await db.collection('cities').find().toArray();
    res.json({ 
      success: true,
      data: cities 
    });
  } catch (err) {
    console.error('Failed to fetch cities:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch cities' 
    });
  }
});
// In server.js, add these two new routes

// ADD A NEW CITY (Admin Protected)
app.post('/cities', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    const { city, img, playground } = req.body;
    if (!city || !img || !playground) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const existingCity = await db.collection('cities').findOne({ city });
    if (existingCity) {
      return res.status(400).json({ success: false, message: 'This city already exists.' });
    }
    const newCity = { city, img, playground, createdAt: new Date() };
    const result = await db.collection('cities').insertOne(newCity);
    res.status(201).json({ success: true, message: 'City added successfully!', cityId: result.insertedId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add city' });
  }
});

// DELETE A CITY (Admin Protected)
// In server.js, add this new endpoint

// DELETE A PLAYGROUND from a specific city (Admin Protected)
app.delete('/cities/:cityId/playgrounds/:playgroundName', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    const { cityId, playgroundName } = req.params;

    // Step 1: Check if any bookings exist for this playground
    const existingBooking = await db.collection('postslots').findOne({ name: playgroundName });
    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'Cannot delete playground with active bookings. Please delete the bookings first.' });
    }
    
    // Step 2: Find the city to get the image of the playground to remove
    const city = await db.collection('cities').findOne({ _id: new ObjectId(cityId) });
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    const groundIndex = city.playground.grounds.indexOf(playgroundName);
    if (groundIndex === -1) {
      return res.status(404).json({ success: false, message: 'Playground not found in this city.' });
    }
    const imageToRemove = city.playground.img[groundIndex];

    // Step 3: Pull the playground name and image from their respective arrays
    const result = await db.collection('cities').updateOne(
      { _id: new ObjectId(cityId) },
      {
        $pull: {
          'playground.grounds': playgroundName,
          'playground.img': imageToRemove
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: 'Playground could not be deleted.' });
    }

    // Step 4 (Optional but recommended): Delete the city if it has no playgrounds left
    const updatedCity = await db.collection('cities').findOne({ _id: new ObjectId(cityId) });
    if (updatedCity.playground.grounds.length === 0) {
      await db.collection('cities').deleteOne({ _id: new ObjectId(cityId) });
      return res.status(200).json({ success: true, message: 'Playground and empty city deleted successfully!' });
    }

    res.status(200).json({ success: true, message: 'Playground deleted successfully!' });
  } catch (err) {
    console.error('Failed to delete playground:', err);
    res.status(500).json({ success: false, message: 'Server error while deleting playground.' });
  }
});
// --- ANALYTICS ENDPOINT ---
app.get('/analytics', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    const totalUsers = await db.collection('users').countDocuments();
    const totalBookings = await db.collection('postslots').countDocuments();
    
    const mostBooked = await db.collection('postslots').aggregate([
      { $group: { _id: "$name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();

    const totalRevenue = await db.collection('postslots').aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]).toArray();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBookings,
        mostBooked,
        // FIX: Safely access the total revenue
        totalRevenue: totalRevenue[0]?.total || 0,
      }
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ success: false, message: 'Server error fetching analytics.' });
  }
});
// In server.js, add these two new endpoints

// --- USER MANAGEMENT ENDPOINTS ---

// GET All Users (Admin Protected)
app.get('/admin/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    // Find all users but exclude their passwords from the result
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

// UPDATE User Status (Block/Unblock) (Admin Protected)
app.put('/admin/users/:userId/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    const { userId } = req.params;
    const { status } = req.body; // Expecting 'active' or 'blocked'

    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { status: status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, message: `User status has been updated to ${status}.` });
  } catch (err) {
    console.error("Failed to update user status:", err);
    res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
});

// Get admin time slots
app.get('/admintime', async (req, res) => {
  try {
    const timeSlots = await db.collection('admintimes').find().toArray();
    res.json({ 
      success: true,
      data: timeSlots 
    });
  } catch (err) {
    console.error('Failed to fetch admin times:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch time slots' 
    });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!' 
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Endpoint not found' 
  });
});

// Start Server
connectToDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});


