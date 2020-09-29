import { Routes } from "../../Routes";

/**
 * Get the correct route to use.
 * @param path {string} route name to test
 */
export const route = (path: string) => {
    path = path.slice(1).toLowerCase();
    const r = Object.keys(Routes).filter(k => k.toLowerCase() === path);
    
    if(r.length > 0) {
        return r.shift();
    }
    
    return null;
}