import sqlite3 from 'sqlite3';
import fs, { FSWatcher } from 'fs';
import { IMapConfigEntry } from '../config';
import { IClanLocationProvider, NaiveClanLocationProvider } from "./clans";

/**
 * Details on a single map object.
 */
export class MapDetailsObject {
    private readonly _name: string;
    private readonly _database: string;
    private readonly _id: string;
    private readonly _type: 'exiled_lands' | 'savage_wilds';
    private _watcher?: FSWatcher;
    private _timeout?: NodeJS.Timeout;
    
    private _clanLocationProvider: IClanLocationProvider;

    /**
     * Constructor.
     * 
     * @param id ID of the map.
     * @param name Name of the map as user readable string.
     * @param database File of the database.
     */
    constructor(id: string, config: IMapConfigEntry) {
        this._id = id;
        this._name = config.name;
        this._database = config.file;
        this._type = config.type;
        this._clanLocationProvider = new NaiveClanLocationProvider();
    }

    /**
     * Getter for the public data.
     * 
     * The resulting object may be delivered to the user.
     */
    public getPublicData() {
        return {
            name: this._name,
            id: this._id,
            type: this._type
        }
    }

    /**
     * Getter for the clan location provider.
     */
    public getClanProvider() {
        return this._clanLocationProvider;
    }

    /**
     * Opens and reads the database file to make sure that all map information
     * is up to date.
     */
    public async update(): Promise<void> {
        console.log(`reading ${this._database}`);

        const db = new sqlite3.Database(this._database);
        await this._clanLocationProvider.refresh(db);

        if (!this._watcher) {
            console.log(`regiser file watcher on ${this._database}`);
            this._watcher = fs.watch(this._database, this._onDbChangedEvent.bind(this));
        }

        return new Promise<void>((resolve, reject) => {
            db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Called whenever the database file has changed.
     */
    private async _onDbChangedEvent() {
        if (this._timeout) {
            clearTimeout(this._timeout);
        } else {
            console.log(`schedule refresh of ${this._database}`);
        }
        this._timeout = setTimeout(async () => {
            try {
                await this.update();
            } catch (err) {
                console.log("failed to update data", err);
            }    
            this._timeout = undefined;
        }, 5000);
    }
    
}

/**
 * Helper class to provide the different map objects.
 */
export class MapProvider {
    private _maps: { [id: string]: MapDetailsObject } = {};

    /**
     * Constructor.
     */
    constructor() {
    }

    /**
     * Registers a new map. This call will also read out the database, so the
     * call is asynchronous.
     * 
     * @param id ID of the map.
     * @param name Name of the map as user readable string.
     * @param database File of the database.
     */
    public async register(id: string, config: IMapConfigEntry) {
        console.log(`registering ${id}`);
        const map = new MapDetailsObject(id, config);
        await map.update();
        this._maps[id] = map;
        console.log(`registering ${id} done`);
    }

    /**
     * Getter for a map by its id.
     */
    public getMapById(id: string): MapDetailsObject {
        return this._maps[id];
    }

    /**
     * Returns all map objects.
     */
    public getMaps() {
        return this._maps;
    }

    /**
     * Returns the map information that may be delivered to the user.
     */
    public getPublicMapInfo() {
        var rc: any[] = [];
        for (const [key, value] of Object.entries(this._maps)) {
            rc.push(value.getPublicData());
        }
        return rc;
    }
}

