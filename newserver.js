const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 3003;

app.use(express.json());

app.use(cors());

const mongoURI = 'mongodb://localhost:27017/';
const client = new MongoClient(mongoURI);

async function connectToDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

connectToDB();


app.get('/users', async (req, res) => {
  const db = client.db('project');
  const usersCollection = db.collection('users');

  try {
    const users = await usersCollection.find().toArray();
    res.json(users);
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});


app.get('/users/:id', async (req, res) => {
  const db = client.db('project');
  const usersCollection = db.collection('users');
  const id = req.params.id;

  try {
    const user = await usersCollection.findOne({ _id: ObjectId(id) });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error('Failed to fetch user:', err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});


app.get('/admin', async (req, res) => {
    const { email, password } = req.body;
    const db = client.db('project'); 
    const adminsCollection = db.collection('admins');
  
    try {
      const admin = await adminsCollection.find().toArray();
        res.json(admin);
    } catch (err) {
      console.error('Failed to find admin:', err);
      res.status(500).json({ message: 'Failed to find admin' });
    }
  });

app.post('/users', async (req, res) => {
    const { name, email, password, contact } = req.body;
    const db = client.db('project'); 
    const usersCollection = db.collection('users');
    console.log(usersCollection);
  
    try {
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const hashedPassword = bcrypt.hashSync(password, 10);
      await usersCollection.insertOne({ name, email, password: hashedPassword, contact });
      res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
      console.error('Failed to create user:', err);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });
  
  
app.post('/slots', async (req, res) => {
    const newSlots = req.body.slot;
    const db = client.db('project'); 
    const slotsCollection = db.collection('slots');
  
    try {
      const result = await slotsCollection.insertOne({
        name: req.body.name,
        date: req.body.date,
        slots: newSlots,
        id:req.body.id
      });
      console.log('Inserted new slots:', result.insertedId);
      res.status(201).json({ message: 'Slots added successfully' });
    } catch (err) {
      console.error('Failed to insert slots:', err);
      res.status(500).json({ message: 'Failed to add slots' });
    }
  });

  app.get('/slots', async (req, res) => {
    const db = client.db('project'); 
    const slotsCollection = db.collection('slots');
  
    try {
      const slots = await slotsCollection.find().toArray();
      res.json(slots);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      res.status(500).json({ message: 'Failed to fetch slots' });
    }
  });


app.put('/slots/:name/:date', async (req, res) => {
    const { name, date } = req.params;
    const { slot } = req.body;

    const db = client.db('project'); 
    const slotsCollection = db.collection('slots');

    try {
        const filter = { name: name, date: date };
        const update = { $set: { slots: slot } };
        const result = await slotsCollection.updateOne(filter, update);

        if (result.modifiedCount === 1) {
            res.json({ message: 'Slot updated successfully' });
        } else {
            res.status(404).json({ message: 'Slot not found' });
        }
    } catch (err) {
        console.error('Failed to update slot:', err);
        res.status(500).json({ message: 'Failed to update slot' });
    }
});
app.get('/slots/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
  
    try {
      const slot = await slot.findById(id);
      if (!slot) {
        return res.status(404).json({ error: 'Slot not found' });
      }
      res.json(slot);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });


app.put('/postslots/:id', async (req, res) => {
    const db = client.db('project');
    const slotsCollection = db.collection('postslots');
    const id = req.params.id;
  
    try {
      const filter = { _id: ObjectId(id) };
      const update = { $set: { slot: req.body.slot } };
      const result = await slotsCollection.updateOne(filter, update);
  
      if (result.modifiedCount === 1) {
        res.json({ message: 'Slot updated successfully' });
      } else {
        res.status(404).json({ message: 'Slot not found' });
      }
    } catch (err) {
      console.error('Failed to update slot:', err);
      res.status(500).json({ message: 'Failed to update slot' });
    }
  });


app.get('/postslots', async (req, res) => {
    const db = client.db('project'); 
    const slotsCollection = db.collection('postslots');
  
    try {
      const slots = await slotsCollection.find().toArray();
      res.json(slots);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      res.status(500).json({ message: 'Failed to fetch slots' });
    }
  });

  app.post('/postslots', async (req, res) => {
    const newSlots = req.body.slot;
    const db = client.db('project'); 
    const slotsCollection = db.collection('postslots');
   

    try {
      const result = await slotsCollection.insertOne({
        name: req.body.name,
        date: req.body.date,
        slots: newSlots
      });
      console.log('Inserted new slots:', result.insertedId);
      res.status(201).json({ message: 'Slots added successfully' });
    } catch (err) {
      console.error('Failed to insert slots:', err);
      res.status(500).json({ message: 'Failed to add slots' });
    }
});

app.put('/slots/:name/:date', async (req, res) => {
    const name = req.params.name;
    const date = req.params.date;
    const newData = req.body;
    const db = client.db('project'); 

    if (!db) {
        console.error('Database not connected');
        return res.status(500).json({ message: 'Database not connected' });
    }

    try {
        const slotsCollection = db.collection('slots');

        const result = await slotsCollection.updateOne(
            { id: name, date: date },
            { $set: newData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        console.log('Updated slot:', result.modifiedCount);
        res.status(200).json({ message: 'Slot updated successfully' });
    } catch (error) {
        console.error('Failed to update slot:', error);
        res.status(500).json({ message: 'Failed to update slot' });
    }
});

  app.delete('/postslots/:id', async (req, res) => {
    const _id = req.params.id;
    const db = client.db('project'); 
    const postslots = db.collection('postslots');
  
    try {
      const deletedRecord = await postslots.findByIdAndDelete(_id);
      if (!deletedRecord) {
        return res.status(404).json({ error: 'Record not found' });
      }
      res.json({ message: 'Record deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  
  app.get('/cities', async (req, res) => {
    const db = client.db('project'); 
    const citiesCollection = db.collection('cities');
  
    try {
      const cities = await citiesCollection.find().toArray();
      res.json(cities);
    } catch (err) {
      console.error('Failed to fetch cities:', err);
      res.status(500).json({ message: 'Failed to fetch cities' });
    }
  });

  
app.get('/admintime', async (req, res) => {
    const db = client.db('project'); 
    const slotsCollection = db.collection('admintimes');
  
    try {
      const slots = await slotsCollection.find().toArray();
      res.json(slots);
    } catch (err) {
      console.error('Failed to fetch admin slots:', err);
      res.status(500).json({ message: 'Failed to fetch admin slots' });
    }
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

