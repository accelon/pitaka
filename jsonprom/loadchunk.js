import { loadScript } from "../utils/loadscript.js";

const chunkfilename=chunk=>chunk.toString().padStart(3,'0')+'.js';

const makeChunkURI=(name,chunk,rom)=>{
    const fn=rom.romfolder+name+'/'+chunkfilename(chunk);
    return fn;
}

const parseChunk=str=>{
    const start=str.indexOf('{');
    const end=str.indexOf('},`')+1;
    let payload=str.substring(end+2,str.length-2);
    
    //indexOf is much faster than regex, replace only when needed
    if (payload.indexOf("\\\\")>-1) payload=payload.replace(/\\\\/g,"\\");
    if (payload.indexOf("\\`")>-1)  payload=payload.replace(/\\`/g,"`");
    if (payload.indexOf("$\\{")>-1) payload=payload.replace(/\$\\\{/g,'${');
    
    return {header:JSON.parse(str.substring(start,end)), payload:payload.split("\n") }
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
    const fn=name+'/'+chunkfilename(chunk);
    const content=await rom.romzip.readTextFile(fn);
    return parseChunk(content);
}

export const loadFetch= async (name,chunk,rom)=>{
    const at=rom.filenames?rom.filenames.indexOf(chunkfilename(chunk)):chunk;
    
    if (at>-1) { //fetch from ptk
        const data=await rom.romzip.readTextFile(name+'/'+rom.filenames[at]);
        return parseChunk(data);
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
const jsonp=function(chunk,header,_payload){
    const payload=_payload.split(/\r?\n/);
    this.setChunk(chunk,header,payload); //this is binded to rom, not in pool yet for first chunk
}

export const loadJSONP=async (name,chunk,rom)=>{
    if (!typeof window.jsonp!=='function') window.jsonp=jsonp.bind(rom);
    return loadScript(makeChunkURI(name,chunk,rom),()=>rom.context.loadedChunk[chunk]);
}
