import { Request, Response } from "express";
import sharp from 'sharp';
import fetch from 'node-fetch';
import { join, resolve } from 'path';
import { ErrorCode } from "../Utility/Errors";
import { parse } from "url";

const template = join(resolve('.'), 'src/templates/challenge.jpg'); // meme template

export const Challenge = async (req: Request, res: Response) => {
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
    const discord = sharp(buffer);
    const size = await discord.metadata();

    let resized: Buffer;
    if(size.width > 498 || size.height > 483 * .65) {
        resized = await discord.resize(
            size.width > 498 ? 400 : size.width,
            size.height > 483 * .65 ? 375 : size.height
        ).toBuffer();
    } else {
        resized = buffer;
    }

    const Image = await sharp(template)
        .composite([{
            input: resized,
            gravity: size.height > 250 ? 'south' : 'center'
        }])
        .toBuffer();

    res.set('Content-Type', 'image/jpeg');
    return res.status(200).send(Image);
}