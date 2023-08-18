import { IMapInfo, IMapList } from "./backend";

/**
 * Controller for the server selection button.
 */
export class ServerMenu {
    private readonly _serverMenu: HTMLElement;
    private readonly _links = new Map<string, HTMLElement>();

    /**
     * Constructor.
     * 
     * @param serverMenu The server menu HTML element.
     */
    constructor(serverMenu: HTMLElement) {
        this._serverMenu = serverMenu;
    }

    /**
     * Sets the map marked as active.
     * 
     * This will not unset any avtive map.
     * 
     * @param map The active map.
     */
    public setActive(map: IMapInfo) {
        const link = this._links.get(map.id);
        if (!link) return;
        link.classList.add("active");
    }

    /**
     * Updates the maps in the menu.
     * 
     * @param maps The map list to be set.
     */
    public setMaps(maps: IMapList) {
        this._serverMenu.innerHTML = '';
        maps.forEach((map) => {
            const entry = document.createElement("li");
            entry.classList.add("nav-item");
            
            const link = document.createElement("a");
            link.classList.add("nav-link");
            link.href = `?map=${map.id}`;
            link.innerText = map.name;
            
            entry.appendChild(link);
            this._links.set(map.id, link);

            this._serverMenu.appendChild(entry);
        });
    }
}

