import { bsearch } from "../utils/bsearch.js" ;
function getEntry(n) {
    const lbl=this.getLabel('e');
    if (!lbl)return [];
    return [n, lbl.idarr[n] , ...lbl.getRange(n)];
}
function filterEntry(tofind,mode=0){
    const lbl=this.getLabel('e');
    if (!lbl)return [];
    const out=[];
    if (mode==0) {
        let at=bsearch(lbl.idarr,tofind);
        while (at>-1 && at<lbl.idarr.length) {
            if (lbl.idarr[at].substr(0,tofind.length)==tofind) {
                out.push([at,lbl.idarr[at], ...lbl.getRange(at)]);
                at++
            } else break;
        }
    } else if (mode===2){ //後
        for (let i=0;i<lbl.idarr.length;i++) {
            const name=lbl.idarr[i];
            const at=name.indexOf(tofind);
            if (at>0&&at+tofind.length==name.length) {
                out.push([i,lbl.idarr[i], ... lbl.getRange(i)]);
            }
        }    
    } else {
        for (let i=0;i<lbl.idarr.length;i++) {
            const name=lbl.idarr[i];
            const at=name.indexOf(tofind);
            if (at>0 && at+tofind.length<name.length) {
                out.push([i,lbl.idarr[i], ... lbl.getRange(i)]);
            }
        }    
    }
    return out;
}
function matchEntry(tofind){
    if (!tofind)return;
    const lbl=this.getLabel('e');
    if (!lbl)return [];
    const out=[];
    for (let i=1;i<=tofind.length;i++) {
        const at=lbl.find(tofind.substr(0,i));
        if (at>-1) {
            const [from,to]=lbl.getRange(at);
            out.push({at,e:lbl.idarr[at],from,to } );
        }
    }
    out.sort((a,b)=>b.e.length-a.e.length);
    return out;
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

export default {getName,matchEntry,filterEntry,getEntry}