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
app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: 'user'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    // Return response
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

// ========== ADMIN ENDPOINTS ========== //

// Admin Registration
app.post('/admin/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    if (await db.collection('admins').findOne({ email })) {
      return res.status(400).json({ 
        success: false,
        message: 'Admin already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection('admins').insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      adminId: result.insertedId
    });
  } catch (err) {
    console.error('Failed to register admin:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to register admin' 
    });
  }
});

// Admin Login
// In server.js

app.post('/admin/login', async (req, res) => {
  try {
    // ADD THIS LINE to see what the form is sending
    console.log('--- LOGIN ATTEMPT ---');
    console.log('1. Received request body:', req.body);

    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const admin = await db.collection('admins').findOne({ email });
    
    // ADD THIS LINE to see what was found in the database
    console.log('2. Found admin in DB:', admin);
    
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // ADD THIS LINE to see the exact values being compared
    console.log('3. Comparing plain password:', password, 'with hash:', admin.password);

    const passwordMatch = await bcrypt.compare(password, admin.password);
    
    if (!passwordMatch) {
      console.log('4. Bcrypt comparison failed.'); // Added for clarity
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // ... rest of your successful login code
    console.log('5. Bcrypt comparison successful. Logging in.');

    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: excludePassword(admin)
    });
  } catch (err) {
    console.error('Failed to authenticate admin:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to authenticate' 
    });
  }
});
// ========== SLOT ENDPOINTS ========== //

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