import { CRS, MapOptions, Map, LatLngBounds, TileLayer, LatLngExpression, map, LatLng, ImageOverlay, Marker, LatLngBoundsExpression } from "leaflet";
import { MapType } from "./backend";

/**
 * Provides the required configuration parameters for each of the maps.
 */
export interface IMapViewConfig {
    createMap(): Map;
    createLayer(clanMap: Map): void;
    /**
     * Converts a coordinate from the game coordinate system to the map
     * coordinate system.
     * 
     * @param x The x coordinate.
     * @param y The y coordinate.
     */
    toLatLng(x: number, y: number): LatLngExpression;
}

/**
 * Basic configuration for the exiled lands map.
 */
export class ExiledLandsConfig implements IMapViewConfig {
    private readonly _minZoom = 2
    private readonly _maxZoom = 6
    private readonly _rangeX = [ -296000, 412000 ];
    private readonly _rangeY = [ -292000, 353500 ];
    private readonly _boundsX = [ 14.4, 230.7 ];
    private readonly _boundsY = [ -47.7, -245.3 ];
    
    private _convertRange(value: number, r1: number[], r2: number[]) {
        return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0]
    }
    
    public toLatLng(x: number, y: number): LatLngExpression {
        return [
            this._convertRange(y, this._rangeY, this._boundsY),
            this._convertRange(x, this._rangeX, this._boundsX)
        ]
    }

    public createMap(): Map {
        return map('map', {
            minZoom: this._minZoom,
            maxZoom: this._maxZoom,
            crs: CRS.Simple,
            attributionControl: false,
            zoomControl: false,
            maxBoundsViscosity: 1
        });
    }

    public createLayer(clanMap: Map) {
        const mapBounds = new LatLngBounds(
            clanMap.unproject([0, 16128], this._maxZoom),
            clanMap.unproject([16128, 0], this._maxZoom)
        );
        
    
        clanMap.setMaxBounds(mapBounds);
        clanMap.fitBounds(mapBounds);
    
        (new TileLayer('assets/maps/el/tiles/{z}/{x}/{y}.png', {
            minZoom: this._minZoom,
            maxZoom: this._maxZoom,
            bounds: mapBounds,
            tms: false,
        })).addTo(clanMap);
    }
}


/**
 * Basic map configuration for savage wilds.
 */
export class SavageWildsConfig implements IMapViewConfig {
    private _bounds = { south: 400000, west: -400000, north: -400000, east: 400000 }
    private _minZoom = -8.7;
    private _maxZoom = -4;

    private _calculateBounds(): LatLngBoundsExpression {
        const southWest: LatLng = new LatLng(this._bounds.south, this._bounds.west);
        const northEast: LatLng = new LatLng(this._bounds.north, this._bounds.east);
        return  new LatLngBounds(
            southWest,
            northEast
        );
    }

    public createMap(): Map {
        return map('map', {
            crs: CRS.Simple,
            attributionControl: false,
            zoomControl: false,
            maxBoundsViscosity: 1,
            zoomSnap: 0.1,
            zoomDelta: 0.1,
            minZoom: this._minZoom,
            maxZoom: this._maxZoom
        });
    }

    createLayer(clanMap: Map): void {
        const bounds = this._calculateBounds();
        const overlay = new ImageOverlay('assets/maps/sw/map.jpg', bounds);
        overlay.addTo(clanMap);
        clanMap.fitBounds(bounds);
        (new Marker(this.toLatLng(29058.916016, 222980.8125))).addTo(clanMap);
    }

    toLatLng(x: number, y: number): LatLngExpression {
        return [-y, x];
    }

}

/**
 * Getter for the different map configurations.
 */
export class MapViewConfigFactory {
    /**
     * Getter for the view configuration for the given map.
     * 
     * @param mapType Type of the map.
     */
    public static getConfig(mapType: MapType): IMapViewConfig {
        if (mapType === 'exiled_lands') {
            return new ExiledLandsConfig();
        } else if (mapType === 'savage_wilds') {
            return new SavageWildsConfig();
        }
        throw new Error(`unknown map type ${mapType}`);
    }
}

