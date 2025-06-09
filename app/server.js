const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb'); // Added ObjectId

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
// Serve static files (like index.html) from the current directory
app.use(express.static(__dirname));

// --- MongoDB Configuration ---
// These credentials and host should match your Docker MongoDB container setup
const mongoUsername = 'admin';
const mongoPassword = 'pass';
const mongoHost = 'todo-mongo-local1';  //todo-mongo-local1 or local host // Node.js app is on host, so it connects to MongoDB container via localhost
const mongoPort = '27017';

const dbName = 'todoDB'; // Our database name
const collectionName = 'todos'; // Our collection name

// Connection URI
const uri = `mongodb://${mongoUsername}:${mongoPassword}@${mongoHost}:${mongoPort}/${dbName}?authSource=admin`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let todosCollection; // To hold our MongoDB collection object

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db(dbName);
    todosCollection = db.collection(collectionName);
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    console.error("Make sure your MongoDB Docker container is running and accessible at " + uri);
    // It's usually better to let the app crash if it can't connect to the DB on startup
    // You might add retry logic for production, but for learning, failing fast is good.
    process.exit(1);
  }
}

// Connect to MongoDB when the application starts
connectToMongoDB();

// --- API Endpoints ---

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get all to-do items
app.get('/todos', async (req, res) => {
  try {
    if (!todosCollection) {
        return res.status(500).send('Database not initialized');
    }
    const todos = await todosCollection.find({}).toArray();
    res.json(todos);
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).send('Error fetching to-do items');
  }
});

// Add a new to-do item
app.post('/todos', async (req, res) => {
  try {
    if (!todosCollection) {
        return res.status(500).send('Database not initialized');
    }
    const { text } = req.body;
    if (!text) {
      return res.status(400).send('To-do item text is required');
    }
    const result = await todosCollection.insertOne({ text, completed: false });
    // Use acknowledged and insertedId for modern driver versions
    res.status(201).json({ _id: result.insertedId, text, completed: false });
  } catch (err) {
    console.error('Error adding todo:', err);
    res.status(500).send('Error adding to-do item');
  }
});

// Delete a to-do item
app.delete('/todos/:id', async (req, res) => {
  try {
    if (!todosCollection) {
        return res.status(500).send('Database not initialized');
    }
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send('Invalid ID format');
    }

    const result = await todosCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).send('To-do item not found');
    }
    res.status(204).send(); // No content for successful deletion
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).send('Error deleting to-do item');
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`To-Do app listening at http://localhost:${port}`);
  console.log(`Connecting to MongoDB at: ${uri}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    if (client) {
        await client.close();
        console.log('MongoDB connection closed.');
    }
    process.exit(0);
});