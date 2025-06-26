const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from root
app.use(express.static(path.join(__dirname, '..')));

// MongoDB Schema for Coming Soon Subscribers
const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  interests: [{
    type: String,
    enum: ['attending', 'vendor', 'organising', 'venue'],
    required: false
  }],
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: 'coming-soon-page'
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

const ComingSoonSubscriber = mongoose.model('ComingSoonSubscriber', subscriberSchema);

// Global variable to track DB connection
let isDbConnected = false;

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coming-soon';
if (mongoURI) {
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    isDbConnected = true;
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    isDbConnected = false;
  });
}

// API Routes
app.post('/api/coming-soon/subscribe', async (req, res) => {
  try {
    const { email, interests } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (!isDbConnected) {
      return res.status(200).json({
        success: true,
        message: 'Thank you for subscribing! We\'ll notify you when we launch.',
        alreadySubscribed: false,
        demo: true
      });
    }

    const existingSubscriber = await ComingSoonSubscriber.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existingSubscriber) {
      if (interests && interests.length > 0) {
        existingSubscriber.interests = interests;
        await existingSubscriber.save();
      }
      
      return res.status(200).json({
        success: true,
        message: 'You\'re already subscribed! We\'ll notify you when we launch.',
        alreadySubscribed: true
      });
    }

    const subscriber = new ComingSoonSubscriber({
      email: email.toLowerCase(),
      interests: interests || [],
      ipAddress: req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || ''
    });

    await subscriber.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing! We\'ll notify you when we launch.',
      alreadySubscribed: false
    });

  } catch (error) {
    console.error('💥 Subscription error:', error);
    
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'You\'re already subscribed! We\'ll notify you when we launch.',
        alreadySubscribed: true
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb_connected: isDbConnected,
    mongodb_uri_configured: !!process.env.MONGODB_URI,
    timestamp: new Date().toISOString()
  });
});

module.exports = app; 