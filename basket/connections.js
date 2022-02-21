import { PATHSEP,DEFAULT_LANGUAGE } from "../platform/constants.js";
import { parseAddress } from "../offtext/pointers.js";
import pool from './pool.js';


export function getAlignedHeading(loc){
    const y=this.locY(loc);
    if (!y) return '';//無對應經文
    const [text]=this.headingOf(y);
    return text;
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
    if (!this.labelLang) return this.header.lang||DEFAULT_LANGUAGE;
    let y=y_loc;
    if (typeof y_loc!=='number') {
        y=this.getPageRange(y_loc)[0];
    }
    return this.labelLang.langOf(y);
}
function connectTransclusion(){
    if (!this.lblTransclusion) return;
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
    if (!alignment) return;
    if (!alignedPitaka[alignment]) alignedPitaka[alignment]=[];
    if (!alignedPitaka[alignment].includes(this.name)) {
        alignedPitaka[alignment].push(this.name);
    }
    const name=this.name;
    return alignedPitaka[alignment].filter(n=>n!==name);
}
function connect(){
    connectTransclusion.call(this);
    this.aligned = connectAlignment.call(this);
}
export default {getParallelLinks,langOf,connect,getAlignedHeading};