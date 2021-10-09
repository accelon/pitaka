import { bsearch } from "../utils/bsearch.js" ;
function getEntry(n) {
    const lbl=this.findLabel('e');
    if (!lbl)return [];
    return [n, lbl.names[n] , ...lbl.getRange(n)];
}
function filterEntry(tofind,mode=0){
    const lbl=this.findLabel('e');
    if (!lbl)return [];
    const out=[];
    if (mode==0) {
        let at=bsearch(lbl.names,tofind);
        while (at>-1 && at<lbl.names.length) {
            if (lbl.names[at].substr(0,tofind.length)==tofind) {
                out.push([at,lbl.names[at], ...lbl.getRange(at)]);
                at++
            } else break;
        }
    } else if (mode===2){ //後
        for (let i=0;i<lbl.names.length;i++) {
            const name=lbl.names[i];
            const at=name.indexOf(tofind);
            if (at>0&&at+tofind.length==name.length) {
                out.push([i,lbl.names[i], ... lbl.getRange(i)]);
            }
        }    
    } else {
        for (let i=0;i<lbl.names.length;i++) {
            const name=lbl.names[i];
            const at=name.indexOf(tofind);
            if (at>0 && at+tofind.length<name.length) {
                out.push([i,lbl.names[i], ... lbl.getRange(i)]);
            }
        }    
    }
    return out;
}
function matchEntry(tofind){
    if (!tofind)return;
    const lbl=this.findLabel('e');
    if (!lbl)return [];
    const out=[];
    for (let i=1;i<=tofind.length;i++) {
        const at=lbl.find(tofind.substr(0,i));
        if (at>-1) {
            out.push([at,lbl.names[at],...lbl.getRange(at)]);
        }
    }
    out.sort((a,b)=>b[1].length-a[1].length);
    return out;
}
function getName(tag){
    const m=tag.match(/([a-z]+)(\d+)/);
    if (!m)return '';
    const label=this.findLabel(m[1]);
    if (!label)return;

    const at=label.idarr.indexOf(m[2]);
    if (at>-1) {
        return label.names[at];
    }
    return '';
}

export default {getName,matchEntry,filterEntry,getEntry}