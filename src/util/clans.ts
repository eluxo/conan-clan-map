import { json } from 'express';
import sqlite3 from 'sqlite3';


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
 * Information on a clan.
 */
export interface IClanDetails {
    id: number;
    name: string;
    bases: IBaseLocation[];
}

/**
 * FTransform representation.
 */
interface IFTransform {
    rotation: IFQuad;
    translation: IFVector;
    scale: IFVector;
}

/**
 * FVector representation.
 */
interface IFVector {
    x: number;
    y: number;
    z: number;
}

/**
 * FQuad representation.
 */
interface IFQuad extends IFVector {
    w: number;
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
    refresh(): Promise<boolean>;
}


/**
 * This class just collects all building pieces owned by a clan and calculates
 * the mean of all elements as a center.
 * 
 * This is obviously not a good solution to provide the location of a clans
 * base, but it should do for now.
 */
export class NaiveClanLocationProvider implements IClanLocationProvider {
    private _clans: { [id: number]: IClanDetails } = { };

    getAllClanDetails(): { [id: number]: IClanDetails } {
        return this._clans;
    }

    refresh(): Promise<boolean> {
        console.log("refreshing database")
        return new Promise<boolean>((resolve, reject) => {
            const clans: { [id: number]: IClanDetails } = {};
            const db = new sqlite3.Database("./game.db");
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
                var transform = this._parseTransform(row.transform);
                if (!clan) {
                    clan = {
                        id: row.id,
                        name: row.name,
                        bases: [{
                            count: 0.0,
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        }]
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
                    this._clans = clans;
                }
            })
        });        
    }

    /**
     * Parses the given object into a transformation.
     * 
     * This parses the transformation data as defined in the transform1 and
     * transform2 fields in the database.
     */
    private _parseTransform(data: Buffer): IFTransform {
        if (data.length != 40) throw new Error("Transformation has less than 40 bytes");
        return {
            rotation: {
                w: data.readFloatLE(0),
                x: data.readFloatLE(4),
                y: data.readFloatLE(8),
                z: data.readFloatLE(12)
            },
            translation: {
                x: data.readFloatLE(16),
                y: data.readFloatLE(20),
                z: data.readFloatLE(24)
            },
            scale: {
                x: data.readFloatLE(28),
                y: data.readFloatLE(32),
                z: data.readFloatLE(36)
            }
        }
    }
}

