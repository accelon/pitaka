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
    if (!str)return [];
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
export const splitUTF32Char=str=>splitUTF32(str).map( cp=>String.fromCodePoint(cp));

export const codePointLength=text=>{
    var result = text.match(/[\s\S]/gu);
    return result ? result.length : 0;
}

export const StringByteLength=text=>{
   return new Blob([text]).size;
}