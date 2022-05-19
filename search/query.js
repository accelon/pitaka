import {plAnd,getCounter, getSpeed,plRanges} from './posting.js';
import {fromSim} from 'lossless-simplified-chinese'
const queryCache={};
export const TOFIND_MAXLEN=50;
export const MAX_PHRASE=5;

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
export const scoreLine=(ltp,postings)=>{
    let i=0,scoredLine=[];
    const ltplast=ltp[ltp.length-1];
    const averagelinelen=ltplast/ltp.length;
    const allhits=postings.reduce((acc,i)=>i.length+acc ,0 );
    const weights=postings.map( pl=> Math.sqrt(allhits/pl.length) );
    const ptr=new Array(postings.length);
    ptr.fill(0);

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
    return scoredLine;
}

export const phraseQuery=async (ptk,phrase)=>{
    phrase=phrase.trim();
    const qkey=ptk.name+'@'+phrase;    
    let out=queryCache[qkey];
    if (out) return out;
    const tokens=await ptk.prepareToken(phrase);
    if (!tokens) return [];

    out=tokens[0][1];
    for (let i=1;i<tokens.length;i++) {
        let pl1=out;
        out=plAnd(pl1,tokens[i][1],i);
    }
    queryCache[qkey]=out;
    return out;
}
export const parseQuery=async (ptk,tofind,opts)=>{
    opts=opts||{};
    const phrases=tofind.split(/[ 　]/);
    if (phrases.length>MAX_PHRASE) phrases.length=MAX_PHRASE;
    const outphrases=[], postings=[];
    for (let i=0;i<phrases.length;i++) {
        if (!phrases[i].trim()) continue;
        let posting=await phraseQuery(ptk,phrases[i]);
        if (!posting.length && opts.tosim) {
            posting=await phraseQuery(ptk,fromSim(phrases[i]));
        }
        if (opts.ranges && opts.ranges.length) {//only search in ranges
            posting=plRanges(posting,opts.ranges);
        }
        outphrases.push(phrases[i]);
        postings.push(posting)
    }
    return [outphrases,postings];
}
export const validateTofind=str=>{
    return (str||'').replace(/[\[\]&%$#@\/\^]/g,'').trim();
}
export default {phraseQuery,validateTofind,scoreLine,TOFIND_MAXLEN};