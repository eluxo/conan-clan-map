import { CRS, MapOptions, Map, LatLngBounds, TileLayer, LatLngExpression } from "leaflet";
import { MapType } from "./backend";

/**
 * Provides the required configuration parameters for each of the maps.
 */
export interface IMapViewConfig {
    getMapConfig(): import("leaflet").MapOptions | undefined;
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

    
    /**
     * Converts one directional values coordinate using the given bounds.
     * 
     * @param value The value to be converted.
     * @param r1 Map coordinate range.
     * @param r2 Game coordinate range.
     */
    private _convertRange(value: number, r1: number[], r2: number[]) {
        return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0]
    }
    
    /**
     * Converts a coordinate from the game coordinate system to the map
     * coordinate system.
     * 
     * @param x The x coordinate.
     * @param y The y coordinate.
     */
    public toLatLng(x: number, y: number): LatLngExpression {
        return [
            this._convertRange(y, this._rangeY, this._boundsY),
            this._convertRange(x, this._rangeX, this._boundsX)
        ]
    }

    /**
     * Getter for the map options.
     */
    public getMapConfig(): MapOptions {
        return {
            minZoom: this._minZoom,
            maxZoom: this._maxZoom,
            crs: CRS.Simple,
            attributionControl: false,
            zoomControl: false,
            maxBoundsViscosity: 1
        }
    }

    /**
     * Create layer on the map.
     * 
     * @param map The map to create the layer on.
     */
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


export class SavageWildsConfig extends ExiledLandsConfig {

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

