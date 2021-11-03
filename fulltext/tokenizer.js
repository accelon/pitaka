export const TOKEN_CJK=1,TOKEN_ROMANIZE=2;
import {CJKWord_Reg,Romanize_Reg} from './utils.js'
export const tokenize=str=>{
    const out=[];
    str.replace(CJKWord_Reg,(m,m1,offset)=>{
        out.push([offset,m1,TOKEN_CJK]);
    })
    str.replace(Romanize_Reg,(m,m1,offset)=>{
        out.push([offset,m1,TOKEN_ROMANIZE]);
    })
    out.sort((a,b)=>a[0]-b[0]);
    return out;
}

export default {tokenize,TOKEN_CJK,TOKEN_ROMANIZE}