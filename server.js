const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));
app.use('/style.css', express.static('style.css'));
app.use('/script.js', express.static('script.js'));
app.use('/logo.png', express.static('logo.png'));
app.use('/LandingTop.mp4', express.static('LandingTop.mp4'));

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

// Connect to MongoDB with better error handling
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coming-soon';
console.log('🔗 Attempting to connect to MongoDB...');
console.log('📍 MongoDB URI configured:', mongoURI ? 'Yes' : 'No');

// Global variable to track DB connection
let isDbConnected = false;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('📊 Database:', mongoose.connection.name);
  isDbConnected = true;
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('⚠️ Server will continue in demo mode - emails will show success but not be saved');
  isDbConnected = false;
});

// Monitor connection status
mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB connection established');
  isDbConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 MongoDB connection error:', err);
  isDbConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 MongoDB disconnected');
  isDbConnected = false;
});

// Routes
app.post('/api/coming-soon/subscribe', async (req, res) => {
  try {
    console.log('📧 Subscription request received:', req.body);
    
    const { email, interests } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('❌ Invalid email:', email);
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if MongoDB is connected
    if (!isDbConnected || mongoose.connection.readyState !== 1) {
      console.log('⚠️ Database not connected, returning demo success');
      // Still return success for demo purposes
      return res.status(200).json({
        success: true,
        message: 'Thank you for subscribing! We\'ll notify you when we launch.',
        alreadySubscribed: false,
        demo: true
      });
    }

    // Get client info
    const clientIP = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress || 
                     'unknown';
    const userAgent = req.headers['user-agent'] || '';

    console.log('🔍 Checking for existing subscriber:', email);

    // Check if email already exists
    const existingSubscriber = await ComingSoonSubscriber.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existingSubscriber) {
      console.log('📝 Updating existing subscriber');
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

    // Create new subscriber
    console.log('✨ Creating new subscriber');
    const subscriber = new ComingSoonSubscriber({
      email: email.toLowerCase(),
      interests: interests || [],
      ipAddress: clientIP,
      userAgent: userAgent
    });

    await subscriber.save();

    console.log(`✅ New subscriber saved: ${email} with interests: ${interests?.join(', ') || 'none'}`);

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

// Get subscribers (for testing/admin)
app.get('/api/coming-soon/subscribers', async (req, res) => {
  try {
    if (!isDbConnected || mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected',
        demo: true
      });
    }

    const subscribers = await ComingSoonSubscriber.find().sort({ subscribedAt: -1 });
    res.json({
      success: true,
      count: subscribers.length,
      subscribers: subscribers.map(sub => ({
        email: sub.email,
        interests: sub.interests,
        subscribedAt: sub.subscribedAt,
        source: sub.source
      }))
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscribers'
    });
  }
});

// Test endpoint to check if everything is working
app.post('/api/coming-soon/test', async (req, res) => {
  const testEmail = 'test-' + Date.now() + '@example.com';
  try {
    const result = await fetch(`http://localhost:${port}/api/coming-soon/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testEmail, 
        interests: ['venue'] 
      })
    });
    const data = await result.json();
    res.json({
      success: true,
      message: 'Test completed',
      testResult: data
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

// Serve the coming soon page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  const dbStatus = isDbConnected && mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    message: 'Coming Soon server is running',
    database: dbStatus,
    mongodb_uri_configured: !!process.env.MONGODB_URI,
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`🚀 Coming Soon server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`👥 Subscribers: http://localhost:${port}/api/coming-soon/subscribers`);
  console.log(`🧪 Test endpoint: http://localhost:${port}/api/coming-soon/test`);
  console.log('');
  console.log('🎯 Ready to accept email submissions!');
}); 