import {readTextFile} from '../platform/inputfiles.js'
import { getFormat } from './format.js';
import TypeDef from './typedef.js'
const fileContent=async(fn,format,ctx)=>{
    let c;
    const F=getFormat(format);
    if (typeof fn=='string') {
        if (F.parseFile) c= (await F.parseFile(fn,ctx));
        else            c=(await fs.promises.readFile(fn,'utf8')).replace(/\r?\n/g,'\n');
        if (c.rawcontent) c=c.rawcontent;
        
    } else {
       if (fn.zip) {
            const raw=await fn.zip.files[fn.name].async('string');
            if (F.parseBuffer) c=F.parseBuffer(raw,fn.name,ctx); 
            else              c=raw.replace(/\r?\n/g,'\n');
       } else {
            if (F.parseFile) c = await (F.parseFile(fn,ctx)).rawcontent;
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
const default_typedef={
    'bk':['LabelBook',{resets:'c'}],
    'c':'LabelChapter',
    'b':'Label',
    'u':'Label',
    'i':'Label'
}
const getFormatTypeDef=(config,opts)=>{
    const def=config.labels||getFormat(config.format).def||default_typedef;
    return TypeDef( def, {config,...opts});
}

const getFormatTree=format=>{
    const fm=getFormat(format);
    return fm.tree;
}

const getFormatter=format=>{
    const fm=getFormat(format);
    return fm.Formatter;
}
const translatePointer=(ptr,format)=>{
    const fm=getFormat(format);
    return fm.translatePointer?fm.translatePointer(ptr):ptr;
}

const fileLines=async fn=>{
    const content=await fileContent(fn);
    const lines=content.split('\n');
    return lines;
 }
const getQuickPointerParser=format=>{
    const fm=getFormat(format);
    return fm.parseQuickPointer;
}
const getQuickPointerSyntax=format=>{
    const fm=getFormat(format);
    return fm.QuickPointerSyntax;
}
export {readFormatFile, fileContent,translatePointer,getFormatter,
    fileLines,getZipIndex,getFormatTypeDef,getQuickPointerParser,getQuickPointerSyntax,getFormatTree};