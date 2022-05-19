import { fromSim } from "lossless-simplified-chinese";
import { parseQuery,plRanges,LINETOKENGAP } from "../search/index.js";

const scoreMatch=(matching,weights)=>{
    if (matching.length==0) return 0;
    let score=0,matchcount=0;

    for (let j=0;j<weights.length;j++) {
        if (matching[j]) {
            matchcount++;
            score+= weights[j] * (matching[j]>1?Math.sqrt(matching[j]):1); //出現一次以上，效用递減
        }
    }
    let boost=(matchcount/weights.length);
    boost*=boost;  // 有兩個詞，只有一個詞有hit ，那boost只有 0.25。
    return score*boost;
}
export async function fulltextSearch(tofind,opts={}){
    const ptk=this;
    if (!ptk.inverted) await ptk.setupInverted();
	if (!ptk.inverted) return null;
    tofind=tofind.slice(0,50);

    const [phrases,postings]=await parseQuery(ptk,tofind,opts);
    let scoredLine=[];
    const allhits=postings.reduce((acc,i)=>i.length+acc ,0 );
    const weights=postings.map( pl=> Math.sqrt(allhits/pl.length) );
    
    const ptr=new Array(postings.length);
    ptr.fill(0);
    const ltp=ptk.inverted.linetokenpos;
    const ltplast=ltp[ltp.length-1];
    const averagelinelen=ltplast/ltp.length;

    if (opts.excerpt) {
        let i=0;
        while (i<ltp.length-1) { //sum up all Postings 
            let nearest=ltplast;
            const from=ltp[i], to=ltp[i+1];
            let matching=[];
            for (let j=0;j<postings.length;j++) {
                const pl=postings[j];
                let v=pl[ptr[j]];
                while (v<from&&ptr[j]<pl.length) {
                    ptr[j]++
                    v=pl[ptr[j]];
                }
                while (v>=from&&v<to) {
                    if (!matching[j]) matching[j]=0;
                    matching[j]++;                    
                    ptr[j]++;
                    v=pl[ptr[j]];
                }
                if (nearest>v) nearest=v;
            }

            const score=scoreMatch(matching,weights);
            //boost single phrase search with linelen, shorter line get higher score
            let shortpara = 10*(averagelinelen/(to-from+1)) ;  //short para get value > 1
            if (shortpara<10) shortpara=10;

            //出現次數相同，較短的段落優先
            const boost=Math.log(shortpara); //boost 不小於 1

            if (score>0) scoredLine.push([i+1,score*boost]);//y is 1 base
            i++;
            while (nearest>ltp[i+1]) i++;
        }
        scoredLine=scoredLine.sort((a,b)=>b[1]-a[1]);
    }
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