
export interface IMapConfigEntry {
    name: string;
    file: string;
    type: 'exiled_lands' | 'savage_wilds';
}

export interface IConfigFormat {
    port: number;
    databases: { [id: string]: IMapConfigEntry };
}

