# ☕ Café Finder - Discover Amazing Coffee Spots ✨

A beautiful, modern web app to discover nearby cafés with a stunning lilac theme and delightful animations.

![Café Finder](https://img.shields.io/badge/Status-Live-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=flat&logo=openstreetmap&logoColor=white)

## 🌟 Features

### 🗺️ **Interactive Map**
- **OpenStreetMap with Leaflet.js** - Fast, free, and reliable mapping
- **Real-time location detection** with fallback to Bengaluru
- **Smooth animations** with `flyTo` transitions
- **Custom café markers** with cute coffee cup icons

### ☕ **Smart Café Discovery**
- **OpenStreetMap Overpass API** integration for real café data
- **3km radius search** for comprehensive coverage
- **Multiple café types** detection (cafés, coffee shops, restaurants)
- **Mock rating system** (3.5-5 stars) for all cafés

### 🎲 **Interactive Features**
- **Random Café Suggestion** - Discover new spots with smooth map animation
- **Favorites System** - Save your favorite cafés with localStorage persistence
- **Beautiful Popups** - Rich café information cards with ratings
- **Favorites Modal** - Elegant management of saved cafés

### 🌸 **Stunning Design**
- **Gorgeous Lilac Theme** - Multi-layered gradient backgrounds
- **Cute Animations** - Floating bubbles, sparkles, and micro-interactions
- **Modern UI** - Glass-morphism effects and smooth transitions
- **Responsive Design** - Perfect on desktop and mobile

### ✨ **Delightful Animations**
- **Coffee cup wiggle** on logo hover
- **Button bounce effects** with emoji reveals
- **Floating elements** with gentle bob animations
- **Shimmer effects** across headers and cards
- **Sparkle trails** in modals and popups

## 🚀 Live Demo

[View Live Demo](https://your-username.github.io/cafe-finder) *(Replace with your actual GitHub Pages URL)*

## 📱 Screenshots

### Desktop View
*Beautiful lilac gradient background with floating animations*

### Mobile View
*Responsive design that works perfectly on all devices*

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mapping**: Leaflet.js with OpenStreetMap tiles
- **Data Source**: OpenStreetMap Overpass API
- **Storage**: localStorage for favorites persistence
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

## 🏃‍♂️ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cafe-finder.git
   cd cafe-finder
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in any modern browser
   open index.html
   # or
   python -m http.server 8000  # For local development server
   ```

3. **Allow location access** when prompted for the best experience

## 📁 Project Structure

```
cafe-finder/
├── index.html          # Main HTML structure
├── style.css           # Beautiful lilac-themed CSS with animations
├── script.js           # Core JavaScript functionality
├── README.md           # Project documentation
└── .gitignore         # Git ignore rules
```

## 🌍 API Information

### OpenStreetMap Overpass API
- **Primary Server**: `https://overpass-api.de/api/interpreter`
- **Fallback Server**: `https://overpass.kumi.systems/api/interpreter`
- **Rate Limits**: Fair usage policy (no API key required)
- **Coverage**: Excellent data for Indian cities

### Search Criteria
The app searches for:
- `amenity=cafe` (traditional cafés)
- `shop=coffee` (coffee shops)
- `amenity=restaurant` with `cuisine=coffee_shop`
- `amenity=fast_food` with `cuisine=coffee_shop`

## 🎨 Customization

### Changing Default Location
Edit `script.js` line 79:
```javascript
// Change coordinates to your preferred city
this.userLocation = { lat: 12.9716, lng: 77.5946 }; // Bengaluru
```

### Modifying Color Theme
Edit `style.css` for the main gradient:
```css
background: linear-gradient(135deg, #e8d5ff 0%, #c8a8e9 25%, #b794f6 50%, #a18cd6 75%, #9f7aea 100%);
```

### Adjusting Search Radius
Edit `script.js` line 132:
```javascript
const radius = 3000; // Change radius in meters
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 💖 Acknowledgments

- **OpenStreetMap** community for excellent mapping data
- **Leaflet.js** for the amazing mapping library
- **Font Awesome** for beautiful icons
- **Google Fonts** for the elegant Inter typeface

## 🐛 Bug Reports & Feature Requests

Found a bug or have a cool idea? [Open an issue](https://github.com/your-username/cafe-finder/issues) on GitHub!

---

**Made with 💜 and lots of ☕ in India**

*Perfect for discovering the amazing café culture in Indian cities like Bengaluru, Mumbai, Delhi, Chennai, and more!*
