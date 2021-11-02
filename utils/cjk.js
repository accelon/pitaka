export const CJKRange=s=>{
    if (!s) return;
    if (s.charCodeAt(0)>=0x3400 && s.charCodeAt(0)<=0x9fff) return 1;
    if (s.charCodeAt(0)>=0xD800 && s.charCodeAt(0)<=0xDFFF) return 2;
}

