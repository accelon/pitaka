import {extractChineseNumber} from 'pitaka/utils';
import OffTextFormatter from '../offtext/formatter.js';
import {readTextFile} from 'pitaka/platform'

// import hotfixes from './lit-hotfix.js';
const tidy=str=>str.replace(/<<([\d▉\u3400-\u9fff]+)>>/g,'《$1》')
           .replace(/<([\d▉\u3400-\u9fff]+)>/g,'〈$1〉');

class Formatter extends OffTextFormatter {
    constructor (context,log){
        super();
        this.context=context||{};
        if (typeof this.context.nchapter==='undefined') this.context.nchapter=0;
        if (typeof this.context.error==='undefined') this.context.error=0;
        this.log=log||console.log;
    }
    applyfix(content){
        if (!this.context.errata) return content;
       
        const hotfix=this.context.errata[this.context.filename];
        if (hotfix) {
            for (let i=0;i<hotfix.length;i++) {
                const fix=hotfix[i];
                const newcontent=content.replace(fix[0],fix[1]);
                if (newcontent===content) {
                    this.log('fixed not fully apply',fix,'for',this.context.filename);
                }
                content=newcontent;
            }
        }
        return content;
    }
    parseHeader(str){
        str=str.replace(/<[^>]+>/g,'');
        const cn=extractChineseNumber(str);
        if (cn) {
            if (cn && cn!==this.context.nchapter+1 && cn!==1) {
                this.log('chapter number',this.context.filename,str,cn,'prev',this.context.nchapter+1);
            }
            this.context.nchapter=cn;
            return '^c'+cn+' '+str;
        } else {
            return (str==='本書說明'?'^c0 ':'^c ')+str;
        }
    }
    scan(content,converted){

        if (converted) return super.scan(content.split('\n'))

        const out=[];
        const rawlines=tidy(this.applyfix(content)).split(/\r?\n/);

        const {eudc,EUDC}=this.context; //EUDC from external eudc.json

        for (let i=0;i<23;i++) rawlines.shift();
        rawlines.length=rawlines.length-29;
        const ch=this.parseHeader(rawlines.shift().trim());
        out.push(ch);
        
        for (let i=0;i<rawlines.length;i++) {
            let s=rawlines[i].replace(/<br \/>$/i,'').replace(/<br \/>$/i,'')
            .replace(/<br>$/ig,'\n')
            .replace(/^\t+/,'');
            if (!s) continue;
            const space=s[0].match(/[a-zA-Z_\d]/)?' ':'';
            s=s.replace(/<img src=[\-a-z\.\/:]+([A-Z\d]+)\.BMP[^>]+>/g,(m,m1)=>{
                const u=EUDC[m1];
                if (!u) {
                    if (!eudc[m1]) {
                        this.log('missing eudc',m1,this.context.filename);
                        this.context.error++;
                        eudc[m1]=0;
                    }
                    eudc[m1]++;
                }
                return u?u:"^mc[$1]";
            })

            s=s.replace(/<b>([^<]+)<\/b>/ig,'^b[$1]');
            s=s.replace(/<i>([^<]+)<\/i>/ig,'^i[$1]');
            s=s.replace(/^　　 ?\^b\[([^\[]+)\]$/,'^h'+space+'$1');
            s=s.replace(/<br>/ig,'\n');
            s=s.replace(/<br \/>/ig,'\n');
 
            s=s.replace(/<\/?td[^>]*>/g,'')
            s=s.replace(/<\/?tr[^>]*>/g,'')
            s=s.replace(/<\/?table[^>]*>/g,'')
            if (s.indexOf('<')>0) {
                this.log('residue tag',this.context.filename,':',(i+24),
                s.substr(s.indexOf('<'),50));
                this.context.error++;
            }
            out.push(s);
        }
        
        return super.scan(out.join('\n').split('\n')); //<br> replace with \n , join+split
    }
}
const getZipFileToc=async (zip,zipfn)=>{
    const zipfiles=[],tocpage=[];
    const indexhtml=await zip.files['index.html'].async('string');

    const m=indexhtml.match(/<title>([^ <]+)/); 
    if (m) {
        const id=zipfn.match(/lit_(\d+)/)[1];
        tocpage.push('^bk'+id+' '+m[1]); //第一行為書名，和haodoo 一致
    } else {
        tocpage.push('^bk 缺書名');
    }

    indexhtml.replace(/<a href="([\d]+\.html)" target="right_Article" ?>(.+?)<\/a>/g,(m,fn,toc)=>{
        if (!zip.files[fn]) console.log(fn,'not found');
        tocpage.push(toc.replace(/<[^>]+>/g,''))
        zipfiles.push(fn);
    })

    if (zipfiles.indexOf('readme.html')==-1 && zip.files['readme.html']) {
        zipfiles.push('readme.html');
        tocpage.push('本書說明')
    }

    return {files:zipfiles, tocpage};
}


/* for toolbox to open */
const parseFile=async (f,ctx)=>{
    let fn=f;
    if (typeof f.name==='string') fn=f.name;
    const ext=fn.match(/(\.\w+)$/)[1];
    if (ext!=='.zip') {
        const rawcontent=await readTextFile(f)
        const rawlines=rawcontent.split("\n");
        return {lines:rawlines,rawlines,toclines:[],rawcontent};
    } else {
        const Zip= (typeof JSZip!=='undefined' && JSZip) || lazip.JSZip; 
        const jszip=new Zip();
        const zip=await jszip.loadAsync(f.getFile());

        const lines=[] ,toclines=[0];
        const jobs=[], rawlines=[] ;
        const { files,tocpage}=await getZipFileToc(zip,fn);
        lines.push(...tocpage);
        rawlines.push(...tocpage);
        const context={filename:fn};
        const formatter=new Formatter(context);
        
        const chunks=new Array(files.length); //promises finished not in sequence
        for (let i=0;i<files.length;i++){
            const file=files[i];
            jobs.push(zip.file(file).async('string').then(c=>chunks[i]=c));
        }
        await Promise.all(jobs);

        for (let i=0;i<chunks.length;i++) {
            const out=formatter.scan(chunks[i]);
            toclines[i+1]=lines.length;
            lines.push(...out.text);
            rawlines.push(...out.rawlines);
        }

        return {lines,toclines,rawlines};
    }
}

export default {getZipFileToc,Formatter,parseFile}