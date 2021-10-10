import pool from './pool.js';

function findTransclusion(ptk,ptr){
    const tlbl=ptk.findLabel('t');
     
    return [];
}
function getBacklinks(ptr) {
    const out=[];
    for (let ptkname in this.foreign) {
        const ptk=pool.get(ptkname);
        out.push( ... ptk.findTransclusion(ptk,ptr));
    }
    return out;
}
function addForeign(ptkname) {
    this.foreign[ptkname]=true;
}


export default {findTransclusion,getBacklinks,addForeign}