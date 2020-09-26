import { Request, Response } from "express";
import gm from 'gm';
import { createReadStream } from 'fs';
import { join, resolve } from 'path';
import { wordwrap } from '../Utility/wordwrap';
import { ErrorCode } from "../Utility/Errors";

const template = join(resolve('.'), 'src/templates'); // template directory

export const SpongeBobFire = (req: Request, res: Response) => {
    if(!('q' in req.query) || req.query.q.length === 0) {
        return res.status(400).send({
            error: 'Missing "q" param.',
            code: ErrorCode.MISSING_PARAMS
        });
    }

    const Image = gm(createReadStream(join(template, 'spongebob-fire.jpg')))
        .fill('#000000')
        .font('Arial', 50)
        .drawText(150, 200, wordwrap(req.query.q as string, 14, 18));

    Image.toBuffer('jpg', (err, img) => {
        if(err) {
            return res.status(500).send({
                error: err.toString(),
                code: ErrorCode.SERVER_ERROR
            });
        }

        res.set('Content-Type', 'image/jpeg');
        return res.status(200).send(img);
    });
}