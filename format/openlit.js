import {headerWithNumber,fromChineseNumber} from 'pitaka/utils';
import offTextFormatter from '../offtext/formatter.js';

import EUDC from './openlit-eudc.js';
import hotfixes from './openlit-hotfix.js';
const tidy=str=>str.replace(/<<([\d▉\u3400-\u9fff]+)>>/g,'《$1》')
           .replace(/<([\d▉\u3400-\u9fff]+)>/g,'〈$1〉');
class Formatter extends offTextFormatter {
    constructor (context,log){
        super();
        this.context=context;
        this.log=log;
    }
    applyfix(content){
        const hotfix=hotfixes[this.context.filename];
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
        let cn=0;
        for (let i=0;i<headerWithNumber.length;i++) {
            const pat=headerWithNumber[i];
            const m=str.match(pat);
            if (m) cn=fromChineseNumber(m[1]);
            // if (m) this.log(cn,m[1])
        }
        if (cn) {
            if (cn && cn!==this.context.nchapter+1 && cn!==1) {
                this.log('chapter number',this.context.filename,str,cn,'prev',this.context.nchapter+1);
            }
            this.context.nchapter=cn;
            return '^ch'+cn+' '+str;
        } else {
            return '^ch '+str;
        }
    }
    scan(content){
        const out=[];
        const rawlines=tidy(this.applyfix(content)).split(/\r?\n/);
        if (this.context.filename=='readme.html') {
            const m=content.match(/<title>([^ <]+)/);
            if (m) {
                out.push('^book '+m[1]);
            }
        }

        const {eudc}=this.context;
        for (let i=0;i<23;i++) rawlines.shift();
        rawlines.length=rawlines.length-29;
        const ch=this.parseHeader(rawlines.shift().trim());
        out.push(ch);
        
        for (let i=0;i<rawlines.length;i++) {
            let s=rawlines[i].replace(/<br \/>$/i,'').replace(/<br \/>$/i,'')
            .replace(/<br>$/ig,'\n')
            .replace(/^\t+/,'');
            s=s.replace(/^　　/,'^p');
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
            s=s.replace(/^\^p ?\^b\[([^\[]+)\]$/,'^h'+space+'$1');
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
            s=s.replace(/\n　　/g,'\n^p');
            out.push(s);
        }
        return super.scan(out.join('\n'));
    }
}
const getZipFileOrder=async zip=>{
    const zipfiles=[];
    const index=await zip.files['index.html'].async('string');
    index.replace(/<a href="([\d]+\.html)" target="right_Article"/g,(m,fn)=>{
        if (!zip.files[fn]) console.log(fn,'not found');
        zipfiles.push(fn);
    })
    if (zip.files['readme.html']) zipfiles.unshift('readme.html');
    return zipfiles;
}

export default {getZipFileOrder,Formatter}