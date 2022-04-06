export const TOKEN_UNSEARCHABLE=0x1,TOKEN_SEARCHABLE=0x10,
TOKEN_ROMANIZE=20,TOKEN_CJK=0x30,
TOKEN_CJK_BMP=0x31,TOKEN_CJK_SURROGATE=0x32;
export const TOKEN_ID_UNKNOWN=-1;
export const TK_WEIGHT=0,TK_POSTING=1,TK_NAME=2,TK_OFFSET=3,TK_TYPE=4;

import {parseOfftextLine} from '../offtext/index.js'
import {CJKWord_Reg,Romanize_Reg} from './utils.js'
export const tokenize=text=>{
    const out=[];
    let i=0,unsearchable='',unsearchable_i=0;
    const addUnsearchable=()=>{
        if (unsearchable.trim()) {
            out.push([0,null,unsearchable,unsearchable_i,TOKEN_UNSEARCHABLE]);
        }
        unsearchable='';
    }
    while (i<text.length) {
        let code=text.codePointAt(i);
        if (code>0xffff) {
            addUnsearchable();
            const sur=String.fromCodePoint(code); 
            out.push([0,null,sur,i,TOKEN_CJK_SURROGATE]);
            i++;
        } else if (code>=0x2000&&code<=0xffff) {
            if ( (code>=2e80&&code<=0x2fff) //radical
                ||(code>=0x3041&&code<=0x9fff) //0xpunc
                || (code>=0xd400&&code<0xdfff)  //surrogates
                || (code>=0xe000&&code<0xfadf)){  //PUA
                out.push([0,null,text[i],i,TOKEN_CJK_BMP]);
            } else {
                if (!unsearchable) unsearchable_i=i;
                unsearchable+=text[i];
            }
        } else {
            let s='',prev=0;
            while (code<0x2000) {
                s+=text[i];
                code=text.codePointAt(++i)
            }
            
            s.replace(Romanize_Reg,(m,m1,offset)=>{
                if (prev&&offset>prev) {
                    unsearchable_i=i+prev;
                    unsearchable=s.substring(prev,offset);
                    addUnsearchable();
                }
                out.push([0,null,m1,i+offset,TOKEN_ROMANIZE]);
                prev=offset+m.length;
            });
            unsearchable_i=i+prev;
            unsearchable=s.substring(prev);
            addUnsearchable();
        }
        i++;
    }
    return out;
}

//計算每個token 的權重(加起來為1)，加到第一個元素，其餘不變
export const weightToken=tokens=>{ 
    //最單純的權重分配，成功率高86%
    return tokens.map(it=>[1/tokens.length,...it.slice(1)]);
    //成功率約83%  國語詞典找四大名著
    const totalfreq=tokens.reduce((p,v)=>p+v[TK_POSTING].length,0);
    const arr=tokens.map(it=> [ it[TK_POSTING].length&&Math.log(totalfreq/it[TK_POSTING].length), ...it.slice(1)]);

    const min=0.8/tokens.length;
    const totalweight=arr.reduce((p,v)=>p+(v[TK_WEIGHT]||0),0);
    // console.log()
    let out=arr.map(it=>[(it[TK_WEIGHT]||0)/totalweight, ...it.slice(1)]);
    //去掉常用字
    if (out.length>10) out=out.filter(it=>it[TK_WEIGHT]>min);   
    const totalweight2=out.reduce((p,v)=>p+v[TK_WEIGHT],0);
    out=out.map(it=>[it[TK_WEIGHT]/totalweight2, ...it.slice(1)]); 
    
    return out;
}
export const getNthTokenX=(str,n)=>{ //get char offset of nth Searchble token
    const [text]=parseOfftextLine(str);
    const tokens=tokenize(text);
    let i=0;
    while (i<tokens.length&&n>0) {
        if (tokens[i][TK_TYPE]>=TOKEN_SEARCHABLE) n--;
        if (n===0) return tokens[i][TK_OFFSET];        
        i++;
    }

    return tokens[tokens.length-1][TK_OFFSET];
}
export default {tokenize,TOKEN_CJK,TOKEN_ROMANIZE,getNthTokenX,weightToken}