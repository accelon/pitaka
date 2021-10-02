import path from 'path'
export const getModulePath=name=>{
    let dir=decodeURI(new URL(import.meta.url).pathname);
    if(import.meta.url.substr(0,5)==='file:' && path.sep==='\\') dir=dir.substr(1);
    return path.resolve(dir ,"..")+path.sep+name+path.sep;
}

export const resolveDataFile=name=>{
   const noext=name.replace(/\.[a-z]+$/,'');

   //try name in current folder
   //try noext in current folder

//go upper folder 

}