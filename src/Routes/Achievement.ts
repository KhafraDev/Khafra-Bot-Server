import { Request, Response } from "express";
import fetch from "node-fetch";
import { ErrorCode } from "../Utility/Errors";

// yeah this is lazy
// yeah it'll probably break one day

export const Achievement = async (req: Request, res: Response) => {
    const type = req.query.type ?? '2';
    const text = (req.query.q as string ?? '').replace(/\s+/g, '+');
    const resp = await fetch(`https://mcgen.herokuapp.com/a.php?i=${type}&h=Achievement+get!&t=${text}`);

    if(!resp.ok) {
        return res.status(400).send({
            error: `Received status ${resp.status} (${resp.statusText}).`,
            code: ErrorCode.BAD_URL
        });
    }

    const Image = await resp.buffer();
    res.set('Content-Type', resp.headers.get('content-type'));
    return res.status(200).send(Image);
}