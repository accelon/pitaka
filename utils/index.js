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