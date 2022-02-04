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
export * from './cjk.js'
export * from './diff.js'
export * from './pattern.js'
export * from './errata.js'
export * from './base26.js'
export * from './breaker.js'
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
