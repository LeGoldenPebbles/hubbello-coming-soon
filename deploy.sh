#!/bin/bash

# EventConnect Coming Soon Page - Deployment Script
echo "🚀 Deploying EventConnect Coming Soon Page..."

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env from template..."
    cp env-template.txt .env
    echo "📝 Please edit .env with your MongoDB connection string"
    echo "   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database"
    read -p "Press Enter after editing .env file..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check MongoDB connection
echo "🔗 Testing MongoDB connection..."
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
"

if [ $? -eq 0 ]; then
    echo "🌟 Ready to launch!"
    echo "📋 Next steps:"
    echo "   1. Upload all files to your web hosting"
    echo "   2. Run 'npm start' on your server"
    echo "   3. Visit your domain to test"
    echo ""
    echo "🎯 To start locally: npm start"
else
    echo "❌ Please fix MongoDB connection in .env file"
fi 