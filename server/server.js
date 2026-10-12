require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./db/db');
const sneakerRoutes = require('./routes/sneakerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/sneakers', sneakerRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all handler for any requests that don't match the above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Initialize the application
async function initializeApp() {
  try {
    await connectDB();
    console.log('Database connected successfully');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}

initializeApp();

module.exports = app;
