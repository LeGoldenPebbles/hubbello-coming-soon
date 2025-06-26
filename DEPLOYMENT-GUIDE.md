# Coming Soon Page - Deployment Guide

## Overview
This is a standalone coming-soon page with its own mini-server that can be deployed independently of your main platform.

## What's Included
- `index.html` - The coming soon page
- `style.css` - All styling
- `script.js` - Frontend functionality
- `server.js` - Mini Node.js server with MongoDB integration
- `package.json` - Dependencies
- `logo.png` - Your logo
- `LandingTop.mp4` - Background video

## Deployment Steps

### 1. Prepare Your Files
1. Copy `env-template.txt` to `.env`
2. Edit `.env` with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coming-soon
   PORT=3000
   NODE_ENV=production
   ```

### 2. Deploy to Hostinger (or any Node.js hosting)

#### Option A: Using Hostinger's Node.js Hosting
1. Upload all files to your domain folder
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Your page will be available at your domain

#### Option B: Using Hostinger's File Manager
1. Zip the entire `coming-soon` folder
2. Upload via File Manager
3. Extract in your public_html directory
4. Use Hostinger's Node.js app manager to set up the app

### 3. MongoDB Setup
You have two options:

#### Option A: Use Same Database as Main Platform
- Use the same MONGODB_URI from your main server
- Data will be saved to the same database but in a separate collection

#### Option B: Create Separate Database
- Create a new MongoDB database specifically for coming-soon emails
- Use a different database name in the connection string

### 4. Testing
1. Visit your deployed page
2. Try submitting an email with different interest selections
3. Check your MongoDB database for saved entries

## How It Works
1. User visits your domain
2. `server.js` serves the HTML page
3. When user submits email, it's sent to `/api/coming-soon/subscribe`
4. Server saves to MongoDB and returns success message
5. Frontend shows thank you modal

## File Structure After Deployment
```
your-domain.com/
├── index.html          (served at /)
├── style.css
├── script.js
├── server.js           (Node.js server)
├── package.json
├── .env               (your MongoDB config)
├── logo.png
├── LandingTop.mp4
└── node_modules/      (created by npm install)
```

## Environment Variables Needed
```
MONGODB_URI=mongodb+srv://...
PORT=3000
NODE_ENV=production
```

## Troubleshooting
- If emails aren't saving: Check MongoDB connection string
- If page doesn't load: Check if Node.js is running (`npm start`)
- If styling is broken: Ensure all files are in the same directory

## Next Steps
Once your main platform is ready:
1. Export the email list from MongoDB
2. Import into your main platform
3. Replace this coming-soon page with your full platform 