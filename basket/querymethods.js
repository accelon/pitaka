import { fromSim } from "lossless-simplified-chinese";
import { parseQuery,plRanges,TOFIND_MAXLEN,scoreLine } from "../search/index.js";

export async function fulltextSearch(tofind,opts={}){
    const ptk=this;
    if (!ptk.inverted) await ptk.setupInverted();
	if (!ptk.inverted) return null;
    tofind=tofind.slice(0,TOFIND_MAXLEN);
    const [phrases,postings]=await parseQuery(ptk,tofind,opts);
    const scoredLine=opts.excerpt?scoreLine(ptk.inverted.linetokenpos,postings):[];
    const r={ tofind,caption:'內文',postings, scoredLine ,phrases}
    return r;
}
export function registerQueryMethods(){
    const self=this;
    
    this.labels.forEach(label=>{
        if (label.query) self.querymethods[ label.name ]=[ label.query, label];
    });
    this.querymethods['*']=[fulltextSearch,self];
}
export async function runQuery(method,tofind,opts) {
    const [qm,self]=this.querymethods[method];
    let r=await qm.call(self,tofind,opts);
    if (!r.count && tofind!==fromSim(tofind)) {
        r=await qm.call(self,fromSim(tofind),opts);
    }
    return r;
}
export async function runAllQuery(tofind,opts){
    const out=[];
    for (let method in this.querymethods){
        const r=await runQuery.call(this,method,tofind,opts);
        out.push(r);
    }
    return out;
}

export default {registerQueryMethods,runAllQuery,runQuery,fulltextSearch};