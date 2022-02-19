
export const packAttrs=(attrs,opts={})=>{
    let out='';
    const omit=(opts||{}).omit;
    const prepend=opts.prepend||'';
    const append=opts.append||'';
    const allowEmpty=opts.append||false;
    for (let key in attrs) {
        if (omit && omit[key]) continue;
        let v=prepend+attrs[key]+append;
        if (v.indexOf(" ")>-1|| (!v&&allowEmpty)  ) {
            v='"'+v.replace(/\"/g,'\\"')+'"'; 
        }
        if (out) out+=' ';
        if (attrs[key] && !allowEmpty) out+=key+'='+v;
    }
    return out.trim();
}
export default {packAttrs}