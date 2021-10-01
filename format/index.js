import {readTextFile,readBLOBFile} from 'pitaka/platform'
import {readHaodoo} from './haodoo.js';
import Formatter_HTLL from './htll.js';
import Formatter_OffText from '../offtext/formatter.js';
import OpenLit from './openlit.js';
import Default_Typedef from './typedef.js';
const fileContent=async fn=>{
    let c;
    if (typeof fn=='string') {
       c=(await fs.promises.readFile(fn,'utf8')).replace(/\r?\n/g,'\n');
    } else {
       if (fn.zip) {
            const raw=await fn.zip.files[fn.name].async('string');
            c=raw.replace(/\r?\n/g,'\n');
       } else {
          c=(await readTextFile(fn)).replace(/\r?\n/g,'\n');
       }
    }
    const bom=c.charCodeAt(0);
    if (bom===0xfeff || bom==0xffe) c=c.substr(1);
    return c;
 }


//download link http://www.haodoo.net/?M=d&P=C[bookid].updb

const readHaodooFile=async fn=>{
    const buf=await readBLOBFile(fn);
    const blocks=readHaodoo(buf);
    const lines=[], toclines={} ; //從目錄頁指到每一章的起始行
    blocks.forEach( (block,idx)=>{
        toclines[idx]=lines.length;
        lines.push(... block.split(/\n+/) );
    });
    return {lines,toclines}
}
const formatters={htll:Formatter_HTLL, openlit:OpenLit.Formatter};

const getFormatter=format=>{
    return formatters[format] || Formatter_OffText;
}

const getZipIndex=async (zip,format)=>{
    if (format=='openlit') {
        return await OpenLit.getZipFileToc(zip);
    }
    return {files:zip.files,tocpage:[]};
}

const getFormatTypeDef=(format,opts)=>{
    if (format=='openlit') {
        return new OpenLit.TypeDef(opts);
    }
    return Default_Typedef;
}

const fileLines=async fn=>{
    const content=await fileContent(fn);
    const lines=content.split('\n');
    return lines;
 }

const readOpenlitFile=async fn=>{
    const Zip= (typeof JSZip!=='undefined' && JSZip) || lazip.JSZip; 
    const jszip=new Zip();
    const zip=await jszip.loadAsync(fn.getFile());

    const lines=[] ,toclines=[0];
    const { files,tocpage}=await OpenLit.getZipFileToc(zip);
    lines.push(...tocpage);
    
    const context={filename:fn.name};
    const formatter=new OpenLit.Formatter(context);
    const jobs=[];
    for (let i=0;i<files.length;i++){
        toclines[i+1]=lines.length;
        const file=files[i];
        jobs.push(zip.file(file).async('string').then(content=>{
            const {text,tags}=formatter.scan(content);
            lines.push(...text);
        }));

    }
    await Promise.all(jobs);

    return {lines,toclines};
}
const readFormatFile=async (f,format)=>{
    const ext=f.name.match(/(\.\w+)$/)[1];
    if (format=='haodoo' && ext==='.updb') {
        const haodoo=await readHaodooFile(f);
        return haodoo;
    } else if (format=='openlit' && ext==='.zip'){
        return await readOpenlitFile(f);
    } else {
        return {lines:(await readTextFile(f)).split("\n")};
    }
}
export {readHaodooFile,readHaodoo,readFormatFile,
    fileContent,getFormatter,fileLines,getZipIndex,getFormatTypeDef};