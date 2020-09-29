import express from 'express';
import { Routes } from './Routes/';
import url from 'url';
import { ErrorCode } from './Utility/Errors';
import { route } from './Utility/Route/route';

const app = express();

app.use('/api', (req, res) => {
    if(req.method !== 'POST') {
        return res.status(400).send({
            error: 'Only POST requests allowed.',
            code: ErrorCode.BAD_METHOD
        });
    }

    const { pathname } = url.parse(req.url);
    const r = route(pathname);
    if(r) {
        return Routes[r as keyof typeof Routes](req, res);
    }

    return res.status(400).send({
        error: 'No route found.',
        code: ErrorCode.NO_ROUTE
    });
});

app.listen(3000, () => console.log('Listening on port 3000'));