import {readTextFile} from '../platform/inputfiles.js'
import { offtagRegex } from '../offtext/parser.js';
import TypeDef from './typedef.js'
import cbeta from './cbeta.js';
import Templates from './templates.js'
const fileContent=async(fn,ctx)=>{
    let c;
    const F=ctx.Formatter||{};
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

const getFormatTypeDef=(config,opts)=>{
    const templeteLabels=Templates[config.template].labels;    
    if (config.labels) {
        for (let nm in config.labels) {
            if (templeteLabels[nm]) {
                console.warn("overriding template label",nm, config.labels[nm]);
            }
        }
    }
    const def=Object.assign(templeteLabels,config.labels);//||getFormat(config.format).def);
    if (config.label) { //additional custom label
        const extralabels=(typeof config.label==='string')?config.label.split(','):config.label;
        for (let i=0;i<extralabels.length;i++) {
            if (def[extralabels[i]]) {
                console.error('label already defined',extralabels[i])
            } else {
                def[extralabels[i]]="Label";
            }
        }
    }
    return TypeDef( def, {config,...opts});
}

const translatePointer=(ptr,format)=>{
    const fm=getFormat(format);
    return fm.translatePointer?fm.translatePointer(ptr):ptr;
}

const getQuickPointerParser=format=>{
    const fm=getFormat(format);
    return fm.parseQuickPointer;
}
const getQuickPointerSyntax=format=>{
    const fm=getFormat(format);
    return fm.QuickPointerSyntax;
}

const removeLabels=(content,labels)=>{
    if (!labels) return content;
    if (typeof labels=='string') labels=labels.split(',');
    labels.forEach(lbl=>{
        const regex=offtagRegex(lbl);
        content=content.replace(regex,'');
    });
    return content;
}
export {Templates,translatePointer,fileContent,readFormatFile,getFormatTypeDef,
    //getFormatter,getFormat,getFormatLocator
//fileLines,getZipIndex,,
getQuickPointerParser,getQuickPointerSyntax,cbeta,
removeLabels};