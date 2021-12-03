import { parseAddress } from "../offtext";
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
                out.push(loc.replace(m[1],'.'+par));
            }
        }
    }
}
export default {getParallelLinks};