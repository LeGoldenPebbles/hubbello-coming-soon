# Coming Soon Landing Page

A beautiful, modern "coming soon" landing page with email capture functionality. This standalone page showcases features for different user types (Attendees, Vendors, Organisers, and Venues) through an interactive carousel.

## ✨ Features

- **Interactive Carousel**: Auto-rotating showcase of platform features for different user types
- **Email Capture**: Integrated signup form with server-side storage
- **Modern Design**: Mint color theme (#00BD9D) with beautiful gradients and animations
- **Mobile Responsive**: Optimized for all device sizes
- **Accessibility**: Keyboard navigation and screen reader support
- **Touch Support**: Swipe navigation on mobile devices
- **Performance Optimized**: Lightweight with smooth animations

## 🎨 Design Highlights

- Beautiful floating circle animations
- Smooth carousel transitions with auto-rotation
- Mint gradient theme throughout
- Interactive hover effects
- Loading states and micro-interactions
- Thank you state after email submission

## 📁 File Structure

```
coming-soon/
├── index.html          # Main HTML file
├── style.css           # All styles with mint theme
├── script.js           # Interactive functionality
└── README.md           # This file
```

## 🚀 Deployment Options

### Option 1: Upload to Domain Root (Recommended)

1. **Upload the entire `coming-soon/` folder** to your domain root
2. **Point your domain** to serve `coming-soon/index.html` as the default page
3. **Update server endpoint** if needed (see Configuration section)

### Option 2: Subdomain Deployment

1. Create a subdomain (e.g., `soon.yourdomain.com`)
2. Upload the `coming-soon/` folder contents to the subdomain root
3. Configure DNS to point to the subdomain

### Option 3: Temporary Directory

1. Upload to a temporary directory (e.g., `/coming-soon/`)
2. Redirect your main domain to this directory
3. Switch back when ready to launch

## ⚙️ Configuration

### Server Integration

The page expects a server endpoint at `/api/coming-soon/subscribe` for email capture. Add this to your existing server:

```javascript
// Add to your server routes (server/routes/ folder)
app.post('/api/coming-soon/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Store email in database (see database model below)
    // Your implementation here
    
    res.json({
      success: true,
      message: 'Email registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});
```

### Database Model

Create a simple model for storing emails (add to `server/models/`):

```javascript
// server/models/ComingSoonSubscriber.js
const mongoose = require('mongoose');

const ComingSoonSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  notified: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('ComingSoonSubscriber', ComingSoonSubscriberSchema);
```

### Environment Variables

No additional environment variables needed. The page automatically detects the domain and makes requests to the same origin.

## 🎯 Customization

### Colors
The mint theme is defined in CSS variables at the top of `style.css`:

```css
:root {
    --mint-primary: #00BD9D;
    --mint-light: #00E5B8;
    --mint-dark: #009B82;
}
```

### Content
- **Company name**: Update "EventConnect" in `index.html`
- **Features**: Modify the carousel slides in `index.html`
- **Social links**: Update href attributes in the footer
- **Copy**: Change headlines and descriptions as needed

### Carousel Timing
Adjust auto-rotation speed in `script.js`:

```javascript
const CONFIG = {
    AUTO_ROTATE_INTERVAL: 5000, // 5 seconds
};
```

## 📱 Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Android Chrome
- **Features**: CSS Grid, Flexbox, Fetch API, Intersection Observer

## 🔧 Local Testing

1. **Simple HTTP Server** (Python):
   ```bash
   cd coming-soon
   python -m http.server 3000
   ```

2. **Node.js HTTP Server**:
   ```bash
   npx http-server coming-soon -p 3000
   ```

3. **Live Server** (VS Code extension): Right-click `index.html` → "Open with Live Server"

## 🚀 Go-Live Process

### Before Launch:
1. Upload `coming-soon/` folder to your domain
2. Test email capture functionality
3. Verify all links and animations work
4. Test on mobile devices

### When Ready to Launch:
1. **Replace coming soon page** with your main platform
2. **Export email list** from your database
3. **Send launch notification** to subscribers
4. **Archive coming soon folder** for future reference

## 💌 Email Campaign Integration

When ready to launch, you can:

1. **Export subscriber emails** from your database
2. **Import to email service** (Mailgun, SendGrid, etc.)
3. **Send launch announcement** with early access links
4. **Track conversions** from coming soon to platform signup

## 🔄 Switching to Full Platform

To switch from coming soon to your full platform:

1. **Backup coming soon files**
2. **Deploy your React app build** to the same location
3. **Update DNS/redirects** if needed
4. **Test full platform** functionality

## 📊 Analytics

Consider adding:
- **Google Analytics** for visitor tracking
- **Hotjar/FullStory** for user behavior analysis
- **Email click tracking** for launch campaign effectiveness

## 🛠️ Troubleshooting

### Email Submission Not Working
- Check server endpoint is accessible
- Verify CORS settings if on different domain
- Check browser console for errors

### Animations Not Smooth
- Ensure modern browser support
- Check if user has "reduced motion" preference
- Verify CSS animations are loading

### Mobile Issues
- Test touch/swipe functionality
- Verify responsive breakpoints
- Check mobile Safari compatibility

## 📝 Next Steps

1. **Deploy the coming soon page**
2. **Add server endpoint for email capture**
3. **Test thoroughly on all devices**
4. **Set up analytics and monitoring**
5. **Plan your launch campaign**

## 🎉 Features Showcase

The carousel highlights features for:

- **👥 Attendees**: Event discovery, booking, favorites, notifications
- **🏪 Vendors**: Business connections, growth tools, contract management
- **📋 Organisers**: Event creation, vendor connections, analytics, marketing
- **🏢 Venues**: Booking management, space showcase, flexible pricing

---

**Ready to launch?** Simply upload this folder and watch the signups roll in! 🚀 