// Café Finder App - Main JavaScript File

class CafeFinder {
    constructor() {
        this.map = null;
        this.cafes = [];
        this.favorites = this.loadFavorites();
        this.userLocation = null;
        this.markers = new Map();
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.initializeMap();
        this.hideLoading();
    }

    setupEventListeners() {
        // Random café button
        document.getElementById('randomCafeBtn').addEventListener('click', () => {
            this.suggestRandomCafe();
        });

        // Favorites button
        document.getElementById('favoritesBtn').addEventListener('click', () => {
            this.showFavoritesModal();
        });

        // Close modal
        document.getElementById('closeFavoritesModal').addEventListener('click', () => {
            this.hideFavoritesModal();
        });

        // Close modal on backdrop click
        document.getElementById('favoritesModal').addEventListener('click', (e) => {
            if (e.target.id === 'favoritesModal') {
                this.hideFavoritesModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideFavoritesModal();
            }
        });
    }

    async initializeMap() {
        try {
            // Get user's location
            this.userLocation = await this.getUserLocation();
            
            // Initialize map
            this.map = L.map('map').setView([this.userLocation.lat, this.userLocation.lng], 15);

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 18
            }).addTo(this.map);

            // Add user location marker
            this.addUserMarker();

            // Update location status
            this.updateLocationStatus('Location found! Loading cafés...');

            // Fetch and display cafés
            await this.fetchNearbyCafes();

        } catch (error) {
            console.error('Error initializing map:', error);
            this.updateLocationStatus('Unable to get location. Showing Bengaluru area.');
            
            // Fallback to a default location (Bengaluru, India)
            this.userLocation = { lat: 12.9716, lng: 77.5946 };
            this.map = L.map('map').setView([this.userLocation.lat, this.userLocation.lng], 12);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 18
            }).addTo(this.map);

            await this.fetchNearbyCafes();
        }
    }

    getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    addUserMarker() {
        const userIcon = L.divIcon({
            className: 'user-marker',
            html: '<div style="background: #667eea; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.5);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        L.marker([this.userLocation.lat, this.userLocation.lng], { icon: userIcon })
            .addTo(this.map)
            .bindPopup('<div style="text-align: center; padding: 0.5rem;"><strong>📍 You are here</strong></div>');
    }

    async fetchNearbyCafes() {
        try {
            const radius = 3000; // 3km radius for better coverage in India
            const overpassQuery = `
                [out:json][timeout:30];
                (
                  node["amenity"="cafe"](around:${radius},${this.userLocation.lat},${this.userLocation.lng});
                  way["amenity"="cafe"](around:${radius},${this.userLocation.lat},${this.userLocation.lng});
                  relation["amenity"="cafe"](around:${radius},${this.userLocation.lat},${this.userLocation.lng});
                  node["amenity"="restaurant"]["cuisine"="coffee_shop"](around:${radius},${this.userLocation.lat},${this.userLocation.lng});
                  node["shop"="coffee"](around:${radius},${this.userLocation.lat},${this.userLocation.lng});
                  node["amenity"="fast_food"]["cuisine"="coffee_shop"](around:${radius},${this.userLocation.lat},${this.userLocation.lng});
                );
                out geom;
            `;

            // Try primary Overpass API server
            let response;
            try {
                response = await fetch('https://overpass-api.de/api/interpreter', {
                    method: 'POST',
                    body: overpassQuery,
                    headers: {
                        'Content-Type': 'text/plain',
                    }
                });
            } catch (error) {
                // Fallback to alternative Overpass server
                console.log('Primary server failed, trying fallback...');
                response = await fetch('https://overpass.kumi.systems/api/interpreter', {
                    method: 'POST',
                    body: overpassQuery,
                    headers: {
                        'Content-Type': 'text/plain',
                    }
                });
            }

            if (!response.ok) {
                throw new Error('Failed to fetch café data');
            }

            const data = await response.json();
            this.processCafeData(data.elements);
            this.updateLocationStatus(`Found ${this.cafes.length} cafés nearby`);

        } catch (error) {
            console.error('Error fetching cafés:', error);
            this.updateLocationStatus('Error loading cafés. Please try again.');
            
            // Add some mock cafés for demo purposes
            this.addMockCafes();
        }
    }

    processCafeData(elements) {
        this.cafes = [];
        
        elements.forEach(element => {
            let lat, lng, name;
            
            // Handle different element types
            if (element.type === 'node') {
                lat = element.lat;
                lng = element.lon;
            } else if (element.type === 'way' && element.geometry && element.geometry.length > 0) {
                // Use center of way
                const center = this.calculateCenter(element.geometry);
                lat = center.lat;
                lng = center.lng;
            } else {
                return; // Skip if we can't determine location
            }

            // Get café name with fallbacks for Indian establishments
            name = element.tags?.name || 
                   element.tags?.brand || 
                   element.tags?.operator || 
                   element.tags?.["name:en"] ||
                   element.tags?.["name:hi"] ||
                   'Local Café';
            
            // Skip if no useful name available
            if (name === 'Local Café' && !element.tags?.name && !element.tags?.brand) {
                return;
            }

            const cafe = {
                id: element.id,
                name: name,
                lat: lat,
                lng: lng,
                rating: this.generateMockRating(),
                tags: element.tags || {}
            };

            this.cafes.push(cafe);
            this.addCafeMarker(cafe);
        });
    }

    calculateCenter(geometry) {
        let latSum = 0;
        let lngSum = 0;
        
        geometry.forEach(point => {
            latSum += point.lat;
            lngSum += point.lon;
        });
        
        return {
            lat: latSum / geometry.length,
            lng: lngSum / geometry.length
        };
    }

    generateMockRating() {
        // Generate rating between 3.5 and 5.0
        const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
        return parseFloat(rating);
    }

    addMockCafes() {
        // Add some mock cafés around the user's location for demo
        const mockCafes = [
            { name: "Café Coffee Day", offset: [0.005, 0.005] },
            { name: "Third Wave Coffee", offset: [-0.003, 0.007] },
            { name: "Blue Tokai Coffee", offset: [0.008, -0.004] },
            { name: "Starbucks Reserve", offset: [-0.006, -0.008] },
            { name: "The Coffee Bean & Tea Leaf", offset: [0.002, -0.009] },
            { name: "Barista Coffee", offset: [0.007, 0.003] },
            { name: "Chaayos", offset: [-0.004, -0.005] },
            { name: "Doolally Taproom", offset: [0.009, -0.007] },
            { name: "The Filter Coffee", offset: [-0.008, 0.006] },
            { name: "Brew & Bake", offset: [0.003, -0.008] }
        ];

        mockCafes.forEach((mock, index) => {
            const cafe = {
                id: `mock_${index}`,
                name: mock.name,
                lat: this.userLocation.lat + mock.offset[0],
                lng: this.userLocation.lng + mock.offset[1],
                rating: this.generateMockRating(),
                tags: {}
            };
            
            this.cafes.push(cafe);
            this.addCafeMarker(cafe);
        });
    }

    addCafeMarker(cafe) {
        const isFavorite = this.isFavorite(cafe.id);
        
        const cafeIcon = L.divIcon({
            className: 'cafe-marker',
            html: `<div class="cafe-marker ${isFavorite ? 'favorite' : ''}">☕</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        const marker = L.marker([cafe.lat, cafe.lng], { icon: cafeIcon })
            .addTo(this.map)
            .bindPopup(this.createCafePopup(cafe));

        this.markers.set(cafe.id, marker);
    }

    createCafePopup(cafe) {
        const isFavorite = this.isFavorite(cafe.id);
        const stars = '⭐'.repeat(Math.floor(cafe.rating));
        
        return `
            <div class="cafe-popup">
                <div class="cafe-header">
                    <div class="cafe-name">${cafe.name}</div>
                    <div class="cafe-rating">${stars} ${cafe.rating}/5</div>
                </div>
                <div class="cafe-body">
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="cafeFinder.toggleFavorite('${cafe.id}')">
                        <i class="fas fa-heart"></i>
                        ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                </div>
            </div>
        `;
    }

    toggleFavorite(cafeId) {
        const cafe = this.cafes.find(c => c.id == cafeId);
        if (!cafe) return;

        if (this.isFavorite(cafeId)) {
            // Remove from favorites
            this.favorites = this.favorites.filter(f => f.id != cafeId);
        } else {
            // Add to favorites
            this.favorites.push(cafe);
        }

        this.saveFavorites();
        this.updateCafeMarker(cafe);
        this.updateFavoritesDisplay();
    }

    updateCafeMarker(cafe) {
        const marker = this.markers.get(cafe.id);
        if (marker) {
            const isFavorite = this.isFavorite(cafe.id);
            
            const cafeIcon = L.divIcon({
                className: 'cafe-marker',
                html: `<div class="cafe-marker ${isFavorite ? 'favorite' : ''}">☕</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            marker.setIcon(cafeIcon);
            marker.setPopupContent(this.createCafePopup(cafe));
        }
    }

    isFavorite(cafeId) {
        return this.favorites.some(fav => fav.id == cafeId);
    }

    loadFavorites() {
        try {
            const stored = localStorage.getItem('cafeFinder_favorites');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem('cafeFinder_favorites', JSON.stringify(this.favorites));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }

    suggestRandomCafe() {
        if (this.cafes.length === 0) {
            alert('No cafés found yet. Please wait for the data to load.');
            return;
        }

        const randomCafe = this.cafes[Math.floor(Math.random() * this.cafes.length)];
        
        // Fly to the café with smooth animation
        this.map.flyTo([randomCafe.lat, randomCafe.lng], 17, {
            animate: true,
            duration: 2
        });

        // Open the popup after animation
        setTimeout(() => {
            const marker = this.markers.get(randomCafe.id);
            if (marker) {
                marker.openPopup();
            }
        }, 2100);

        this.updateLocationStatus(`🎲 Suggested: ${randomCafe.name}`);
    }

    showFavoritesModal() {
        this.updateFavoritesDisplay();
        document.getElementById('favoritesModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    hideFavoritesModal() {
        document.getElementById('favoritesModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    updateFavoritesDisplay() {
        const favoritesList = document.getElementById('favoritesList');
        const noFavorites = document.getElementById('noFavorites');

        if (this.favorites.length === 0) {
            favoritesList.style.display = 'none';
            noFavorites.style.display = 'block';
        } else {
            favoritesList.style.display = 'block';
            noFavorites.style.display = 'none';
            
            favoritesList.innerHTML = this.favorites.map(cafe => `
                <div class="favorite-item">
                    <div class="favorite-info">
                        <h3>${cafe.name}</h3>
                        <div class="favorite-rating">⭐ ${cafe.rating}/5</div>
                    </div>
                    <div class="favorite-actions">
                        <button class="btn btn-primary btn-small" onclick="cafeFinder.goToCafe('${cafe.id}')">
                            <i class="fas fa-map-marker-alt"></i> View
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="cafeFinder.toggleFavorite('${cafe.id}')">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    goToCafe(cafeId) {
        const cafe = this.cafes.find(c => c.id == cafeId);
        if (cafe) {
            this.hideFavoritesModal();
            this.map.flyTo([cafe.lat, cafe.lng], 17, {
                animate: true,
                duration: 1.5
            });
            
            setTimeout(() => {
                const marker = this.markers.get(cafe.id);
                if (marker) {
                    marker.openPopup();
                }
            }, 1600);
        }
    }

    updateLocationStatus(message) {
        const statusElement = document.getElementById('locationStatus');
        if (statusElement) {
            statusElement.querySelector('span').textContent = message;
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                statusElement.style.opacity = '0.7';
            }, 5000);
        }
    }

    hideLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.opacity = '0';
            setTimeout(() => {
                loadingElement.style.display = 'none';
            }, 300);
        }
    }
}

// Initialize the app when DOM is loaded
let cafeFinder;

document.addEventListener('DOMContentLoaded', () => {
    cafeFinder = new CafeFinder();
});

// Make cafeFinder globally accessible for popup buttons
window.cafeFinder = null;
window.addEventListener('load', () => {
    window.cafeFinder = cafeFinder;
});
