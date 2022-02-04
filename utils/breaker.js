import {OFFTAG_REGEX_G} from "../offtext/def.js"
import { diffChars, diffWords } from "diff";
export const spacify=str=>{ //remove all offtext and non ascii character, for more precise diff
    return str.replace(OFFTAG_REGEX_G,(m,tagname,attr)=>{
        return " ".repeat(tagname.length+(attr?attr.length:0)+1)
    }).replace(/[^a-zA-Z]/g,' ');
}

export const breakLine=(str,breaker)=>{
    const out=[];
    let prev=0;
    str.replace(breaker,(m,m1,idx)=>{
        out.push( str.substring(prev,idx+m1.length) );
        prev=idx+m1.length;
    })
    if (prev<str.length) {
        out.push(str.substr(prev))
    }
    return out;
}
export const autoBreak=(lines,breaker="([?!।॥;–—] +)")=>{
    if (typeof lines==='string') lines=[lines];
    const out=[];
    if (typeof breaker==='string') {
        breaker=new RegExp(breaker,"g");
    }
    for (let i=0;i<lines.length;i++) {
        out.push(...breakLine(lines[i],breaker))
    }
    return out;
}
export const paragraphSimilarity=(p1,p2)=>{
    const P1=p1.map(l=>l.replace(/ +/g,'').trim()).filter(it=>!!it);
    const P2=p2.map(l=>l.replace(/ +/g,'').trim()).filter(it=>!!it);
    const p1len=P1.reduce( (p,v)=> p+v.length ,0);
    const p2len=P2.reduce( (p,v)=> p+v.length ,0);
    
    const ratio1=P1.map( l=> l.length/p1len||0);
    const ratio2=P2.map( l=> l.length/p2len||0);
    const accdiff=P1.reduce((p,v,i)=> p+=Math.abs(ratio1[i]-ratio2[i])||0,0);
    return accdiff;
}
export const breakSentence=(str,breakpos)=>{
    const out=[];
    let prev=0;
    for (let i=0;i<breakpos.length;i++) {
        out.push(str.substring(prev,breakpos[i]));
        prev=breakpos[i]
    }
    if(prev<str.length-1) {
        out.push(str.substr(prev));
    }
    return out;
}
const SENTENCESEP=String.fromCodePoint(0x2fff);
export const diffBreak=(p1,p2)=>{ //p1 cs(larger unit), p2(smaller unit)
    const out=[],s1=p1.join(SENTENCESEP), s2=p2.join(SENTENCESEP);
    const D=diffChars(s1,s2);
    let p2off=0;

    for (let i=0;i<D.length;i++) {
        const d=D[i];
        if (d.value.trim()===SENTENCESEP ) out.push(p2off ); 
        else{
            let at=d.value.indexOf(SENTENCESEP);
            while (at>-1) {
                out.push(p2off+at);
                at=d.value.indexOf(SENTENCESEP,at+1);
            }
        }
        if ((!d.removed&&!d.added) || d.removed) p2off+=d.value.length;
    }
    return out;
}
export default {spacify,autoBreak,paragraphSimilarity,diffBreak,breakSentence}