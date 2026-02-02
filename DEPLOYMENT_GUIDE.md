# 🚀 Scotech Inventory PWA - Deployment Guide

Complete step-by-step guide to deploy your Scotech Inventory PWA.

## 📋 Prerequisites Checklist

- [ ] Node.js installed (v16+)
- [ ] Git installed
- [ ] GitHub account created
- [ ] Vercel account created
- [ ] Appwrite account created

## 🗄️ Part 1: Set Up Appwrite Database

### Step 1: Create Appwrite Project

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Sign up or log in
3. Click "Create Project"
4. Name it "Scotech Inventory"
5. Copy your **Project ID** - you'll need this later

### Step 2: Create Database

1. In your project, go to "Databases"
2. Click "Create Database"
3. Name it `scotech-inventory`
4. Copy the **Database ID**

### Step 3: Create Collections

Create these 4 collections:

#### Collection 1: Products
```
Name: products
Attributes:
- name (string, 255, required)
- sku (string, 100, required)
- price (double, required)
- description (string, 1000)
- category (string, 100)

Permissions:
- Any: Read, Create, Update, Delete
```

#### Collection 2: Inventory
```
Name: inventory
Attributes:
- productId (string, 255, required)
- name (string, 255, required)
- sku (string, 100)
- quantity (integer, required)
- price (double, required)

Permissions:
- Any: Read, Create, Update, Delete
```

#### Collection 3: Sales
```
Name: sales
Attributes:
- productId (string, 255, required)
- productName (string, 255, required)
- quantity (integer, required)
- amount (double, required)
- date (datetime, required)
- status (string, 50, required)

Permissions:
- Any: Read, Create, Update, Delete
```

#### Collection 4: Categories
```
Name: categories
Attributes:
- name (string, 100, required)
- description (string, 500)

Permissions:
- Any: Read, Create, Update, Delete
```

### Step 4: Add Sample Data (Optional)

Add some test data to each collection for testing.

## 📝 Part 2: Configure Your Project

### Step 1: Update Appwrite Config

Edit `public/src/scripts/config.js`:

```javascript
const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: 'YOUR_PROJECT_ID_HERE', // Paste your Project ID
    databaseId: 'scotech-inventory',
    collections: {
        products: 'products',
        sales: 'sales',
        inventory: 'inventory',
        categories: 'categories',
        users: 'users'
    }
};
```

Replace `YOUR_PROJECT_ID_HERE` with your actual Appwrite Project ID.

### Step 2: Create PWA Icons

You have two options:

#### Option A: Use Online Generator (Recommended)
1. Go to [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
2. Upload a logo (512x512 recommended)
3. Download the icon pack
4. Extract to `public/icons/` directory

#### Option B: Create Simple Placeholders
```bash
chmod +x generate-icons.sh
./generate-icons.sh
```

Then convert SVG to PNG using an online tool or:
```bash
# If you have ImageMagick installed
for size in 72 96 128 144 152 192 384 512; do
  convert icon-${size}x${size}.png.svg icon-${size}x${size}.png
done
```

## 💻 Part 3: GitHub Setup

### Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `scotech-inventory-pwa`
3. Keep it Public or Private (your choice)
4. Don't initialize with README (we already have one)
5. Click "Create repository"

### Step 2: Push Code to GitHub

```bash
# Initialize Git (if not already done)
cd scotech-inventory-pwa
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Scotech Inventory PWA"

# Add GitHub as remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/scotech-inventory-pwa.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🌐 Part 4: Deploy to Vercel

### Method A: Using Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in (use GitHub login for easier integration)
3. Click "Add New" → "Project"
4. Import your `scotech-inventory-pwa` repository
5. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave empty)
   - **Output Directory**: public
6. Click "Deploy"
7. Wait 1-2 minutes for deployment
8. Your app will be live at `https://scotech-inventory-pwa.vercel.app`

### Method B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd scotech-inventory-pwa
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? scotech-inventory-pwa
# - In which directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

## ✅ Part 5: Verify Deployment

### Check PWA Features

1. Open your deployed URL
2. Open Chrome DevTools (F12)
3. Go to "Application" tab
4. Verify:
   - ✅ Manifest is loaded
   - ✅ Service Worker is registered
   - ✅ Icons are present
   - ✅ App is installable

### Test Installation

**On Desktop (Chrome):**
1. Click the install icon in address bar
2. Click "Install"

**On Mobile:**
1. Open in Chrome/Safari
2. Tap menu (⋮)
3. Tap "Add to Home Screen"

### Test Offline Functionality

1. Open the app
2. Open DevTools
3. Go to Network tab
4. Check "Offline"
5. Refresh page - app should still work!

## 🎨 Part 6: Customization

### Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Branding

1. Replace app name in `manifest.json`
2. Update colors in `public/src/styles/main.css`
3. Replace icons with your logo
4. Update meta tags in `index.html`

## 🐛 Troubleshooting

### Issue: App not loading

**Solution:**
- Check browser console for errors
- Verify Appwrite credentials in `config.js`
- Check Vercel deployment logs

### Issue: Service Worker not registering

**Solution:**
- Ensure you're using HTTPS (Vercel provides this automatically)
- Clear browser cache and hard reload (Ctrl+Shift+R)
- Check `service-worker.js` path in console

### Issue: Database operations failing

**Solution:**
- Verify Appwrite Project ID and Database ID
- Check collection permissions (should allow Read/Write)
- Ensure collection names match in `config.js`

### Issue: Icons not showing

**Solution:**
- Verify icons exist in `public/icons/` directory
- Check manifest.json paths
- Ensure icons are PNG format (not SVG)

## 📱 Part 7: Testing on Mobile

### Android
```bash
# Using Chrome Remote Debugging
1. Enable USB debugging on Android
2. Connect phone to computer
3. Chrome → More Tools → Remote Devices
4. Open your Vercel URL on phone
5. Inspect from desktop
```

### iOS
```bash
# Using Safari Web Inspector
1. Enable Web Inspector on iPhone (Settings → Safari → Advanced)
2. Connect iPhone to Mac
3. Safari → Develop → [Your iPhone]
4. Open your Vercel URL on iPhone
5. Inspect from Mac
```

## 🚀 Next Steps

1. **Add Authentication**
   - Implement Appwrite Auth in `appwrite.js`
   - Add login/signup pages
   - Protect routes

2. **Add More Features**
   - Product categories
   - Advanced analytics
   - Export to PDF/Excel
   - Barcode scanning

3. **Optimize Performance**
   - Compress images
   - Minimize CSS/JS
   - Use lazy loading

4. **Marketing**
   - Create screenshots for PWA store
   - Submit to PWA directories
   - Share on social media

## 📚 Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Service Workers](https://developers.google.com/web/fundamentals/primers/service-workers)

## 🆘 Support

Need help? 
- Check GitHub issues
- Review Appwrite community forums
- Vercel support chat

---

**Congratulations! 🎉 Your Scotech Inventory PWA is now live!**
