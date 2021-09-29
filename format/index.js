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

const readPlainTextFile=async fn=>{
    return await readTextFile(fn);
}
//download link http://www.haodoo.net/?M=d&P=C[bookid].updb

const readHaodooFile=async fn=>{
    const buf=await readBLOBFile(fn);
    return readHaodoo(buf).join(String.fromCharCode(0x0a,0x1a));//0x1a terminate marker
}
const formatters={htll:Formatter_HTLL, openlit:OpenLit.Formatter};

const getFormatter=format=>{
    return formatters[format] || Formatter_OffText;
}

const getZipIndex=async (zip,format)=>{
    if (format=='openlit') {
        return await OpenLit.getZipFileOrder(zip);
    }
    return zip.files;
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

export {readPlainTextFile,readHaodooFile,readHaodoo,
    fileContent,getFormatter,fileLines,getZipIndex,getFormatTypeDef};