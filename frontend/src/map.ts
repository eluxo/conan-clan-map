import { Marker, Icon, Map } from 'leaflet';
import { ClanMapBackend, IClanInfo, IMapInfo, IMapList } from './backend';
import { IMapViewConfig, MapViewConfigFactory } from './mapviewconfig';
import { ServerMenu } from './servermenu';


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
        this._clanMap = this._config.createMap();
        this._config.createLayer(this._clanMap);
    }

    /**
     * Shows the map pins for the different clans.
     */
    async update() {
        const clans = await (new ClanMapBackend()).getClanInfo(this._info.id);
        const $this = this;
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
                $this.updateCard(entry);
            });
        }
    }

    /**
     * Update the clan info card.
     *
     * @param entry The entry to be added to the clan info card.
     */
    public updateCard(entry: IClanInfo) {
        const x = entry.bases[0].x;
        const y = entry.bases[0].y;
        const count = entry.bases[0].count;

        const clanCard = document.getElementById("clanCard");
        if (clanCard) clanCard.classList.remove("invisible");
        this._setText("cardClanName", entry.name);
        this._setText("clanPieces", `${count}`);
        this._setText("clanX", `${x.toFixed(3)}`);
        this._setText("clanY", `${y.toFixed(3)}`);
        const clanMembers = document.getElementById("clanMembers");
        if (clanMembers) {
            clanMembers.innerHTML = '';
            var first = true;
            entry.players.forEach((player) => {
                const entry = document.createElement("span");
                if (first) {
                    first = false;
                    entry.innerText = player.name;
                } else {
                    entry.innerText = `, ${player.name}`;
                }
                if (player.clanOwner) entry.style.textDecoration = "underline";
                clanMembers.appendChild(entry);
            });
        }
    }

    private _setText(id: string, text: string) {
        const element = document.getElementById(id);
        if (!element) return;
        element.innerText = text;
    }
}

/**
 * Creates a new map controller object.
 */
export class MapController {
    private readonly _maps: IMapList;
    private _serverMenu?: ServerMenu;

    /**
     * Constrcutor.
     * 
     * @param maps List of the map object.
     */
    constructor(maps: IMapList, serverMenu: HTMLElement | null) {
        console.log('create map controller for maps', maps);
        this._maps = maps;
        if (serverMenu) {
            this._serverMenu = new ServerMenu(serverMenu);
            this._serverMenu.setMaps(maps);
        }
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
    public getMapById(mapId?: string): IMapInfo | undefined {
        if (!mapId) return undefined;
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
        this._serverMenu?.setActive(info);
        return new ClanMapInstance(info);
    }

    /**
     * Creates the map controller object.
     */
    public static async create(): Promise<MapController> {
        const backend = new ClanMapBackend();
        const maps = await backend.getMapList();
        const serverMenu = document.getElementById("serverMenuArea");
        return new MapController(maps, serverMenu);
    }
}

