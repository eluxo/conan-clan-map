var mapMinZoom = 2
var mapMaxZoom = 6
var rangeX = [ -296000, 412000 ]
var rangeY = [ -292000, 353500 ]
var boundsX = [ 14.4, 230.7 ]
var boundsY = [ -47.7, -245.3 ]
//var boundsX = [0, 250];
//var boundsY = [0, 250];

// 0 - 250
/*
	var a = 553000;
	var b = -339900;
	var c = 555000;
	var d = -164605;
*/
var boundsX = [ 0.0, 250.0 ]
var boundsY = [ 0.0, -250.0 ]
var rangeX = [ -342036.0, 474460.0 ]
var rangeY = [ -445357.0, 368713.0 ]

function convertRange( value, r1, r2 ) {
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0]
}

function toLatLng(x, y) {
    return [ convertRange(y, rangeY, boundsY), convertRange(x, rangeX, boundsX) ]
}

function init() {
    const map = L.map('map', {
        minZoom: 2,
        maxZoom: 6,
        crs: L.CRS.Simple,
        attributionControl: false,
        zoomControl: false,
        maxBoundsViscosity: 1
    });

    const mapBounds = new L.LatLngBounds(
        map.unproject([0, 16128], mapMaxZoom),
        map.unproject([16128, 0], mapMaxZoom)
    );

    map.setMaxBounds(mapBounds);
    map.fitBounds(mapBounds);

    L.tileLayer('assets/tiles/{z}/{x}/{y}.png', {
        minZoom: mapMinZoom,
        maxZoom: mapMaxZoom,
        bounds: mapBounds,
        tms: false,
    }).addTo(map);

    return map;
}

async function fetch_clans(map) {
    const request = new Request('api/clans', {
        method: "GET",
    });

    const response = await fetch(request);
    const data = await response.json();
    for (const [id, entry] of Object.entries(data)) {
        const x = entry.bases[0].x;
        const y = entry.bases[0].y;
        const count = entry.bases[0].count;
        const name = entry.name;
        const marker = L.marker(toLatLng(x, y)).addTo(map).bindPopup(`${name}<br />Bauteile: ${count}`);

        marker.on('mouseover',function(ev) {
            marker.openPopup();
        });

        /*
        var myIcon = L.divIcon({
            html: name,
            className: 'clan-name-label'
        });
        L.marker(toLatLng(x, y), {icon: myIcon}).addTo(map);
        */
    }
}

async function load_map() {
    const map = init();
    await fetch_clans(map);
}

load_map();

