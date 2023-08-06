import express, { Express, Request, Response } from 'express';
import path from 'path';
import { IClanLocationProvider, NaiveClanLocationProvider } from './util/clans';

const PORT = 9000;
const app: Express = express();
const publicDirPath = path.join(__dirname, '..', 'public');
const provider: IClanLocationProvider = new NaiveClanLocationProvider();
provider.refresh();

app.use(express.static(publicDirPath));

app.get('/api/clans', (req: Request, res: Response) => {
    res.contentType('application/json');
    res.send(JSON.stringify(provider.getAllClanDetails()));
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

