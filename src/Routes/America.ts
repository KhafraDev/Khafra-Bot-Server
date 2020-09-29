import { Request, Response } from "express";
import sharp from 'sharp';
import fetch from 'node-fetch';
import { join, resolve } from 'path';
import { ErrorCode } from "../Utility/Errors";
import { parse } from "url";
import { isImage, Valid } from "../Utility/Image/is";

const template = join(resolve('.'), 'src/templates/america.jpg'); // meme template

export const America = async (req: Request, res: Response) => {
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
    if(!isImage(contentType)) {
        return res.status(400).send({
            error: `Only ${Valid.join(', ')} images are allowed!`,
            code: ErrorCode.CONTENT_TYPE
        });
    }

    const buffer = await resp.buffer();
    const downSize = await sharp(buffer).metadata();
    
    const resized = await sharp(template).resize({ 
        height: downSize.height,
        width: downSize.width
    }).toBuffer();
            
    const Image = await sharp(buffer)
        .composite([
            {
                input: resized,
                blend: 'soft-light' // soft-light, overlay, darken?, exclusion?, lighten?, multiply?, screen?
            }
        ])
        .jpeg()
        .toBuffer()

    res.set('Content-Type', 'image/jpeg');
    return res.status(200).send(Image);
}