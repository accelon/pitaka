import { fromSim } from "lossless-simplified-chinese";
import { phraseQuery } from "../fulltext/index.js";
async function phrasePosting (tofind){
    const ptk=this;
    const posting=await phraseQuery(ptk,tofind);
    return { tofind,caption:'內文',posting,count:posting.length}
}
export function registerQueryMethods(){
    const self=this;
    
    this.labels.forEach(label=>{
        if (label.query) self.querymethods[ label.name ]=[ label.query, label];
    });
    this.querymethods['_phrase']=[phrasePosting,self];
}

export async function tryAllQuery(tofind){
    const out=[];
    for (let key in this.querymethods){
        const [qm,self]=this.querymethods[key];
        let r=await qm.call(self,tofind);
        if (!r.count && tofind!==fromSim(tofind)) {
            r=await qm.call(self,fromSim(tofind));
        }
        out.push(r);
    }
    return out;
}

export default {registerQueryMethods,tryAllQuery};