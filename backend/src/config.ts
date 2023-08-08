/**
 * Configuration of a single map instance.
 */
export interface IMapConfigEntry {
    name: string;
    file: string;
    type: 'exiled_lands' | 'savage_wilds';
}

/**
 * Configuration file format.
 */
export interface IConfigFormat {
    port: number;
    databases: { [id: string]: IMapConfigEntry };
}

