import pool from './pool.js';
import {PATHSEP} from '../platform/constants.js'
import {getQuickPointerParser} from '../format/index.js';
import LabelTypes from '../htll/labeltypes.js';
import { bsearch } from 'pitaka/utils';
const {LabelBook,LabelChapter,LabelVol,LabelPage} = LabelTypes;

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

function connect(){
    if (!this.lblTransclusion) return;
    const self=this;
    this.lblTransclusion.ptks.forEach(ptk=>{
        const fptk=pool.get(ptk);
        if (fptk) {
            if (!fptk.foreign[self.name]) fptk.foreign[self.name]=true;
            if (self.futureforeign[ptk]) delete self.futureforeign[ptk];
        } else {
            self.futureforeign[ptk]=true;  //not in pool yet
        }
    })
}
const quickPointerParser=(ptk,str)=>{
    const bk=ptk.findLabelType(LabelBook);
    const c=ptk.getLabel('c');             //LabelChapter or LabelLinepos(nameless)
    const [from,to]=ptk.getPageRange(str);
    if (from) {
        return from ;
    } else  {//try vol/page
        const lblvol=ptk.findLabelType(LabelVol);
        const lblpg=ptk.findLabelType(LabelPage);
        const m=str.match(/(\d+)p(\d+[abc]?)/);
        if (m && lblvol && lblpg) {
            let [m0,vol,pg] = m;
            const volstart=lblvol.linepos[ +vol-1 ];
            if (pg.cols>1 && isNaN( +pg[pg.length-1]) ) pg=pg+'a';
            const start=bsearch(lblpg.linepos,volstart,true) + lblpg.npage(pg);
            return lblpg.linepos[start];
        }
    }
    
}
function parseQuickPointer(str){
    const parser=getQuickPointerParser(this.header.format) || quickPointerParser;
    const y=parser(this,str);
    console.log('closest',y,this.closest(y))
}

export default {findTransclusion,getBacklinks,backlinkCount,connect,parseQuickPointer}