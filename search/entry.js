import { bsearch } from "../utils/bsearch.js" ;
export const ENTRY_MATCH_BEGIN=1;
export const ENTRY_MATCH_END=2;
export const ENTRY_MATCH_MIDDLE=3; //not begin, not end
export const ENTRY_MATCH_ANY=4; //
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
    if (mode==ENTRY_MATCH_BEGIN) {
        let at=bsearch(entries,tofind,true);
        while (at>-1 && at<entries.length) {
            if (entries[at].substr(0,tofind.length)==tofind) out.push(at++);
            else break;
        }
    } else if (mode===ENTRY_MATCH_END){ //後
        for (let i=0;i<entries.length;i++) {
            const name=entries[i];
            const at=name.indexOf(tofind);
            if (at>0&&at+tofind.length==name.length) out.push(i);
        }    
    } else if (mode===ENTRY_MATCH_MIDDLE) { //中
        for (let i=0;i<entries.length;i++) {
            const name=entries[i];
            const at=name.indexOf(tofind);
            if (at>0 && at+tofind.length<name.length) out.push(i);
        }    
    } else { //ENTRY_MATCH_ANY
        for (let i=0;i<entries.length;i++) {
            const name=entries[i];
            ~name.indexOf(tofind) && out.push(i);
        }            
    }
    return out;
}