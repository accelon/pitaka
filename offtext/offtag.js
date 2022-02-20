import {QSTRING_REGEX_G,QUOTEPAT,QUOTEPREFIX} from './def.js';

export const packAttrs=(attrs,opts={})=>{
    let out='';
    const omit=(opts||{}).omit;
    const allowEmpty=opts.allowEmpty||false;
    for (let key in attrs) {
        if (omit && omit[key]) continue;
        let v=attrs[key];
        if (v.indexOf(" ")>-1|| (!v&&allowEmpty)  ) {
            v='"'+v.replace(/\"/g,'\\"')+'"'; 
        }
        if (out) out+=' ';
        if (attrs[key] && !allowEmpty) out+=key+'='+v;
    }
    return out.trim();
}
export const parseAttrs=attrstr=>{ //similar with offtext/parser.js::parseAttributes
    const quotes=[];
    const getqstr=(str)=>str.replace(QUOTEPAT,(m,qc)=>{
        return quotes[parseInt(qc)];
    });
    let rawattr=attrstr.replace(QSTRING_REGEX_G,(m,m1)=>{
        quotes.push(m1);
        return QUOTEPREFIX+(quotes.length-1);
    });
    const attrarr=rawattr.split(/ +/), attrs={};  
    let keycount=0;
    while (attrarr.length) {
        const it=attrarr.shift();
        const eq=it.indexOf('=');
        if (eq>0) {
            attrs[it.substr(0,eq)] = getqstr(it.substr(eq+1));
        } else {
            attrs['_'+keycount]=getqstr(it);
        }
    }
    return attrs;
}
export default {packAttrs,parseAttrs}