import { Request, Response } from "express";
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { wordwrap } from '../Utility/wordwrap';
import { ErrorCode } from "../Utility/Errors";

const buffer = readFileSync('./src/templates/spongebob-fire.jpg');

export const SpongeBobFire = async (req: Request, res: Response) => {
    if(!('q' in req.query) || req.query.q.length === 0) {
        return res.status(400).send({
            error: 'Missing "q" param.',
            code: ErrorCode.MISSING_PARAMS
        });
    }

    const split = wordwrap(req.query.q as string, 18, 22).split('\n').slice(1);
    const tspan = split.map(s => `<tspan x="0" dy="1.2em">${s}</tspan>`);

    // debugging element:
    // <rect width="100%" height="100%" fill="blue"/>
    const svg = Buffer.from(`
        <svg width="1440" height="1666" viewBox="0 0 1440 1666">
            <svg x="133" y="-425" width="29%" viewBox="0 0 75 95">
                <text font-size=".65em" font-family="Arial">
                ${tspan.join('\n')}
                </text>
            </svg>
        </svg>
    `);

    const Image = await sharp(buffer)
        .composite([
            {
                input: svg,
                gravity: 'northwest'
            }
        ])
        .toBuffer();

    res.set('Content-Type', 'image/jpeg');
    return res.status(200).send(Image);
}