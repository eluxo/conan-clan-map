import sqlite3 from 'sqlite3';
import { TransformParser } from './coordinate';


/**
 * Location of a base.
 */
export interface IBaseLocation {
    x: number;
    y: number;
    z: number;
    count: number;
}

/**
 * Details on a single player.
 */
export interface IPlayerDetails {
    name: string;
    clanOwner: boolean;
    id: number;
}

/**
 * Information on a clan.
 */
export interface IClanDetails {
    id: number;
    name: string;
    bases: IBaseLocation[];
    players: IPlayerDetails[];
}

/**
 * Interface for clan location provider class.
 * 
 * The class will provide a list of clans and their base locations.
 */
export interface IClanLocationProvider {
    /**
     * Get details on all clans.
     * 
     * @return Details on al clans.
     */
    getAllClanDetails(): { [id: number]: IClanDetails };

    /**
     * Refresh the list of clan information.
     */
    refresh(db: sqlite3.Database): Promise<boolean>;
}


type ClanDataCollection = { [id: number]: IClanDetails };


// TODO: add clustering option based on some sane clustering algorithm
// instead of just using the mean of all base locations.
//
// Options might be:
//   - DBSCAN
//   - HDBSCAN
//   - OPTICS


/**
 * This class just collects all building pieces owned by a clan and calculates
 * the mean of all elements as a center.
 * 
 * This is obviously not a good solution to provide the location of a clans
 * base, but it should do for now.
 */
export class NaiveClanLocationProvider implements IClanLocationProvider {
    private _clans: ClanDataCollection = { };

    getAllClanDetails(): { [id: number]: IClanDetails } {
        return this._clans;
    }

    public async refresh(db: sqlite3.Database): Promise<boolean> {
        console.log("refreshing database");

        try {
            const clans = await this._readGuilds(db);
            this._clans = await this._readPlayers(db, clans);
            return true;
        } catch (err) {
            console.log("Error reading database: ", err);
        }
        return false;
    }

    private async _readPlayers(db: sqlite3.Database, clans: ClanDataCollection): Promise<ClanDataCollection> {
        return new Promise<ClanDataCollection>((resolve, reject) => {
            const query = `
            SELECT
                guild, id, char_name, id = owner AS owner
            FROM characters
                INNER JOIN guilds ON guild = guildId;
            `;

            console.log("read all players");
            db.each(query, (err, row: any) => {
                const clan = clans[row.guild];
                if (!clan) return;
                clan.players.push({
                    id: row.id,
                    clanOwner: row.owner,
                    name: row.char_name
                });
            }, (err, n) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`${n} players found.`);
                    resolve(clans);
                }
            });
        });
    }

    private async _readGuilds(db: sqlite3.Database): Promise<ClanDataCollection> {
        const parser = new TransformParser();
        return new Promise<ClanDataCollection>((resolve, reject) => {
            const clans: { [id: number]: IClanDetails } = {};
            const query = `
            SELECT
                g.guildId AS id,
                g.name AS name,
                bi.transform1 AS transform
            FROM building_instances AS bi
                INNER JOIN buildings AS b ON bi.object_id = b.object_id
                INNER JOIN guilds AS g ON b.owner_id = g.guildId
            `;

            console.log("read all clans")
            db.each(query, (err, row: any) => {
                var clan = clans[row.id]
                var transform = parser.parse(row.transform);
                if (!clan) {
                    clan = {
                        id: row.id,
                        name: row.name,
                        bases: [{
                            count: 0.0,
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        }],
                        players: []
                    };
                    clans[row.id] = clan;
                }

                clan.bases[0].count += 1.0;
                clan.bases[0].x += transform.translation.x;
                clan.bases[0].y += transform.translation.y;
                clan.bases[0].z += transform.translation.z;
            }, (err, n) => {
                // complete
                if (err) {
                    reject(err);
                }
                else {
                    console.log(`${n} building pieces found. store structure.`)
                    for (const [key, element] of Object.entries(clans)) {
                        element.bases[0].x /= element.bases[0].count;
                        element.bases[0].y /= element.bases[0].count;
                        element.bases[0].z /= element.bases[0].count;
                    }
                    resolve(clans);
                }
            })
        });
    }
}


