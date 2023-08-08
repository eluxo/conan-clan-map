const server = new ClanMapBackend();

var mapMinZoom = 2
var mapMaxZoom = 6
var rangeX = [ -296000, 412000 ]
var rangeY = [ -292000, 353500 ]
var boundsX = [ 14.4, 230.7 ]
var boundsY = [ -47.7, -245.3 ]

function convertRange( value, r1, r2 ) {
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0]
}

function toLatLng(x, y) {
    return [ convertRange(y, rangeY, boundsY), convertRange(x, rangeX, boundsX) ]
}


function initMap() {
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

async function drawClanMarkers(map, clans) {
    for (const [id, entry] of Object.entries(clans)) {
        const x = entry.bases[0].x;
        const y = entry.bases[0].y;
        const count = entry.bases[0].count;
        const name = entry.name;
        const playerBase = L.icon({
            iconUrl: 'assets/marker/base-red.png',
            iconSize: [20, 20],
            className: 'base-blue'
        });
        L.marker(toLatLng(x, y), { icon: playerBase })
            .addTo(map)
            .bindPopup(`${name}<br />Bauteile: ${count}`)
            .on('mouseover',function(ev) {
                this.openPopup();
            });
    }
}

async function loadMap(mapId) {
    const map = initMap();
    const clans = await server.getClanInfo(mapId);
    drawClanMarkers(map, clans);    
}

async function loadSelectedMap() {
    const mapId = location.hash.substring(1);
    const maps = await server.getMapList();
    const fallback = maps[0].id;

    for (const entry of maps) {
        if (mapId === entry.id) {
            console.log(`loading map with id ${mapId}`);
            return loadMap(mapId);
        }
    }

    console.log(`loading fallback as ${fallback} instead of ${mapId}`);
    return loadMap(fallback);
}
loadSelectedMap();

