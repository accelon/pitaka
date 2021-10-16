import OffTextFormatter from '../offtext/formatter.js';
import {handlers,closeHandlers,CBetaTypeDef} from './tei.js'
import {DOMFromString,xpath} from '../xmlparser/index.js';
import { alphabetically } from '../utils/sortedarray.js';

const XML2OffText = (el,ctx) =>{
    if (typeof el=='string') {                     // a string node arrives
        let s=el.trimRight();
        if (ctx.compact && s.charCodeAt(0)<0x7f) { // a compact offtag is emitted just now
            s=' '+s;                               // use blank to separate tag 
            ctx.compact=false;
        }
        if (ctx.hide) return '';
        if (s) ctx.snippet=s;
        return s;
    }
    let out='';
    const handler= handlers[el.name];
    if (handler) out=handler(el,ctx)||'';

    if (el.children && el.children.length) {
        out+=el.children.map(e=>XML2OffText(e,ctx)).join('');
    }

    const closehandler= closeHandlers[el.name];
    if (closehandler) out+=closehandler(el,ctx)||'';
    return out;
}

const buildChapmap=(charDecl)=>{
    const res={};
    if (!charDecl)return res;
    for (let i=0;i<charDecl.children.length;i++) {
        const char=charDecl.children[i];
        if (!char.attrs)continue;
        const id=char.attrs['xml:id'];
        const uni=xpath(char,'mapping');
        if (uni&& uni.attrs.type=='unicode' && typeof uni.children[0]=='string') {
            res[id]= String.fromCodePoint(parseInt( uni.children[0].substr(2),16));
        }
    }
    return res;
}
const parseBuffer=(buf,fn='')=>{
    if (fn) process.stdout.write('\r processing'+fn+'    ');
    const el=DOMFromString(buf);
    const body=xpath(el,'text/body');
    const charmap=buildChapmap(xpath(el,'teiHeader/encodingDesc/charDecl'));

    
    let m=fn.match(/n([\dabAB]+)_(\d+)/);
    let bk='',chunk='';
    if (!m) {
        console.log(fn)
    }
    if (m[2]=='001')  bk='^bk'+m[1].replace(/^0+/,'').replace('_001','').toLowerCase();
    chunk='^c'+parseInt(m[2]);

    let content=bk+chunk+XML2OffText(body,{lbcount:0,hide:0,snippet:'',div:0,charmap,fn});
    content=content.replace(/\^r\n/g,'\n');
    return content;
}
const parseFile=async f=>{
    const fn=f;
    if (typeof f.name==='string') fn=f.name;
    const ext=fn.match(/(\.\w+)$/)[1];
    if (ext=='.xml') {
        const xmlcontent=await fs.promises.readFile(f,'utf8');
        return parseBuffer(xmlcontent,fn);
    } else {
        throw "unknown extension "+ext
    }
}
const getZipFileToc=async (zip,zipfn)=>{
    let zipfiles,tocpage=[];
    if (zip.fileEntries) { //lazip, deflate content is not in memory
        zipfiles=zip.fileEntries.map(f=>f.fileNameStr);
    } else { // zip file in memory
        zipfiles=Object.keys(zip.files);
    }
    zipfiles.sort(alphabetically);
    return {files:zipfiles, tocpage};
}
export default {Formatter:OffTextFormatter,TypeDef:CBetaTypeDef,
    parseFile,parseBuffer,getZipFileToc}