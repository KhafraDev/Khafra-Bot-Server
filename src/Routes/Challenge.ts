import { Request, Response } from "express";
import gm from 'gm';
import { join, resolve } from 'path';
import { ErrorCode } from "../Utility/Errors";
import fetch from 'node-fetch';
import { parse } from "url";
import mime from "mime-types";
import { getSize } from "../Utility/Image/size";

const template = join(resolve('.'), 'src/templates'); // template directory

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
    } else if(!/(.png|.jpe?g)$/.test(url.href)) {
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

    const discord = await fetch(url.href);
    const ext = mime.extension(mime.lookup(url.href) as string) as string;
    const name = join(resolve('.'), `temp/challenge${Math.random().toString().slice(2)}.${ext}`);
    
    const buffer = await discord.buffer();
    const size = await getSize(buffer);
    const Image = gm(buffer); // downloaded image from Discord

    if(size.width > 498 || size.height > 483 * .65) {
        Image.resize(
            size.width > 498 ? 400 : size.width,
            size.height > 483 * .65 ? 375 : size.height
        );
    }

    Image.write(name, err => {
        if(err) {
            return res.status(500).send({
                error: err.toString(),
                code: ErrorCode.SERVER_ERROR
            });
        }

        const Comp = gm(join(template, 'challenge.jpg'))
            .composite(name)

        if(size.height >= 250) {
            Comp.gravity('South')
        } else {
            Comp.gravity('Center');
        }

        Comp.toBuffer(ext, (err, img) => {
            if(err) {
                return res.status(500).send({
                    error: err.toString(),
                    code: ErrorCode.SERVER_ERROR
                });
            }

            res.set('Content-Type', mime.lookup(url.href) as string);
            return res.status(200).send(img);
        });
    });

    /*Image.write(name, err => {
        if(err) {
            return res.status(500).send({
                error: err.toString(),
                code: ErrorCode.SERVER_ERROR
            });
        }

        const Comp = gm(createReadStream(join(template, 'challenge.jpg')))
            .composite(name)
            .geometry('+xx+200')
            //.gravity('center');

        Comp.toBuffer(ext, (err, img) => {
            if(err) {
                return res.status(500).send({
                    error: err.toString(),
                    code: ErrorCode.SERVER_ERROR
                });
            }

            res.set('Content-Type', mime.lookup(url.href) as string);
            return res.status(200).send(img);
        });
    });*/
}