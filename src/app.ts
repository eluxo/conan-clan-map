import express, { Express } from 'express';
import path from 'path';

const PORT = 9000;
const app: Express = express();
const publicDirPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicDirPath));

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

