export * from './sortedarray.js'
export * from './packintarray.js'
export * from './unpackintarray.js'
export * from './packstr.js'
export * from './unpackstr.js'
export * from './rlestr.js'
export * from './argument.js'
export * from './unicode.js'
export * from './nested-ordered-list.js'
export * from './bsearch.js'
export * from './es6.js'
export * from './html.js'
export function chunkjsfn(chunk,folder){
    const jsfn=chunk.toString().padStart(3,'0')+'.js'
    return folder?folder+'/'+jsfn:jsfn;
}

export function filesFromStringPattern(pat){
    let out=[];
    if (pat.indexOf(';')>0 || pat.indexOf(',')>0) {
        out=pat.split(/[;,]/);
    } else {       
        const RANGE_REGEX=/\[(\d+):(\d+)\]/;
        const RANGE_REGEX_REPLACE=/(\[\d+:\d+\])/;
        const range=pat.match(RANGE_REGEX);
        if (range) {
            let [m,from,to]=range;
            from=parseInt(from),to=parseInt(to);
            for (let i=from ;i<=to;i++) {
                out.push(pat.replace(RANGE_REGEX_REPLACE,i));
            }
        } else {
            out=[pat];
        }
    }
    return out;
}
