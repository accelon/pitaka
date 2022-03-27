import pool from './pool.js';
import {PATHSEP} from '../platform/constants.js'
import {getQuickPointerParser,getQuickPointerSyntax} from '../format/index.js';
import LabelTypes from '../htll/labeltypes.js';
import { bsearch } from 'pitaka/utils';
const {LabelVol,LabelPage} = LabelTypes;

function findTransclusion(srcptk,ptr){
    if (!this.lblTransclusion)return {};
    const [startfrom]=srcptk.getPageRange(ptr);
    const backlinks = this.lblTransclusion.getBacklinks(ptr,startfrom);
    for (let y in backlinks) {  //translate source y to loc
        backlinks[y]=backlinks[y].map(item=>{
            const [hook,srcy]=item;
            const srcptr=this.locOf(srcy);
            return [hook,PATHSEP+this.name+PATHSEP+srcptr+PATHSEP+hook];
        })
    }
    return backlinks;
}
function getBacklinks(ptr) {
    const out={};
    for (let ptkname in this.foreign) {
        const ptk=pool.get(ptkname);
        out[ptkname]=ptk.findTransclusion(this,ptr);                
    }
    return out;
}
function backlinkCount(loc){
    const out={};
    for (let ptkname in this.foreign) {
        const ptk=pool.get(ptkname);
        if (!ptk.lblTransclusion) continue;
        out[ptkname]=ptk.lblTransclusion.countBacklinks(loc);
    }
    return out;
}


const quickPointerParser=(ptk,str)=>{
    if (typeof str!=='string' && !str) {
        return 0;
    }

    const [from]=ptk.getPageRange(str);
    if (from) {
        return from + 1; //^c 可能在^bk 的下一行
    } else  {//try vol/page
        const lblvol=ptk.findLabelType(LabelVol);
        const lblpg=ptk.findLabelType(LabelPage);
        const m=str.match(/(\d+)p(\d+[abc]?)/);
        if (m && lblvol && lblpg) {
            let [m0,vol,pg] = m;
            const volstart=lblvol.linepos[ +vol-1 ];
            if (lblpg.cols>1 && !isNaN( +pg[pg.length-1]) ) pg=pg+'a';
            const start=bsearch(lblpg.linepos,volstart,true) + lblpg.npage(pg);
            return lblpg.linepos[start];
        }
    }
}

function parseQuickPointer(str){
    const parser=getQuickPointerParser(this.header.format) || quickPointerParser;
    const y=parser(this,str);
    return this.closest(y);
}
function quickPointerSyntax(){
    return getQuickPointerSyntax(this.header.format) || 
    "「書號/卷數」或「冊p頁」，卷數可省略。";
}
export default {findTransclusion,getBacklinks,backlinkCount,
    parseQuickPointer,quickPointerSyntax}