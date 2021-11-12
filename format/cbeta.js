import OffTextFormatter from '../offtext/formatter.js';
import {handlers,closeHandlers} from './tei.js'
import {DOMFromString,xpath,XML2OffText} from '../xmlparser/index.js';
import { alphabetically } from '../utils/sortedarray.js';


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
const fixJuanT=(bkno,juan,sutraline)=>{
    let bk='';
    if (juan===1) {
        bk='^bk[n='+bkno+' '+sutraline;
    }

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
    return [bk,juan]
}

const parseBuffer=(buf,fn='',ctx)=>{
    // if (fn) process.stdout.write('\r processing'+fn+'    ');
    ctx.rawContent=buf;
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

    let juan=parseInt(m[2]);
    
    if (fn[0]=='T') {
        [bk,juan]=fixJuanT(bkno,juan,sutraline);
    } else if (juan===1) {
        bk='^bk[n='+bkno+' '+sutraline;
    }

    chunk='^c'+juan+'\n';
    const teictx={defs:ctx.labeldefs,lbcount:0,hide:0,snippet:'',
    div:0,charmap,fn,started:false,transclusion:ctx.transclusion};
    let content=bk+chunk+XML2OffText(body,teictx,handlers,closeHandlers);
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
export const translatePointer=str=>{
    const m=str.match(/([A-Z])(\d\d)n(\d{4}[abcde]*)_p(\d\d\d\d)([abcdef])/);
    if (m) {
        const [mm,zj,vol,sutrano,page,col]=m;
        return '/cb-'+zj.toLowerCase()+'/v#'+vol.replace(/^0/,'')+'/p#'+page.replace(/^0+/,'')+col;
    }
    return ''
}
export default {Formatter:OffTextFormatter,translatePointer,
    parseFile,parseBuffer,getZipFileToc}