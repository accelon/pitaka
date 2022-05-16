import {bsearch} from "../utils/index.js";
import {matchEntry,filterEntry} from "../search/entry.js";

function getEntry(n) {
    const lbl=this.getLabel('e');
    if (!lbl)return [];
    return [n, lbl.idarr[n] , ...lbl.getRange(n)];
}
function filterDictEntry(tofind,mode=0) {
    const lbl=this.getLabel('e');
    if (!lbl)return [];
    const entries=filterEntry(tofind,lbl.idarr,mode=0);
    return entries.map(i=>{
        const [from,to]=lbl.getRange(i);
        return {
            
            nth:i,caption:lbl.names[i],entry:lbl.idarr[i], attrs:lbl.getAttrs(i),from,to
        }
      });
}
function matchDictEntry(tofind){
    if (!tofind)return;
    const lbl=this.getLabel('e');
    if (!lbl)return [];
    return matchEntry(tofind,lbl);
}
function getName(tag){
    const m=tag.match(/([a-z]+)(\d+)/);
    if (!m)return '';
    const label=this.getLabel(m[1]);
    if (!label)return;

    const at=label.idarr.indexOf(m[2]);
    if (at>-1) {
        return label.idarr[at];
    }
    return '';
}
function enumLemma(str){
    if (!this.lemma) return [];
    const out=[];
    for (let i=2;i<str.length;i++) {
        const w=str.slice(0,i);
        const at=bsearch(this.lemma,w);
        if (at>-1) out.push(w);
    }
    out.sort((a,b)=>b.length-a.length);
    return out;
}
export default {getName,matchDictEntry,filterDictEntry,getEntry,enumLemma}