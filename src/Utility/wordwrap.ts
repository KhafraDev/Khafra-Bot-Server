/**
 * Slightly modified version of node-wordwrap to fit my needs.
 * @license MIT - https://github.com/substack/node-wordwrap/blob/master/LICENSE
 * @author substack - https://github.com/substack/
 */
export const wordwrap = (text: string, start: number, end?: number) => {
    end = !end ? start : end;
    start = start === end ? 0 : start;
    
    const chunks = text
        .split(/(\S+\s+)/)
        .reduce((acc: string[], x: string) => {
            acc.push(x);
            return acc;
        }, [])
        .filter(l => l.trim().length > 0);
    
    return chunks.reduce((lines: string[], chunk: string) => {                
        const i = lines.length - 1;
        if(lines[i].length + chunk.length > end) {
            lines[i] = lines[i].replace(/\s+$/, '');
            lines.push(...chunk.split(/\n/).map(c =>
                Array(start + 1).join(' ')
                + c.replace(/^\s+/, '')
            ));
        } else if(chunk.match(/\n/)) {
            let xs = chunk.split(/\n/);
            lines[i] += xs.shift();
            lines.push(...xs.map(c => 
                Array(start + 1).join(' ') 
                + c.replace(/^\s+/, '')
            ));
        } else {
            lines[i] += chunk;
        }
        
        return lines.map(l => l.trimStart());
    }, [ Array(start + 1).join(' ') ]).join('\n');
}