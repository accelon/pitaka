import OffTextFormatter from '../offtext/formatter.js';
import {handlers,closeHandlers,CBetaTypeDef} from './tei.js'
import {DOMFromString,xpath} from '../xmlparser/index.js';
import { alphabetically } from '../utils/sortedarray.js';

const XML2OffText = (el,ctx) =>{

    if (typeof el=='string') {                     // a string node arrives
        let s=el.trimRight();
        if (ctx.hide) {
            if (ctx.compact) {
                ctx.compact=false;
                return ' ';
            } else {
                return '';
            }
        }

        if (ctx.compact && s.charCodeAt(0)<0x7f) { // a compact offtag is emitted just now
            s=' '+s;                               // use blank to separate tag ]
            ctx.compact=false;
        }
        if (s) ctx.snippet=s;
        return ctx.started?s:'';
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
const parseBuffer=(buf,fn='',ctx)=>{
    if (fn) process.stdout.write('\r processing'+fn+'    ');

    const el=DOMFromString(buf);
    const body=xpath(el,'text/body');
    const charmap=buildChapmap(xpath(el,'teiHeader/encodingDesc/charDecl'));

    let m=fn.match(/n([\dabcdefABCDEF]+)_(\d+)/);
    let bk='',bkno='',chunk='';

    const sutraNo=m[1].replace('_'+m[2],'').toLowerCase();
    let sutraline=ctx.catalog[sutraNo].trim();
    bkno=sutraNo.replace(/^0+/,'');

    const at=sutraline.indexOf(' ^');
    if (at>-1) {
        sutraline=sutraline.substr(0,at)+']'+sutraline.substr(at);
    } else sutraline+=']'

    if (m[2]=='001') {
        bk='^bk[n='+bkno+' '+sutraline;
    }

    let juan=parseInt(m[2]);

    if (bkno==='946') {
        if (juan>=4) juan--; //946 其實只有四卷, 缺檔 _003
    } else if (bkno==="2799" ||bkno==='2825') {
        if (juan===3) juan=2;
    } else if (bkno==='2805') {
        if (juan===5) {
            bk='^bk[n='+bkno+' '+sutraline;
            juan=1;
        } else if (juan===7) juan=2; 
    } else if (bkno==='2139') {
        if (juan===10) juan=2; //workaround 老子西昇化胡經
    } else if (bkno==='2772') {
        if (juan===3) {
            bk='^bk[n='+bkno+' '+sutraline;
            juan=1;
        } else if (juan===6) juan=2; 
    } else if (bkno==='2748'||bkno==='2754'||bkno==='2757'
    ||bkno==='2764b'||bkno==='2769'||bkno==='2803'||bkno=='2809'
    ||bkno==='2820') { //only 1 juan
        bk='^bk[n='+bkno+' '+sutraline;
        juan=1;
    }
    chunk='^c'+juan+'\n';

    let content=bk+chunk+XML2OffText(body,{lbcount:0,hide:0,snippet:'',div:0,charmap,fn,started:false});
    content=content.replace(/\^r\n/g,'\n');
    return content;
}
const parseFile=async (f,ctx)=>{
    const fn=f;
    if (typeof f.name==='string') fn=f.name;

    const ext=fn.match(/(\.\w+)$/)[1];
    if (ext=='.xml') {
        const xmlcontent=await fs.promises.readFile(f,'utf8');
        return parseBuffer(xmlcontent,fn,ctx);
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