import { PATHSEP,DEFAULT_LANGUAGE } from "../platform/constants.js";
import { parseAddress } from "../offtext/pointers.js";
import pool from './pool.js';
// import { useBasket } from "./index.js";

export function hasBook(books){
    const bk=this.findLabelType('LabelBook');
    if (!bk) return false;
    if (typeof books=='string') books=[books];
    for (let i=0;i<books.length;i++) {
        if (bk.idarr.indexOf(books[i])>-1) return true;
    }
    return false;
}
export function alignedY(y, master){
    // const alignment=this.header.alignment;
    // const master=pool.get(alignment);    
    if (master==this) return y;
    if (!master || master.header.lastTextLine==this.header.lastTextLine) return y;
    /* slow mode, partially aligned */
    const loc=master.locOf(y);
    const newy=this.locY(loc);
    return newy;
}
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
    if (!this.cache.labelLang || typeof (y_loc)=='undefined') {
    	return this.header.lang||DEFAULT_LANGUAGE;
    }
    let y=y_loc;
    if (typeof y_loc!=='number') {
        y=this.getPageRange(y_loc)[0];
    }
    return this.cache.labelLang.langOf(y);
}
function connectTransclusion(){
    if (!this.lblTransclusion||!this.lblTransclusion.ptks) return;
    const self=this;
    this.lblTransclusion.ptks.forEach(ptk=>{
        const fptk=pool.get(ptk);
        if (fptk) {
            if (!fptk.foreign[self.name]) fptk.foreign[self.name]=true;
            if (self.futureforeign[ptk]) delete self.futureforeign[ptk];
        } else {
            self.futureforeign[ptk]=true;  //not in pool yet
        }
    })
}
const alignedPitaka={}; //key:[all conected ]
function connectAlignment(){
    const alignment=this.header.alignment;
    if (!alignment.length) return;

    if (!alignedPitaka[alignment]) alignedPitaka[alignment]=[];
    if (!alignedPitaka[alignment].includes(this.name)) {
        alignedPitaka[alignment].push(this.name);
    }
    const name=this.name;
    return alignedPitaka[alignment].filter(n=>n!==name);
}
function connect(){
    connectTransclusion.call(this);
    this.aligned = connectAlignment.call(this) || [];
}
export default {getParallelLinks,langOf,connect,alignedY,hasBook};