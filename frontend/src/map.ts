import { map, Marker, Icon, Map } from 'leaflet';
import { ClanMapBackend, IMapInfo, IMapList } from './backend';
import { IMapViewConfig, MapViewConfigFactory } from './mapviewconfig';

/**
 * A map showing our clan objects.
 */
export class ClanMapInstance {
    private readonly _info: IMapInfo;
    private readonly _config: IMapViewConfig;
    private readonly _clanMap: Map;

    /**
     * Constructor.
     * 
     * @param info The map information.
     */
    constructor(info: IMapInfo) {
        this._info = info;
        this._config = MapViewConfigFactory.getConfig(this._info.type);
        this._clanMap = map('map', this._config.getMapConfig());
        this._config.createLayer(this._clanMap);
    }

    /**
     * Shows the map pins for the different clans.
     */
    async update() {
        const clans = await (new ClanMapBackend()).getClanInfo(this._info.id);
        for (const [id, entry] of Object.entries(clans)) {
            const x = entry.bases[0].x;
            const y = entry.bases[0].y;
            const count = entry.bases[0].count;
            const name = entry.name;
            const playerBase = new Icon({
                iconUrl: 'assets/marker/base-red.png',
                iconSize: [20, 20],
                className: 'base-blue'
            });

            const pin = new Marker(this._config.toLatLng(x, y), { icon: playerBase });
            pin.addTo(this._clanMap);
            pin.bindPopup(`${name}<br />Bauteile: ${count}`);
            pin.on('mouseover',function(ev) {
                pin.openPopup();
            });
        }
    }
}

/**
 * Creates a new map controller object.
 */
export class MapController {
    private readonly _maps: IMapList;

    /**
     * Constrcutor.
     * 
     * @param maps List of the map object.
     */
    constructor(maps: IMapList) {
        console.log('create map controller for maps', maps);
        this._maps = maps;
    }

    /**
     * Checks, if the given map ID is valid.
     * 
     * @param mapId The map ID to be checked.
     */
    public isValidMapId(mapId: string): boolean {
        if (this.getMapById(mapId)) return true;
        return false;
    }

    /**
     * Returns the map object associated with a specific map ID.
     * 
     * @param mapId ID fo the map to be looked up.
     */
    public getMapById(mapId: string): IMapInfo | undefined {
        for (var i = 0; i < this._maps.length; ++i) {
            if (this._maps[i].id === mapId) return this._maps[i];
        }
        return undefined;
    }

    /**
     * Getter for the number of known maps.
     */
    public getMapCount(): number {
        return this._maps.length;
    }

    /**
     * Gets a map by its index in the array.
     * 
     * @param index The index to read the map for.
     */
    public getMapByIndex(index: number = 0): IMapInfo | undefined {
        if ((index >= this._maps.length) || (index < 0)) return undefined;
        return this._maps[index];
    }

    /**
     * Creates a map instance on the given map information.
     * 
     * @param info The info to create the map on.
     */
    public createMap(info: IMapInfo): ClanMapInstance {
        return new ClanMapInstance(info);
    }

    /**
     * Creates the map controller object.
     */
    public static async create(): Promise<MapController> {
        const backend = new ClanMapBackend();
        const maps = await backend.getMapList();
        return new MapController(maps);
    }
}

