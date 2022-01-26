import { PATHSEP,DEFAULT_LANGUAGE } from "../platform/constants.js";
import { parseAddress } from "../offtext/pointers.js";
export function getParallelLinks(y_loc){
    let loc=y_loc;
    if (typeof loc==='number') {
        loc=this.locOf(y_loc,true);
    }
    const addr=parseAddress(loc);
    const ploc=this.pageLoc(addr.loc);
    const m=ploc.match(/(\.[^\/]+)/);
    const out=[];
    if (m && this.header.parallels) {
        for (let i=0;i<this.header.parallels.length;i++) {
            const par=this.header.parallels[i];
            if ('.'+par!==m[1]) {
                const newloc= addr.loc.replace(m[1],'.'+par);
                out.push({ par, basket: this.name,loc:newloc,address:this.name+PATHSEP+newloc});
            }
        }
    }
    return out;
}
export function langOf(y_loc) {
    if (!this.labelLang) return this.header.lang||DEFAULT_LANGUAGE;
    let y=y_loc;
    if (typeof y_loc!=='number') {
        y=this.getPageRange(y_loc)[0];
    }
    return this.labelLang.langOf(y);
}
export default {getParallelLinks,langOf};