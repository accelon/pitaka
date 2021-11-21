import { phraseQuery } from "../fulltext";
async function phrasePosting (tofind){
    const ptk=this;
    const posting=await phraseQuery(ptk,tofind);
    return { tofind,caption:'全文',posting,count:posting.length}
}
export function registerQueryMethods(){
    const self=this;
    this.querymethods['_phrase']=[phrasePosting,self];
    this.labels.forEach(label=>{
        if (label.query) self.querymethods[ label.name ]=[ label.query, label];
    });
    console.log(this.querymethods)
}

export async function  tryAllQuery(tofind){
    for (let key in this.querymethods){
        const [qm,self]=this.querymethods[key];
        const r=await qm.call(self,tofind);
        if (r) {
            console.log(r)
        }
    }
}

export default {registerQueryMethods,tryAllQuery};