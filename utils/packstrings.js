
//ascii number as separator and shared count, about 50% save
const CodeStart=0x0E,CodeEnd=0x1F,MaxShared=CodeEnd-CodeStart;
const SEP=String.fromCharCode(CodeStart);
export const packStrings=sl=>{
    if (sl.length<2) return sl.join(SEP);
    let out=sl[0];
    let prevhw=sl[0];
    for (let i=1;i<sl.length;i++) {
        const hw=sl[i];
        let shared=0;
        while (shared<MaxShared &&shared<hw.length &&shared<prevhw.length
            &&hw[shared]===prevhw[shared]) {
                shared++;
        }
        prevhw=sl[i];
        if (shared &&prevhw.codePointAt(0)<0x10000) { //surrogate never shared.
            out+=String.fromCharCode(CodeStart+shared)+prevhw.substr(shared);
        } else {
            out+=SEP+sl[i];
        }
    }
    return out;
}
export const unpackStrings=str=>{
    let p=0, s='', prevstr='',shared=0;
    const out=[];
    while (p<str.length) {
        const code=str.charCodeAt(p);
        if (code>=CodeStart && code<=CodeEnd) {
            if (s) {
                prevstr=prevstr.substr(0,shared)+s;
                out.push(prevstr);
            }
            shared=code-CodeStart;
            s='';
        } else {
            s+=str[p];
        }
        p++; 
    }
    if (s) out.push(s);
    return out;
}