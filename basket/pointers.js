import pool from './pool.js';
import {PATHSEP} from '../platform/constants.js'

function findTransclusion(ptk,srcptk,ptr){
    const tlbl=ptk.findLabel('t');
    const [startfrom]=srcptk.getPage(ptr);
    const backlinks = tlbl.getBacklinks(ptr,startfrom);

    //translate source y to loc
    for (let y in backlinks) {
        backlinks[y]=backlinks[y].map(item=>{
            const [hook,srcy]=item;
            const srcptr=ptk.locate(srcy).join(PATHSEP);
            return [hook,PATHSEP+ptk.name+PATHSEP+srcptr+PATHSEP+hook];
        })
    }
    return backlinks;
}
function getBacklinks(ptr) {
    const out={};
    for (let ptkname in this.foreign) {
        const ptk=pool.get(ptkname);
        out[ptkname]=ptk.findTransclusion(ptk,this,ptr);                
    }
    return out;
}
function backlinkCount(loc){
    const out={};
    
    for (let ptkname in this.foreign) {
        const ptk=pool.get(ptkname);
        const tlbl=ptk.findLabel('t');
 
        out[ptkname]=tlbl.countBacklinks(loc);
    }
    return out;
}
function addForeign(ptkname) {
    this.foreign[ptkname]=true;
}


export default {findTransclusion,getBacklinks,addForeign,backlinkCount}