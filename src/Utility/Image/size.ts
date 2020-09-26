import gm from 'gm';

export const getSize = (stream: string | NodeJS.ReadableStream | Buffer) => {
    return new Promise<gm.Dimensions>((res, rej) => {
        gm(stream).size((err, value) => {
            return err ? rej(err) : res(value);
        });
    })
}