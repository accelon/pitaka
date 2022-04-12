/** 將內嵌標記剖為正文及標記陣列
 *  標記格式為 ^name#xx~yy  或 ^name[key=屬性] ，屬性以空白隔開，如果值有空白，需加雙引號。
 *  如果無 key= ，屬性會放回本文（包住本文）。如 ^bold[要加粗的字體]
 *  標記的長度為所包住的文字長度。
 *  name : 標記名 只能是小寫 a-z 或 _
 *  #id  : 用法同 html 的 id, id 以數字開頭時，可省略 # ，如 ^p100a 等效於 ^p[id=100a]
 **/

import {OffTag, ALWAYS_EMPTY, OFFTAG_ID,QUOTEPREFIX,QUOTEPAT,NAMED_OFFTAG,OFFTAG_COMPACT_ATTR,
    OFFTAG_LEADBYTE,OFFTAG_ATTRS, OFFTAG_REGEX_G,QSTRING_REGEX_G, OFFTAG_NAME_ATTR} from './def.js'
import {findCloseBracket} from '../utils/cjk.js'
import { LOCATORSEP } from '../platform/constants.js';

const parseCompactAttr=str=>{  //              序號和長度和標記名 簡寫情形，未來可能有 @ 
    const out={}, arr=str.split(/([@#])/);
    while (arr.length) {
        let v=arr.shift();
        // if      (v==='~') out['~']=arr.shift();  
        if (v==='@') out['@']=arr.shift();  // a pointer
        else { 
            if (v==='#') v=arr.shift(); 
            const m=v.match(OFFTAG_ID); //id with numeric leading may omit #
            if (m) out.id=m[1]
        }
    }
    return out;
}
const resolveTagWidth=(line,tags)=>{  
//正文已準備好，可計算標記終點，TWIDTH 不為負值，只允許少數TWIDTH==0的標記(br,fn) ，其餘自動延伸至行尾
    tags.forEach(tag=>{
        const w=tag.attrs['~'];
        if (w) {                    //以文字標定結束位置
            if (!ALWAYS_EMPTY[tag.name]) {
                const pos=line.indexOf(w);
                if (pos>0) tag.w=pos-tag.x+1; 
                else tag.w=0;
            } else tag.w=0;
            delete tag.attrs['~'];
        } else if ( 0 > tag.w ) {  //負值轉換為正值（從標記起算)
            // if ( tag.w==-1) {
            //     tag.w=0; //空標籤自動延至至行尾
            // } else {
                tag.w= tag.w +line.length+1; 
                if (tag.w<0) tag.w=0;    
            // }
        }
        if (tag.name=='t' && !tag.w) { //找到下一個括號結束點
            const closebracket=findCloseBracket(line,tag.x);
            if (closebracket) tag.w=closebracket-tag.x;
        }
    })
}
/* return a regular expression matching all label with a given name (no attribute) */
export const offtagRegex=(name,isglobal=true)=>{
    return new RegExp('\\'+OFFTAG_LEADBYTE+name+NAMED_OFFTAG,isglobal?'g':'');
}
/* 
 return parsed tag matching given pattern of label (lbl name + compact attributes) ,    
*/
export const extractOfftagPattern=(str,namepat)=>{  //namepat== label name+ optional compact attr
    const out=[];
    const re=new RegExp("\\"+OFFTAG_LEADBYTE+"("+namepat+")"+OFFTAG_ATTRS,"g");
    str.replace(re,(m,rawName,rawA)=>{
        let [m2, tagName, compactAttr]=rawName.match(OFFTAG_NAME_ATTR);
        const [attrs,putback]=parseAttributes(rawA,compactAttr);
        out.push([attrs,putback,m.length]);
    })
    return out;
}
export const serializeAttributes=attrs=>{
    let str='';
    let compact='';
    for (let key in attrs) {
        let v=attrs[key];
        if (key=='id') key='#';

        if (key==='#' || key==='@') {
            if (v.match(OFFTAG_COMPACT_ATTR)) {
                compact=key;
                if (v[0].match(/\d/) && key==='#') compact='';
                compact=v;
                continue;
            }
        }
        if (v.indexOf(' ')>-1) v='"'+v+'"';
        str+= key+'='+v+' ';
    }
    str=str.trim();
    if (str) str='['+str+']';
    return compact+str;
}
const parseAttributes=(rawA,compactAttr)=>{
    let quotes=[];             //字串抽出到quotes，方便以空白為拆分單元,
    let putback='';            //標記中非屬性的文字，放回正文
    const getqstr=(str,withq)=>str.replace(QUOTEPAT,(m,qc)=>{
        return (withq?'"':'')+quotes[parseInt(qc)]+(withq?'"':'');
    });

    let rawattr=rawA?rawA.substr(1,rawA.length-2).replace(QSTRING_REGEX_G,(m,m1)=>{
        quotes.push(m1);
        return QUOTEPREFIX+(quotes.length-1);
    }):'';
    const attrarr=rawattr.split(/( +)/), attrs={};       //至少一個空白做為屬性分隔

    let i=0;
    if (compactAttr) Object.assign(attrs, parseCompactAttr(compactAttr));
    while (attrarr.length) {
        const it=attrarr.shift();
        let eq=-1,key='';
        if (it[0]=='~' || it[0]=='#' || it[0]=='@')  {
           key=it[0];
           eq=0;
        } else {
           eq=it.indexOf('=');
           if (eq>0) key=it.substr(0,eq);
        }
        if (eq>-1) {
            attrs[key] = getqstr(it.substr(eq+1));
            if (attrarr.length && !attrarr[0].trim()) attrarr.shift() ;//drop the following space
        } else {
            putback+=getqstr(it,true);
        }
        i++
    }

    return [attrs,putback];
}
export const parseOffTag=(raw,rawA)=>{ // 剖析一個offtag,  ('a7[k=1]') 等效於 ('a7','[k=1]')
    if (raw[0]==OFFTAG_LEADBYTE) raw=raw.substr(1);
    if (!rawA){
        const at=raw.indexOf('[');
        if (at>0) {
            rawA=raw.substr(at);
            raw=raw.substr(0,at);
        }
    }
    let [m2, tagName, compactAttr]=raw.match(OFFTAG_NAME_ATTR);
    let [attrs,putback]=parseAttributes(rawA,compactAttr);
    return [tagName,attrs,putback];
}
export const parseOfftextLine=(str,idx=0)=>{
    let tags=[];
    let textoffset=0,prevoff=0;
    let text=str.replace(OFFTAG_REGEX_G, (m,rawName,rawA,offset)=>{
        let [tagName,attrs,putback]=parseOffTag(rawName,rawA);
        let width=0;
        putback=putback.trimRight();     //[xxx ] 只會放回  "xxx"
        if (tagName=='br' && !putback) { //標記前放一個空白, 接行後不會 一^br二  => 一 二
            putback=' ';                 // 用 ^r 折行則不會加空白，適合固定版式的中文。
            offset++
        }
        const W=attrs['~'];
        if (W && !isNaN(parseInt(W))) { //數字型終點
            width=ALWAYS_EMPTY[tagName]?0:parseInt(W); 
            delete attrs['~'];
        }
        width=putback.length?putback.length:width;

        // if (width==0 ) width=-1;

        textoffset+= offset-prevoff;            //目前文字座標，做為標記的起點
        tags.push( new OffTag(tagName, attrs, idx, textoffset, width, offset) );
        textoffset+=putback.length - m.length;  
        prevoff=offset;
        return putback;
    })
    resolveTagWidth(text,tags);
    return [text,tags];
}
export const linePN=str=>str.match(/\^n([\d\.\-_]* ?)/);
export const parseOfftextHeadings=(str,starty=0,locator='n')=>{
    let lines=str;
    if (typeof str=='string') lines=str.split(/\r?\n/);
    const headings=[];
    //out is array of [text,tag]
    const out=lines.map((line,y)=>parseOfftextLine(line,y+starty));
    const text=out.map(item=>item[0]);
    if (typeof locator==='string') locator=locator.split(LOCATORSEP)
    const tags=[];
    out.forEach(item=>tags.push(...item[1]));

    if (locator.length>1) { //only for two level locator bk.n
        const leafloc=locator[locator.length-1];
        const quickleafloc=OFFTAG_LEADBYTE+leafloc;
    
        for (let i=0;i<lines.length;i++) {
            const t=lines[i];
            if (t.indexOf(quickleafloc)>0) {//might have headings before leafloc
                const loctag=out[i][1].filter( tag=>tag.name===leafloc);
                if (loctag.length) {
                    const offset=loctag[0].offset; //start of ^n
                    headings.push([starty+i, t.substr(0,offset)]); //prepend at jsonprom.js::setChunk
                    lines[i]=t.substr(offset);
                }
            }
        }    
    }
    return {text,tags,headings,writertext:lines};
}