export const CJKRange=s=>{
    if (!s) return;
    if (s.charCodeAt(0)>=0x3400 && s.charCodeAt(0)<=0x9fff) return 1;
    if (s.charCodeAt(0)>=0xD800 && s.charCodeAt(0)<=0xDFFF) return 2;
    if (s.charCodeAt(0)>=0xE000 && s.charCodeAt(0)<=0xFADF) return 3;
}
export const CJKRanges={
    'BMP': [0x4e00,0x9fa5],
    'ExtA':[0x3400,0x4dff],
    'ExtB':[0x20000,0x2A6FF],
    'ExtC':[0x2A700,0x2B73F],
    'ExtD':[0x2B740,0x2B81F],
    'ExtE':[0x2B820,0x2CEAF],
    'ExtF':[0x2CEB0,0x2EBE0],
    'ExtG':[0x30000,0x3134A]
}
export const enumCJKRangeNames=()=>Object.keys(CJKRanges);

export const getCJKRange=name=>CJKRanges[name]||[0,0];

export const CJKRangeName=s=>{//return cjk range name by a char or unicode number value or a base 16 string
    let cp=s;
    if (typeof s==='string') {
        const code=parseInt(s,16);
        if (!isNaN(code)) {
            cp=code;
        } else {
            cp=s.codePointAt(0);
        }
    }
    for (let rangename in CJKRanges) {
        const [from,to]=CJKRanges[rangename];
        if (cp>=from && cp<=to) return rangename;
    }
}
export const string2codePoint=(str, snap)=>{
    if (!str) return 0;
    const cp=str.codePointAt(0);
    let n;
    if (cp>=0x3400 && cp<0x2ffff) {
        n=cp; 
    } else {
        n=(parseInt(str,16)||0x4e00);
    }
    return snap? n&0x3ff80 : n;
}
export const isSurrogate=s=>{
    return CJKRange(s)==2;
}
export const isPunc=(str,full)=>{
    if (!str) return false;
    const cp=str.charCodeAt(0);
    // console.log(cp,str,full)
    return ((cp>=0x3001&&cp<=0x301f) || cp>0xff00)
}
export const trimPunc=str=>{
    return str.replace(/^[『「！。，：？]+/,'').replace(/[」？』。！：）｝〕；，]+$/,'');
}

const quotebrackets={
    '「':'」',
    '『':'』'
}
export const findCloseBracket=(str,from)=>{
    for (let qopen in quotebrackets) {
        const qclose=quotebrackets[qopen];
        if (str[from]==qopen || str[from+1]==qopen) {
            const at=str.indexOf(qclose,from+1);
            if (at>0) {
                return at+qclose.length;               
            }
        }
    }
}

export const cjkPhrases=str=>{
    const out=[];
    str.replace(/([\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9]+)/g,(m,m1)=>{
        out.push(m1);
    });
    return out;
}
