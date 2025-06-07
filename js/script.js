// Initialize map
let map;
let markers = [];
let currentLocation = null;

// Dehri and Sasaram coordinates
const DEHRI_COORDINATES = [24.9025, 84.1822];
const SASARAM_COORDINATES = [24.9485, 84.0326];

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Leaflet to be fully loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet is not loaded');
        return;
    }

    try {
        // Initialize map centered between Dehri and Sasaram
        const centerLat = (DEHRI_COORDINATES[0] + SASARAM_COORDINATES[0]) / 2;
        const centerLng = (DEHRI_COORDINATES[1] + SASARAM_COORDINATES[1]) / 2;
        
        map = L.map('healthcare-map', {
            center: [centerLat, centerLng],
            zoom: 12,
            zoomControl: true,
            attributionControl: true
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Initialize location search
        initializeLocationSearch();
        
        // Initialize facility filters
        initializeFacilityFilters();

        // Add healthcare facilities
        addHealthcareFacilities();

        // Try to get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    currentLocation = [latitude, longitude];
                    map.setView(currentLocation, 13);
                    addUserMarker(currentLocation);
                    searchNearbyFacilities(currentLocation);
                },
                error => {
                    console.error('Error getting location:', error);
                    // Default to center location if geolocation fails
                    currentLocation = [centerLat, centerLng];
                    addUserMarker(currentLocation);
                    searchNearbyFacilities(currentLocation);
                }
            );
        } else {
            // If geolocation is not supported, use center coordinates
            currentLocation = [centerLat, centerLng];
            addUserMarker(currentLocation);
            searchNearbyFacilities(currentLocation);
        }

        // Force a resize event to ensure proper map rendering
        setTimeout(() => {
            map.invalidateSize();
        }, 100);

    } catch (error) {
        console.error('Error initializing map:', error);
    }
});

// Add healthcare facilities to the map
function addHealthcareFacilities() {
    const facilities = [
        // Dehri Hospitals
        {
            id: 'dh1',
            name: 'Sadar Hospital Dehri',
            type: 'hospital',
            lat: 24.9025,
            lng: 84.1822,
            address: 'Sadar Hospital Road, Dehri-on-Sone, Bihar',
            phone: '+91 6181 222222',
            hours: '24/7'
        },
        {
            id: 'dh2',
            name: 'Dehri Medical Center',
            type: 'hospital',
            lat: 24.9035,
            lng: 84.1832,
            address: 'Main Road, Dehri-on-Sone, Bihar',
            phone: '+91 6181 223344',
            hours: '8:00 AM - 8:00 PM'
        },
        {
            id: 'dh3',
            name: 'Sone Valley Hospital',
            type: 'hospital',
            lat: 24.9015,
            lng: 84.1812,
            address: 'Sone Valley Road, Dehri-on-Sone, Bihar',
            phone: '+91 6181 225566',
            hours: '24/7'
        },
        // Dehri Clinics
        {
            id: 'dc1',
            name: 'Dehri Family Clinic',
            type: 'clinic',
            lat: 24.9045,
            lng: 84.1842,
            address: 'Family Clinic Road, Dehri-on-Sone, Bihar',
            phone: '+91 6181 227788',
            hours: '9:00 AM - 7:00 PM'
        },
        {
            id: 'dc2',
            name: 'City Health Clinic',
            type: 'clinic',
            lat: 24.9005,
            lng: 84.1802,
            address: 'City Center, Dehri-on-Sone, Bihar',
            phone: '+91 6181 229900',
            hours: '8:00 AM - 8:00 PM'
        },
        // Dehri Pharmacies
        {
            id: 'dp1',
            name: 'Dehri Medical Store',
            type: 'pharmacy',
            lat: 24.9030,
            lng: 84.1825,
            address: 'Medical Store Road, Dehri-on-Sone, Bihar',
            phone: '+91 6181 223355',
            hours: '8:00 AM - 10:00 PM'
        },
        {
            id: 'dp2',
            name: 'City Pharmacy',
            type: 'pharmacy',
            lat: 24.9010,
            lng: 84.1810,
            address: 'Main Market, Dehri-on-Sone, Bihar',
            phone: '+91 6181 224466',
            hours: '8:00 AM - 9:00 PM'
        },
        // Sasaram Hospitals
        {
            id: 'sh1',
            name: 'Sasaram District Hospital',
            type: 'hospital',
            lat: 24.9485,
            lng: 84.0326,
            address: 'District Hospital Road, Sasaram, Bihar',
            phone: '+91 6184 222222',
            hours: '24/7'
        },
        {
            id: 'sh2',
            name: 'Sasaram Medical Center',
            type: 'hospital',
            lat: 24.9495,
            lng: 84.0336,
            address: 'Medical Center Road, Sasaram, Bihar',
            phone: '+91 6184 223344',
            hours: '24/7'
        },
        // Sasaram Clinics
        {
            id: 'sc1',
            name: 'Sasaram Family Clinic',
            type: 'clinic',
            lat: 24.9475,
            lng: 84.0316,
            address: 'Family Clinic Road, Sasaram, Bihar',
            phone: '+91 6184 225566',
            hours: '9:00 AM - 7:00 PM'
        },
        {
            id: 'sc2',
            name: 'City Health Center',
            type: 'clinic',
            lat: 24.9465,
            lng: 84.0306,
            address: 'Health Center Road, Sasaram, Bihar',
            phone: '+91 6184 227788',
            hours: '8:00 AM - 8:00 PM'
        },
        // Sasaram Pharmacies
        {
            id: 'sp1',
            name: 'Sasaram Medical Store',
            type: 'pharmacy',
            lat: 24.9480,
            lng: 84.0320,
            address: 'Medical Store Road, Sasaram, Bihar',
            phone: '+91 6184 229900',
            hours: '8:00 AM - 10:00 PM'
        },
        {
            id: 'sp2',
            name: 'City Pharmacy Sasaram',
            type: 'pharmacy',
            lat: 24.9470,
            lng: 84.0310,
            address: 'Main Market, Sasaram, Bihar',
            phone: '+91 6184 228899',
            hours: '8:00 AM - 9:00 PM'
        }
    ];

    facilities.forEach(facility => {
        addFacilityMarker(facility);
    });
}

// Initialize location search functionality
function initializeLocationSearch() {
    const searchInput = document.getElementById('location-search');
    const searchButton = document.getElementById('search-btn');

    // Set default value to Dehri
    searchInput.value = 'Dehri-on-Sone, Bihar, India';

    searchButton.addEventListener('click', () => {
        const location = searchInput.value.trim();
        if (location) {
            searchLocation(location);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const location = searchInput.value.trim();
            if (location) {
                searchLocation(location);
            }
        }
    });
}

// Search for a location using OpenStreetMap Nominatim API
async function searchLocation(query) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            currentLocation = [parseFloat(lat), parseFloat(lon)];
            map.setView(currentLocation, 13);
            addUserMarker(currentLocation);
            searchNearbyFacilities(currentLocation);
        } else {
            alert('Location not found. Please try a different search term.');
        }
    } catch (error) {
        console.error('Error searching location:', error);
        alert('Error searching location. Please try again.');
    }
}

// Add user marker to map
function addUserMarker(location) {
    // Remove existing user marker if any
    const existingMarker = document.querySelector('.user-marker');
    if (existingMarker) {
        existingMarker.remove();
    }

    // Add new user marker
    const userIcon = L.divIcon({
        className: 'user-marker',
        html: '<i class="fas fa-user-circle fa-2x" style="color: #4CAF50;"></i>',
        iconSize: [30, 30]
    });

    L.marker(location, { icon: userIcon }).addTo(map);
}

// Search for nearby healthcare facilities
async function searchNearbyFacilities(location) {
    clearMarkers();
    
    // Get Dehri hospitals
    const facilities = await getNearbyFacilities(location);
    
    facilities.forEach(facility => {
        addFacilityMarker(facility);
    });
}

// Clear all facility markers
function clearMarkers() {
    markers.forEach(marker => marker.remove());
    markers = [];
}

// Add facility marker to map
function addFacilityMarker(facility) {
    const icon = L.divIcon({
        className: 'facility-marker',
        html: `<i class="fas ${getFacilityIcon(facility.type)} fa-2x" style="color: ${getFacilityColor(facility.type)};"></i>`,
        iconSize: [30, 30]
    });

    const marker = L.marker([facility.lat, facility.lng], { icon })
        .bindPopup(createFacilityPopup(facility))
        .addTo(map);

    markers.push(marker);
}

// Get facility icon based on type
function getFacilityIcon(type) {
    switch (type) {
        case 'hospital':
            return 'fa-hospital';
        case 'pharmacy':
            return 'fa-pills';
        case 'clinic':
            return 'fa-clinic-medical';
        default:
            return 'fa-medical-kit';
    }
}

// Get facility color based on type
function getFacilityColor(type) {
    switch (type) {
        case 'hospital':
            return '#e74c3c';
        case 'pharmacy':
            return '#3498db';
        case 'clinic':
            return '#2ecc71';
        default:
            return '#95a5a6';
    }
}

// Create facility popup content
function createFacilityPopup(facility) {
    return `
        <div class="facility-popup">
            <h3>${facility.name}</h3>
            <p class="facility-type" style="display: none;">${facility.type}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${facility.address}</p>
            <p><i class="fas fa-phone"></i> ${facility.phone}</p>
            <p><i class="fas fa-clock"></i> ${facility.hours}</p>
            <div class="popup-actions">
                <button onclick="getDirections(${facility.lat}, ${facility.lng})">
                    <i class="fas fa-directions"></i> Get Directions
                </button>
                <button onclick="bookAppointment('${facility.id}')">
                    <i class="fas fa-calendar-check"></i> Book Appointment
                </button>
            </div>
        </div>
    `;
}

// Initialize facility filters
function initializeFacilityFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const filter = button.dataset.filter;
            filterFacilities(filter);
        });
    });
}

// Filter facilities based on type
function filterFacilities(type) {
    markers.forEach(marker => {
        const facilityType = marker.getPopup().getContent().querySelector('.facility-type').textContent;
        if (type === 'all' || facilityType === type) {
            marker.setOpacity(1);
        } else {
            marker.setOpacity(0.3);
        }
    });
}

// Get directions to facility
function getDirections(lat, lng) {
    if (currentLocation) {
        const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation[0]},${currentLocation[1]}&destination=${lat},${lng}`;
        window.open(url, '_blank');
    } else {
        alert('Please allow location access to get directions.');
    }
}

// Book appointment
function bookAppointment(facilityId) {
    // Implement appointment booking logic
    console.log('Booking appointment for facility:', facilityId);
}

// Get nearby facilities
async function getNearbyFacilities(location) {
    // Return Dehri hospitals
    return [
        {
            id: 'dh1',
            name: 'Sadar Hospital Dehri',
            type: 'hospital',
            lat: 24.9025,
            lng: 84.1822,
            address: 'Sadar Hospital Road, Dehri-on-Sone, Bihar',
            phone: '+91 6181 222222',
            hours: '24/7'
        },
        {
            id: 'dh2',
            name: 'Dehri Medical Center',
            type: 'hospital',
            lat: 24.9035,
            lng: 84.1832,
            address: 'Main Road, Dehri-on-Sone, Bihar',
            phone: '+91 6181 223344',
            hours: '8:00 AM - 8:00 PM'
        },
        {
            id: 'dh3',
            name: 'Sone Valley Hospital',
            type: 'hospital',
            lat: 24.9015,
            lng: 84.1812,
            address: 'Sone Valley Road, Dehri-on-Sone, Bihar',
            phone: '+91 6181 225566',
            hours: '24/7'
        },
        {
            id: 'dh4',
            name: 'Dehri General Hospital',
            type: 'hospital',
            lat: 24.9045,
            lng: 84.1842,
            address: 'General Hospital Road, Dehri-on-Sone, Bihar',
            phone: '+91 6181 227788',
            hours: '24/7'
        },
        {
            id: 'dh5',
            name: 'City Medical Center',
            type: 'hospital',
            lat: 24.9005,
            lng: 84.1802,
            address: 'City Center, Dehri-on-Sone, Bihar',
            phone: '+91 6181 229900',
            hours: '9:00 AM - 9:00 PM'
        }
    ];
}

// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
}); 