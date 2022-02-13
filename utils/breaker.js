import {OFFTAG_REGEX_G} from "../offtext/def.js"
import { diffChars, diffWords } from "diff";

export const spacify=str=>{ //remove all offtext and non ascii character, for more precise diff
    return str.replace(OFFTAG_REGEX_G,(m,tagname,attr)=>{
        return " ".repeat(tagname.length+(attr?attr.length:0)+1)
    }).replace(/[^a-zA-Z\u3400-\u9FFF\uD800-\uDFFF“‘]/g,' ');
}
export const removeHeader=str=>{
    return str.replace(/^(.+)(\^n[\-\d]+)/,(m,rm,n)=>" ".repeat(rm.length)+n)
        .replace(/(\([^\)]+\))/g,(m,m1)=>" ".repeat(m1.length))
        .replace(/^sz/g,'   ').replace(/^\^n/g,'  ')
}
export const removeVariantBold=str=>{
    return str.replace(/(\^v[^\]]+?\])/g,(m,m1)=>" ".repeat(m1.length))
    .replace(/\^b([^\]]+?)\]/g,"  $1 ");
}
export const breakLine=(str,breaker)=>{
    const substrings=[],breakpos=[];
    let prev=0;
    str.replace(breaker,(m,m1,idx)=>{
        if (prev) breakpos.push(prev);
        substrings.push( str.substring(prev,idx+m1.length) );
        prev=idx+m1.length;
    })
    if (prev<str.length) {
        if (prev) breakpos.push(prev);
        substrings.push(str.substr(prev))
    }
    return {substrings,breakpos};
}
export const autoBreak=(lines,breaker="([?!।॥;–—] +)")=>{
    if (typeof lines==='string') lines=[lines];
    const sentences=[], breakpos=[];
    if (typeof breaker==='string') {
        breaker=new RegExp(breaker,"g");
    }
    for (let i=0;i<lines.length;i++) {
        const res=breakLine(lines[i],breaker);
        sentences.push(...res.substrings);
        breakpos.push(res.breakpos)
    }
    return {sentences,breakpos};
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
export const breakSentence=(arr,breakpos,paraprefix='')=>{
    const out=[];
    for (let i=0;i<breakpos.length;i++) {
        const str=arr[i];
        let prev=0;
        let prefix=paraprefix;
        for (let j=0;j<breakpos[i].length;j++) {
            let bp=breakpos[i][j];
            let sub=str.substring(prev,bp);
            out.push( (i?prefix:'')+sub);
            prev=bp;
            prefix='';
        }
        if(prev<str.length-1) {
            out.push( str.substr(prev));
        }
    }
    return out;
}
const SENTENCESEP=String.fromCodePoint(0x2fff);
const SENTENCESEP1=String.fromCodePoint(0x2ffe);
export const diffBreak=(p1,p2,id)=>{//p1 cs(larger unit), p2(smaller unit,guiding text)
    let out='';
    const s1=p1.join(SENTENCESEP1), s2=p2.join(SENTENCESEP);
    const D=diffChars(s1,s2);
    for (let i=0;i<D.length;i++) {
        const d=D[i];
        // if (id==="sn5.134-138"||id=="test") console.log(d);
        let at=d.value.indexOf(SENTENCESEP);
        while (at>-1) {
            out+='\n';
            at=d.value.indexOf(SENTENCESEP,at+1);
        }
        if ( (!d.added && !d.removed) || d.removed) out+=d.value;
    }
    
    const leadch='※';
    out=out.replace(/\n( *)\u2ffe/g,'$1\n'+leadch) //確定p1換行符在行首
           .replace(/\u2ffe([ “‘]*)\n/g,'\n'+leadch+'$1');
    if (out.indexOf(SENTENCESEP1)>0) {
        out=out.replace(/\u2ffe/g,'\n'+leadch);//deal with leadch in the middle
    }
    //convert to breakpos
    const breaklines=out.split('\n'), breakpos=[];
    let linepos=[],offset=0, 
        ln=0; //line index of original text
    for (let i=0;i<breaklines.length;i++) {
        if (breaklines[i][0]===leadch) {
            breakpos.push(linepos);
            offset=0;
            ln++;
            linepos=[];
        }
        let len=breaklines[i].replace(/※/g,'').length;
        if (offset>0) linepos.push(offset+ (p1[ln][offset-1]===' '?-1:0) ); //' \n' to '\n '
        offset+=len;
    }
    breakpos.push(linepos);
    // if (id==="sn5.134-138") console.log(breakpos)

    while (p1.length>breakpos.length) breakpos.push([]);//make sure breakpos has same length
    return breakpos;
}

//ensure arrary length
export const ensureArrayLength=(arr,length,marker='※')=>{
    if (length>arr.length) {
        while (length>arr.length) {
            arr.push(marker);
        }
    } else if (length<arr.length) {
        while (arr.length && length<arr.length) {
            const last=arr.pop();
            arr[arr.length-1]+=marker+last;
        }
    }
    return arr;
}
//find out shorted lead to reach pos
const MAXWIDTH=5;
const shortestLead= (line,pos,from)=>{
    let lead,at,width=2;//try from 2 chars, up to MAXWIDTH
    while (at!==pos) {
        lead=line.substr(pos,width);
        at=line.indexOf(lead,from);
        if (at==-1) {
            throw "cannot find lead at "+pos+'lead '+lead;
        }
        if (at===pos) return lead;
        const ch=line.charAt(pos+width);
        if (width>MAXWIDTH || ch===',' || ch==='^') { //try occur
            let occur=0;
            while (at!==pos) {
                at=line.indexOf(lead,at+1);
                occur++;
            }
            lead+='+'+occur;
            break;
        } else {
            width++;
        }
    }
    return lead;
}
/* convert sentence break of a paragraph to hooks, output one line per paragraph , separated by tab */
export const hookFromParaLines=paralines=>{
    let bp=[],breakpos=[],out=[];
    let p=0;
    for (let i=0;i<paralines.length;i++) {
        const l=paralines[i];
        if (l.substr(0,3)==='^n ') {
            breakpos.push(bp);
            bp=[];
            p=0;
        } else {
            if (p) bp.push(p);
        }
        p+=l.length;
    }
    breakpos.push(bp);
    const orilines=paralines.join('').replace(/\^n /g,'\n^n ').split('\n');

    for (let i=0;i<orilines.length;i++) {
        let from=0,leads=[];
        for (let j=0;j<breakpos[i].length;j++) {
            const leadword=shortestLead(orilines[i],breakpos[i][j], from );
            from=breakpos[i][j]+1;
            leads.push(leadword);
        }
        out.push(leads)
    }
    return out;
}
export const breakByHook=(line,hooks,id)=>{ //break a line by hook
    let prev=0,out=[];
    // if (id=='dn1.159') debugger
    for (let i=0;i<hooks.length;i++){
        let occur=0,at=0,hook=hooks[i];
        if (!hook) { //just insert a blank line
            out.push('')
            continue;
        }
        const m=hook.match(/\+(\d)$/);
        if (m) {
            occur=parseInt(m[1]);
            hook=hook.substr(0,hook.length-m[0].length);
        }
        at=line.indexOf(hook,prev+1);
        while (occur>0) {
            at=line.indexOf(hook,at+1);
            occur--;
        }
        if (at==-1) {
            console.log('hook error',id,'hook',hook);
            at=prev;
        }
        out.push(line.substring(prev,at));
        prev=at;
    }

    if (prev<line.length) out.push(line.substring(prev))
    return out;
}
//remove the sentence break of a paragraph lines (sub paragraph starts with ^n )
export const removeSentenceBreak=paralines=>{
    const combined=paralines.join('').replace(/\^n /g,"\n^n ").split('\n')
    return combined;
}
export default {spacify,removeHeader,removeVariantBold,removeSentenceBreak,
    autoBreak,paragraphSimilarity,diffBreak,breakSentence,ensureArrayLength,
    hookFromParaLines, breakByHook}