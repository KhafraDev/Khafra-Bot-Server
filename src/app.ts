import express from 'express';
import * as Routes from './Routes/';

const app = express();

app.post('/api/sb', Routes.SpongeBobFire);
app.post('/api/challenge', Routes.Challenge);

app.listen(3000, () => console.log('Listening on port 3000'));