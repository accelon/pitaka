export const CJKRange=s=>{
    if (!s) return;
    if (s.charCodeAt(0)>=0x3400 && s.charCodeAt(0)<=0x9fff) return 1;
    if (s.charCodeAt(0)>=0xD800 && s.charCodeAt(0)<=0xDFFF) return 2;
    if (s.charCodeAt(0)>=0xE000 && s.charCodeAt(0)<=0xFADF) return 3;
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