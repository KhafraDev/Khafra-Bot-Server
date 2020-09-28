import { Request, Response } from "express";
import sharp from 'sharp';
import fetch from 'node-fetch';
import { join, resolve } from 'path';
import { ErrorCode } from "../Utility/Errors";
import { parse } from "url";

const template = join(resolve('.'), 'src/templates/ifunny-watermark.png'); // meme template

export const iFunny = async (req: Request, res: Response) => {
    if(!('url' in req.query) || req.query.url.length === 0) {
        return res.status(400).send({
            error: 'Missing "url" param.',
            code: ErrorCode.MISSING_PARAMS
        });
    }

    const url = parse(req.query.url as string);
    if(!url.href) {
        return res.status(400).send({
            error: 'Bad URL',
            code: ErrorCode.BAD_URL
        });
    } else if(!url.host.endsWith('discordapp.net')) {
        return res.status(400).send({
            error: 'Bad URL',
            code: ErrorCode.BAD_URL
        });
    }

    const resp = await fetch(url.href);
    if(!resp.ok) {
        return res.status(400).send({
            error: `Received status ${resp.status} (${resp.statusText}).`,
            code: ErrorCode.BAD_URL
        });
    }

    const contentType = resp.headers.get('content-type');
    if(!['image/png', 'image/jpeg'].includes(contentType)) {
        return res.status(400).send({
            error: 'Only PNG and JPG are accepted.',
            code: ErrorCode.CONTENT_TYPE
        });
    }

    const buffer = await resp.buffer();
    const downSize = await sharp(buffer).metadata();
    
    const resized = await sharp(template).resize({ 
        width: downSize.width
    }).toBuffer();
            
    const Image = await sharp({
        create: {
            width: downSize.width,
            height: downSize.height + 16,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
    })
    .jpeg() // must be here or won't work
    .composite([
        {
            input: buffer,
            gravity: 'north'
        },
        {
            input: resized,
            gravity: 'south'
        }
    ])
    .toBuffer();

    res.set('Content-Type', 'image/jpeg');
    return res.status(200).send(Image);
}