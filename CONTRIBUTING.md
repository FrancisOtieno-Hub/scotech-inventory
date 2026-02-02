# Contributing to Scotech Inventory PWA

Thank you for considering contributing to Scotech Inventory PWA! 🎉

## 🌟 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser and OS information

### Suggesting Features

1. Open an issue with the label "enhancement"
2. Describe the feature and its benefits
3. Provide examples or mockups if possible

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 💻 Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/scotech-inventory-pwa.git

# Install dependencies
cd scotech-inventory-pwa
npm install

# Start development server
npm run dev
```

## 📝 Code Style

### JavaScript
- Use ES6+ features
- Use meaningful variable names
- Add comments for complex logic
- Follow existing code structure

### CSS
- Use CSS custom properties for colors
- Follow BEM-like naming convention
- Keep selectors specific but not overly nested
- Group related styles together

### HTML
- Use semantic HTML5 elements
- Keep proper indentation
- Add ARIA labels for accessibility

## 🎨 Design Guidelines

- Maintain the warm earth tone color palette
- Keep the industrial-modern aesthetic
- Ensure responsive design works on all devices
- Test animations for smooth performance
- Follow the existing component patterns

## 🧪 Testing

Before submitting a PR:
- Test on Chrome, Firefox, Safari, Edge
- Test on mobile devices (iOS and Android)
- Test PWA installation
- Test offline functionality
- Check for console errors

## 📦 Adding Features

### Adding a New Page

1. Create HTML in `index.html`:
```html
<div id="newPage" class="page">
  <!-- Page content -->
</div>
```

2. Add navigation item:
```html
<a href="#new" class="nav-item" data-page="new">
  <!-- Icon and label -->
</a>
```

3. Add page logic in `app.js`:
```javascript
async loadNewPageData() {
  // Page loading logic
}
```

### Adding a New Component

1. Add HTML structure in appropriate page
2. Add styles in `components.css`
3. Add interactivity in `app.js`
4. Add animations in `animations.css` if needed

### Adding Appwrite Integration

1. Add method in `appwrite.js`:
```javascript
async newMethod() {
  try {
    // Appwrite logic
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
}
```

2. Call from `app.js`:
```javascript
const result = await appwriteService.newMethod();
if (result.success) {
  // Handle success
}
```

## 🔐 Security

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Validate all user inputs
- Sanitize data before display
- Follow OWASP guidelines

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community

## 💬 Questions?

Feel free to open an issue with the "question" label!

Thank you for contributing! 🙏
