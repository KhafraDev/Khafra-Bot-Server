import { parse } from 'media-typer';

export const Valid: string[] = [
    'jpeg', // only image/jpeg is valid
    'png',
    'tiff', // only image/tiff is valid
    'webp'
];

export const isImage = (contentType: string) => {
    const type = parse(contentType);
    if(type.type === 'image' && Valid.includes(type.subtype)) {
        return true;
    }

    return false;
}