export const TOKENIZE_REGEX=/(([\u0021-\u1fff]+)|([\u2000-\u2fff\u3001-\uffff]+))/g
export const CJKWord_Reg=/([\u2e80-\u2fd5\u3400-\u9fff\ud400-\udfff\ue000\uffff]+)/g;
export const Romanize_Reg=/([A-Za-z\u00c0-\u02af\u1e00-\u1faf]+)/g;
export const isCJKStopWord=ch=>{
    return ch==='　' ||ch==='的'||ch==='之'
}
export const forEachUTF32=(s,cb)=>{
    let i=0;
    while (i<s.length) {
        const code=s.codePointAt(i);
        const ch=String.fromCodePoint(code);
        cb(ch,i,s);
        i++;
        if (code>0xffff) i++;
    }
}
export const splitUTF32=str=>{
    let i=0;
    const out=[];
    while (i<str.length) {
        const code=str.codePointAt(i);
        out.push(code);
        i++;
        if (code>0xffff) i++;
    }
    return out;
}

export const codePointLength=text=>{
    var result = text.match(/[\s\S]/gu);
    return result ? result.length : 0;
}
