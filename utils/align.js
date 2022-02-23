import { LOCATORSEP } from '../platform/constants.js';
import { removeSentenceBreak, sentenceRatio,alignParagraph } from './breaker.js';
export const toParagraphs=(L,opts={})=>{
    const out=[];
    let lines=[],pid='';
    const unbreak=opts.unbreak||false;
    const bkpf=(opts.bkid||'').replace(/\..+$/,'');
    for (let i=0;i<L.length;i++) {
        if (L[i].indexOf('^n')>-1 && L[i].substr(0,3)!=='^n ') {
            const id=L[i].match(/\^n([\d\-]+)/);
            if (!id) {
                console.log('no id',L[i],i)
            }
            if (pid) {
                out.push([pid,unbreak?removeSentenceBreak(lines):lines]);
                lines=[];        
            }
            pid=(bkpf?bkpf+LOCATORSEP:'')+id[1];
        }
        lines.push(L[i])
    }
    out.push([pid,unbreak?removeSentenceBreak(lines):lines]);
    return out;
}
export const autoAlign=(f1,guide,fn)=>{
    //prerequisite
    //f1 and f2 need ^n marker
    //f2 has more lines than f1
    //for each paragraph, let f1 has same sentence as f2
    
    const gpara=toParagraphs(guide)
    const para=toParagraphs(f1);
    
    if (para.length!==gpara.length) {
        console.log(fn,'para.length unmatch,',para.length,'< guided',gpara.length);
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

export default {autoAlign,toParagraphs};