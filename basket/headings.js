import {allEntry} from '../search/entry.js';

function getHeadingFilters(){
    const filters=[];
    const lbl=this.getHeadingLabel();
    if (lbl.hasname) filters.push({name:lbl.name}); //chunk as entry
    for (let attrname in lbl.attrdef) {
        filters.push({...lbl.attrdef[attrname],attrname});
    }
    return filters;
}
const combineRanges=ranges=>{ //reduce range count, faster posting filtering
    const out=[];
    let pend=-1;
    for (let i=0;i<ranges.length;i++) {
        const r=ranges[i];
        if (pend==r[0]) {
            out[out.length-1][1]=r[1]
        } else {
            out.push( [ r[0], r[1] ] );
        }
        pend=r[1];
    }
    return out;
}
function getHeadingRanges(headings){//given heading idx , return its token pos, for fulltext search excludes 
    if (!this.inverted) return [];
    const lbl=this.getHeadingLabel();
    const ltp=this.inverted.linetokenpos;
    const ranges=headings.map(idx=> [ ltp[lbl.linepos[idx]],ltp[lbl.linepos[idx+1]]]);
    return combineRanges(ranges);
}
function allHeadings(indexonly=false) {
    const headings=this.getHeadingLabel().names;
    return indexonly?allEntry(headings):headings;
}

export default {getHeadingFilters,getHeadingRanges,allHeadings}