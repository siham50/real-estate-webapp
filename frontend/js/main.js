/**
 * Real Estate - Frontend Logic
 * Gestion des filtres, de la carte Leaflet et du menu responsive
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Real Estate - Frontend initialisé avec succès');

    initMobileMenu();
    initFilterChips();
    initFavorites();
    initMap();
    fetchProperties();
});

/* ==========================================================================
   1. MENU BURGER RESPONSIVE
   ========================================================================== */
function initMobileMenu() {
    const burgerBtn = document.getElementById('burger-btn');
    const navMobile = document.getElementById('nav-mobile');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!burgerBtn || !navMobile) return;

    burgerBtn.addEventListener('click', () => {
        burgerBtn.classList.toggle('active');
        navMobile.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            burgerBtn.classList.remove('active');
            navMobile.classList.remove('open');
        });
    });
}

/* ==========================================================================
   2. FILTRES HORIZONTAUX (CHIPS) & RECHERCHE
   ========================================================================== */
function initFilterChips() {
    const chips = document.querySelectorAll('.filter-chip');
    const cards = document.querySelectorAll('.property-card');

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Mettre en surbrillance la chip active
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const filterValue = chip.getAttribute('data-filter');
            applyCardFilter(filterValue);
        });
    });
}

function applyCardFilter(typeFilter) {
    const cards = document.querySelectorAll('.property-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const cardType = card.getAttribute('data-type');
        if (typeFilter === 'Tous' || cardType === typeFilter) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    updateCount(visibleCount);
}

function handleSearch() {
    const cityInput = document.getElementById('search-city').value.trim().toLowerCase();
    const typeSelect = document.getElementById('search-type').value;
    const cards = document.querySelectorAll('.property-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const cardType = card.getAttribute('data-type');
        const cardCity = card.getAttribute('data-city').toLowerCase();
        const cardLocationText = card.querySelector('.card-location').textContent.toLowerCase();

        const matchesCity = !cityInput || cardCity.includes(cityInput) || cardLocationText.includes(cityInput);
        const matchesType = !typeSelect || cardType === typeSelect;

        if (matchesCity && matchesType) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Synchroniser avec les chips
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(c => {
        if (c.getAttribute('data-filter') === (typeSelect || 'Tous')) {
            c.classList.add('active');
        } else {
            c.classList.remove('active');
        }
    });

    updateCount(visibleCount);

    // Défilement doux vers les résultats
    const propertyList = document.getElementById('property-list');
    if (propertyList) {
        propertyList.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function updateCount(count) {
    const countElement = document.getElementById('properties-count');
    if (countElement) {
        countElement.textContent = `${count} bien${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}`;
    }
}

/* ==========================================================================
   3. INTERACTIONS FAVORIS
   ========================================================================== */
function initFavorites() {
    const favoriteBtns = document.querySelectorAll('.btn-favorite');
    favoriteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.classList.toggle('active');
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => btn.style.transform = 'scale(1)', 200);
        });
    });
}

/* ==========================================================================
   4. CARTE INTERACTIVE LEAFLET (CASABLANCA & ENVIRONS)
   ========================================================================== */
function initMap(lat = 33.5731, lng = -7.5898) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof L === 'undefined') return;

    // Initialisation de la carte
    const map = L.map('map', {
        scrollWheelZoom: false
    }).setView([lat, lng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Marqueurs de démonstration à Casablanca
    const demoMarkers = [
        {
            lat: 33.5350,
            lng: -7.6320,
            title: "Villa Contemporaine Californie",
            price: "4 850 000 DH",
            type: "À VENDRE",
            img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=300&q=80"
        },
        {
            lat: 33.5890,
            lng: -7.6300,
            title: "Penthouse de Prestige Gauthier",
            price: "3 200 000 DH",
            type: "À VENDRE",
            img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80"
        },
        {
            lat: 33.5650,
            lng: -7.6580,
            title: "Plateau Bureau Finance City (CFC)",
            price: "26 000 DH / mois",
            type: "À LOUER",
            img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80"
        },
        {
            lat: 33.5950,
            lng: -7.6650,
            title: "Appartement Front de Mer Aïn Diab",
            price: "15 000 DH / mois",
            type: "À LOUER",
            img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80"
        }
    ];

    demoMarkers.forEach(item => {
        const marker = L.marker([item.lat, item.lng]).addTo(map);

        const popupContent = `
            <div class="map-popup-card">
                <img src="${item.img}" alt="${item.title}" class="map-popup-img" />
                <div class="map-popup-price">${item.price}</div>
                <div class="map-popup-title">${item.title}</div>
                <span style="font-size:0.75rem; color:#64748b;">${item.type}</span>
            </div>
        `;

        marker.bindPopup(popupContent);
    });
}

/* ==========================================================================
   5. APPEL API VERS LE BACKEND SPRING BOOT
   ========================================================================== */
async function fetchProperties() {
    try {
        const response = await fetch('http://localhost:8080/api/properties');
        if (!response.ok) throw new Error('Erreur API');
        const data = await response.json();
        console.log('Annonces reçues depuis le backend :', data);
    } catch (error) {
        console.info('API Spring Boot non connectée : affichage des annonces de démonstration.');
    }
}
