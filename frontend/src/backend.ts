export type MapType = 'exiled_lands' | 'savage_wilds';
export interface IMapInfo {
    name: string;
    id: string;
    type: MapType;
}
export type IMapList = IMapInfo[];


export interface IBaseInfo {
    x: number;
    y: number;
    count: number;
}

export interface IPlayerInfo {
    name: string;
    clanOwner: boolean;
}

export interface IClanInfo {
    name: string;
    bases: IBaseInfo[];
    players: IPlayerInfo[];
}

/**
 * Helper to communicate with the backend.
 */

export class ClanMapBackend {
    /**
     * Getter for the map list.
     */
    public async getMapList(): Promise<IMapList> {
        const request = new Request('api/maps', {
            method: "GET",
        });
    
        const response = await fetch(request);
        const data = await response.json();
        return data;
    }

    /**
     * Reads the clan information for a single map from the server.
     * 
     * @param mapId The map to read the clans list for.
     */
    public async getClanInfo(mapId: string): Promise<IClanInfo> {
        const request = new Request(`api/clans/${mapId}`, {
            method: "GET",
        });
    
        const response = await fetch(request);
        const data = await response.json();
        return data;
    }
}

