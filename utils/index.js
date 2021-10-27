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
export * from './cnumber.js'
export * from './device.js'

export function linesOffset(lines){
    const out=[0];
    let acc=0;
    for (let i=0;i<lines.length;i++) {
        out.push(acc);
        acc+=lines[i].length;
    }
    out.push(acc);
    return out;
}
export function chunkjsfn(chunk,folder){
    const jsfn=chunk.toString().padStart(3,'0')+'.js'
    return folder?folder+'/'+jsfn:jsfn;
}
export function dedup(arr) {
    const out=[];
    arr.forEach(item=>out.indexOf(item)==-1?out.push(item):null);
    return out;
}
export function filesFromStringPattern(pat,rootdir){
    let out=[];

    if ((pat.indexOf('\\')>0 || pat.indexOf('+')>0)  ) {
        const files=fs.readdirSync(rootdir);
        const reg=new RegExp(pat);
        for (let i=0;i<files.length;i++) {
            if (files[i].match(reg)) {
                out.push(files[i]);
            }
        }
        out.sort((a,b)=>a>b?1: ((a<b)?-1:0));
        return out;
    }

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
