export const isCJK=s=>{
    if (!s) return;
    return (s.charCodeAt(0)>=0x3400 && s.charCodeAt(0)<=0x9fff)
    || (s.charCodeAt(0)>=0xD400 && s.charCodeAt(0)<=0xDFFF)
}