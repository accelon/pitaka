const unescapeTemplateString=str=>str.replace(/\\\\/g,"\\").replace(/\\`/g,"`").replace(/\$\\\{/g,'${');
const chunkfilename=chunk=>chunk.toString().padStart(3,'0')+'.js';

const makeChunkURI=(name,chunk,rom)=>{
    const fn=rom.romfolder+name+'/'+chunkfilename(chunk);
    return fn;
}

const parseChunk=str=>{
    const start=str.indexOf('{');
    const end=str.indexOf('},`')+1;
    return {header:JSON.parse(str.substring(start,end)),
        payload:unescapeTemplateString(str.substring(end+2,str.length-2)).split(/\r?\n/) }
}
//import {promises} from 'fs';
export async function loadNodeJs (name,chunk,rom){
    const fn=makeChunkURI(name,chunk,rom);

    try{
        const data=await fs.promises.readFile(fn,'utf8');
        return parseChunk(data);
    } catch(e) {
        console.error('readFile failed,',fn);
    }
}

export async function loadNodeJsZip (name,chunk,rom) {
    throw "not implement yet"
}

export const loadFetch= async (name,chunk,rom)=>{
    const at=rom.filenames?rom.filenames.indexOf(chunkfilename(chunk)):chunk;
    
    if (at>-1) {
        const start=rom.offsets[at],end=rom.offsets[at+1];
        const res=await fetch(rom.romfile,{headers: {
            'content-type': 'multipart/byteranges',
            'range': 'bytes='+start+'-'+end,
        }})

        if (res.ok) {
            const content=await res.text();
            return parseChunk(content)
        }
        console.error('rom fetch failed,',name,chunk);
        return '';
    }

    const uri=makeChunkURI(name,chunk,rom);
    try {
        const res=await fetch(uri);
        if (!res.ok) throw res.statusText;
        return parseChunk(await res.text())    
    } catch(e) {
        console.error('fetch failed,',uri);
    }
}
import jsonp from './jsonp.js'
export const loadJSONP=async (name,chunk,rom)=>{
    if (!typeof window.jsonp!=='function') window.jsonp=jsonp;
    const script=document.createElement("script");
    script.src=makeChunkURI(name,chunk,rom);
    const promise=new Promise((resolve,reject)=>{
        let tried=0;
        const timer=setInterval(function(){
            if (rom.context.loadedChunk[chunk] ) {
                clearInterval(timer);
                resolve();
            } else if (tried>50) {
                clearInterval(timer);
                reject('too many trieds');
            }
            tried++;
        },50);    
    });
    document.getElementsByTagName("body")[0].appendChild(script);
    return promise;
}
