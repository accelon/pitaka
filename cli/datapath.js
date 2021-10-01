import path from 'path'
export const getDataPath=name=>{
    let dir=decodeURI(new URL(import.meta.url).pathname);
    if(import.meta.url.substr(0,5)==='file:' && path.sep==='\\') dir=dir.substr(1);
    return path.resolve(dir ,"..")+path.sep+name+path.sep;
}