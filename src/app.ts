import express from 'express';
import * as Routes from './Routes/';

const app = express();

app.post('/api/sb', Routes.SpongeBobFire);

app.listen(3000, () => console.log('Listening on port 3000'));