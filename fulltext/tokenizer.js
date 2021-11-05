export const TOKEN_CJK=1,TOKEN_ROMANIZE=2;
import {parseOfftextLine} from '../offtext/index.js'
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
export const getNthTokenX=(str,n)=>{
    const [text]=parseOfftextLine(str);
    const tokens=tokenize(text);

    while (n>0) {
        for (let i=0;i<tokens.length;i++) {
            if (tokens[i][2]==TOKEN_CJK) {
                const textpiece=tokens[i][1]
                let j=0,prev='';
                n--; //for gap
                while (n>0&&j<textpiece.length) {
                    n--;
                    const code=textpiece.codePointAt(j);
                    j++;
                    if (code>0xffff) {
                        j++;
                        prev='';
                    }
                }
                if (n==0) return tokens[i][0]+j; 
            } else if (tokens[start[2]]===TOKEN_ROMANIZE) {
                n--;
            } 
        }
    }
    return tokens[tokens.length-1][0];
}
export default {tokenize,TOKEN_CJK,TOKEN_ROMANIZE,getNthTokenX}