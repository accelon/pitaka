import {readTextFile} from '../platform/index.js'
import { getFormat } from './format.js';
const fileContent=async(fn,format)=>{
    let c;
    const F=getFormat(format);
    if (typeof fn=='string') {
        if (F.parseFile) c= await F.parseFile(fn);
        else            c=(await fs.promises.readFile(fn,'utf8')).replace(/\r?\n/g,'\n');
        
    } else {
       if (fn.zip) {
            const raw=await fn.zip.files[fn.name].async('string');
            if (F.parseBuffer) c=F.parseBuffer(raw,fn.name); 
            else              c=raw.replace(/\r?\n/g,'\n');
       } else {
            if (F.parseFile) c = await F.parseFile(fn);
            else            c =(await readTextFile(fn)).replace(/\r?\n/g,'\n');
       }
    }
    const bom=c.charCodeAt(0);
    if (bom===0xfeff || bom==0xffe) c=c.substr(1);
    return c;
}

const readFormatFile=async (f,format)=>{
    const fm=getFormat(format);
    return await fm.parseFile(f);
}

const getZipIndex=async (zip,format,fn)=>{
    const fm=getFormat(format);
    if (fm.getZipFileToc) return await fm.getZipFileToc(zip,fn);
    else return {files:zip.files,tocpage:[]};
}

const getFormatTypeDef=(format,opts)=>{
    const fm=getFormat(format);
    return (new fm.TypeDef(opts)).defs;
}

const getFormatTree=format=>{
    const fm=getFormat(format);
    return fm.tree;
}

const getFormatter=format=>{
    const fm=getFormat(format);
    return fm.Formatter;
}

const fileLines=async fn=>{
    const content=await fileContent(fn);
    const lines=content.split('\n');
    return lines;
 }

export {readFormatFile, fileContent,getFormatter,fileLines,getZipIndex,getFormatTypeDef,getFormatTree};