import pool from './pool.js';
import {PATHSEP} from '../platform/constants.js'

function findTransclusion(srcptk,ptr){
    if (!this.lblTransclusion)return {};
    const [startfrom]=srcptk.getPage(ptr);
    const backlinks = this.lblTransclusion.getBacklinks(ptr,startfrom);
    for (let y in backlinks) {  //translate source y to loc
        backlinks[y]=backlinks[y].map(item=>{
            const [hook,srcy]=item;
            const srcptr=this.locate(srcy).join(PATHSEP);
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

export default {findTransclusion,getBacklinks,backlinkCount,connect}