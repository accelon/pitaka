import { bsearch } from "../utils/bsearch.js" ;
export function matchEntry(tofind,lbl) {
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
export function allEntry(entries){
    const out=[];
    for (let i=0;i<entries.length;i++) {
        out.push(i)
    }
    return out;
}
export function filterEntry(tofind,entries,mode=0){
    const out=[];
    if (mode==0) {
        let at=bsearch(entries,tofind,true);
        while (at>-1 && at<entries.length) {
            if (entries[at].substr(0,tofind.length)==tofind) out.push(at++);
            else break;
        }
    } else if (mode===2){ //後
        for (let i=0;i<entries.length;i++) {
            const name=entries[i];
            const at=name.indexOf(tofind);
            if (at>0&&at+tofind.length==name.length) out.push(i);
        }    
    } else { //中
        for (let i=0;i<entries.length;i++) {
            const name=entries[i];
            const at=name.indexOf(tofind);
            if (at>0 && at+tofind.length<name.length) out.push(i);
        }    
    }
    return out;
}