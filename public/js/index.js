var map = L.map('map').setView([0, 0], 2);

L.tileLayer('/assets/tiles/{z}/{x}/{y}.png', {
    minZoom: 2,
    maxZoom: 6,
    attribution: ''
}).addTo(map);
