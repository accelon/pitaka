import { LOCATORSEP } from '../platform/constants.js';
import { removeSentenceBreak, sentenceRatio,diffParanum,autoENBreak } from './breaker.js';
import {linePN} from '../offtext/index.js'
export const toParagraphs=(L,opts={})=>{
    const out=[];
    let lines=[],pid='';
    const unbreak=opts.unbreak||false;
    const bkpf=(opts.bkid||'').replace(/\..+$/,'');
    for (let i=0;i<L.length;i++) {
        if (L[i].indexOf('^n')>-1 && L[i].substr(0,3)!=='^n ') {
            const id=L[i].match(/\^n([\d\-\.]+)/);
            if (!id) {
                console.log('no id',L[i],i)
            }
            if (pid) {
                out.push([pid,unbreak?removeSentenceBreak(lines):lines]);
                lines=[];        
            }
            pid=(bkpf?bkpf+LOCATORSEP:'')+id[1];
        }
        if (L[i].trim()) lines.push(L[i])
    }
    // while (lines.length && !lines[lines.length-1].trim()) lines.pop();
    out.push([pid,unbreak?removeSentenceBreak(lines):lines]);
    return out;
}
export const autoAlign=(f1,guide,fn)=>{
    //prerequisite
    //f1 and f2 need ^n marker
    //f2 has more lines than f1
    //for each paragraph, let f1 has same sentence as f2
    
    const gpara=toParagraphs(guide);
    const para=toParagraphs(f1);
    
    if (para.length!==gpara.length) {
        console.log(fn,'para.length unmatch,',para.length,'< guided',gpara.length);
        console.log(diffParanum(para.map(it=>it[0]),gpara.map(it=>it[0])));
        return f1;
    }
    const res=[];
    for (let i=0;i<gpara.length;i++) {
        const rgpara=sentenceRatio(gpara[i][1]);
        const rpara=sentenceRatio(para[i][1]);
        const aligned=alignParagraph(rpara,rgpara,para[i][0]);

        if (rpara.length<rgpara.length) { //
            while (para[i][1].length<rgpara.length) {
                para[i][1].push('<>'); //inserted line
            }
            res.push(...para[i][1] );
            continue;
        }

        for (let j=0;j<aligned.length;j++) {
            const t=(para[i][1][aligned[j]]||'')
            if (t) para[i][1][aligned[j]]='\n'+t;
        }
        const newpara=para[i][1].join('').split('\n');
        while (newpara.length<gpara[i][1].length) {
            newpara.push('<>');
        }

        res.push(...newpara);
    }
    return res.map(t=>t==='<>'?'':t);
}

export const combineHeaders=str=>{
    let headers='';
    const lines=str.split('\n'), out=[];
    for (let i=0;i<lines.length;i++) {
        const l=lines[i];
        if (linePN(l) ) {
            out.push(headers+l);
            headers='';
        } else if (l.match(/\^[zh][\d\[]/)){
            headers+=l;
        } else {
            out.push(l);
        }
    }
    return out.join('\n');
}

export const alignParagraph=(para , guide, id)=>{ //para must have more fregment
    if (para.length<guide.length)  return null;
    let i=0,prev=0,gi=0;
    const out=[];

    for (let gi=0;gi<guide.length;gi++) {
        while (i<para.length&&para[i]<guide[gi]) i++;
        if (out.length+1>=guide.length) break;
        if (i>prev) {
            out.push(i);
        }
        prev=i;
    }
    return out;
}
export const alignParagraphLinecount=(para, paralinecount, id)=>{
    const out=[];
    if (para.length==paralinecount) {
        return para;
    } if (para.length>paralinecount) {
        console.warn( `bb has more line ${para.length} > ${paralinecount} ,id ${id}`)
        out.push(...para)
    } else if (para.length<paralinecount) {
        for (let i=0;i<para.length;i++) {
            const broken=autoENBreak(para[i]);
            // console.log(paralinecount,broken)
            out.push(... broken);
        }
    }
    while (out.length<paralinecount) {
        out.push('');
    }
    while (out.length>paralinecount) {
        const last=out.pop();
        out[out.length-1]+=last;
    }

    return out;
}

export const SuttaCentralify=(lines,prefix)=>{
    if (typeof lines==='string') lines=lines.split('\n');
    let vakya=0,pn='';
    const out={};
    for (let i=0;i<lines.length;i++) {
        let l=lines[i];
        const m=linePN(l);
        if (m) {
            pn=m[1].trim();
            const headers=(m.index>2?l.substr(0, m.index):'');
            if (headers) {
                out[prefix+pn+'.0']=headers;
            }
            l= l.substr(m.index+m[1].length+2);//2 is "^n".length
            vakya=0;
        }
        out[prefix+pn+'.'+ (++vakya)]=l;
    }
    return JSON.stringify(out,'',' ');
}
export default {combineHeaders,autoAlign,toParagraphs,alignParagraph,alignParagraphLinecount,SuttaCentralify};