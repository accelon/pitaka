/** 將內嵌標記剖為正文及標記陣列
 *  標記格式為 ^name#xx~yy  或 ^name[屬性] ，屬性以空白隔開，如果值有空白，需加雙引號。
 *  name : 標記名 只能是 a-z 或 _
 *  #id  : 用法同 html 的 id
 *  n    : 數字式序號，可以 "." 隔開，像ip address，但不限層級。
 *         序號可接在標記名之後。 ~p100 等效於  ~p[n=100]
 *  ~指定標記終點：  0表示nulltag ，正值表示從標記起算n bytes，負值表示從行尾起算，-1最後一字之後，-2指到最後一字之前，類推。
 *             若為文字，則會搜尋，並以該文字的結尾作為標記的終點。
 **/
const QUOTEPREFIX='\u001a', QUOTEPAT=/\u001a(\d+)/g ;                // 抽取字串的前綴，之後是序號
import {OffTag,ALLOW_EMPTY, ALWAYS_EMPTY, OFFTAG_REGEX_G,QSTRING_REGEX_G} from './def.js'

const parseCompactAttr=str=>{  //              序號和長度和標記名 簡寫情形，未來可能有 @ 
    const out={}, arr=str.split(/([#~@])/);
    while (arr.length) {
        const v=arr.shift();
        if      (v==='~') out['~']=arr.shift();
        else if (v==='#') out['#']=arr.shift(); 
        else if (v==='@') out['@']=arr.shift();  // a hook
        else if (v.trim()) out.n=v.trim();
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
            if (!ALLOW_EMPTY[[tag.name]] && tag.w==-1) {
                tag.w=0; //空標籤自動延至至行尾
            } else {
                tag.w= tag.w +line.length+1; 
                if (tag.w<0) tag.w=0;    
            }
        }
    })
}

export const parseOfftextLine=(str,idx=0)=>{
    const tags=[];
    let textoffset=0,prevoff=0;
    let text=str.replace(OFFTAG_REGEX_G, (m,rawName,rawA,offset)=>{
        let quotes=[];             //字串抽出到quotes，方便以空白為拆分單元,
        let putback='';            //標記中非屬性的文字，放回正文
        let [m2, tagName, compactAttr]=rawName.match(/([A-Za-z_]*)(.*)/);
        const getqstr=(str,withq)=>str.replace(QUOTEPAT,(m,qc)=>{
            return (withq?'"':'')+quotes[parseInt(qc)]+(withq?'"':'');
        });
        let rawattr=rawA?rawA.substr(1,rawA.length-2).replace(QSTRING_REGEX_G,(m,m1)=>{
            quotes.push(m1);
            return QUOTEPREFIX+(quotes.length-1);
        }):'';
        const attrarr=rawattr.split(/( +)/), attrs={};       //至少一個空白做為屬性分隔
        let i=0,width=0;
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

        if (width==0 && !ALLOW_EMPTY[tagName]) width=-1;

        textoffset+= offset-prevoff;            //目前文字座標，做為標記的起點
        tags.push( new OffTag(tagName, attrs, idx, textoffset, width) );
        textoffset+=putback.length - m.length;  
        prevoff=offset;
        return putback;
    })
    resolveTagWidth(text,tags);
    return [text,tags];
}

export const parseOfftext=(str,starty=0)=>{
    let lines=str;
    if (typeof str=='string') lines=str.split(/\r?\n/);
    const out=lines.map((line,y)=>parseOfftextLine(line,y+starty) );
    const text=out.map(item=>item[0]);
    const tags=[];
    out.forEach(item=>tags.push(...item[1]));
    return {text,tags};
}