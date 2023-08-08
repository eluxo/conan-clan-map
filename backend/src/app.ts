import express, { Express, Request, Response } from 'express';
import path from 'path';
import { IConfigFormat } from './config';
import { MapProvider } from './util/map';
import fs from 'fs/promises';


const app: Express = express();
const publicDirPath = path.join(__dirname, '..', '..', 'public');


app.use(express.static(publicDirPath));


app.get('/api/clans/:id', (req: Request, res: Response) => {
    const map = mapProvider.getMapById(req.params.id);
    const provider = map.getClanProvider();

    res.contentType('application/json');
    res.send(JSON.stringify(provider.getAllClanDetails()));
});


app.get('/api/maps', (req: Request, res: Response) => {
    res.contentType('application/json');
    res.send(JSON.stringify(mapProvider.getPublicMapInfo()));
});


const mapProvider: MapProvider = new MapProvider();
async function init() {
    const configData = await fs.readFile('config.json');    
    const config: IConfigFormat = JSON.parse(configData.toString("utf-8"));
    for (const [key, value] of Object.entries(config.databases)) {
        await mapProvider.register(key, value);
    }

    app.listen(config.port, () => {
        console.log(`Server started on http://localhost:${config.port}`);
    });    
}
init();

