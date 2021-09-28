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
export const OFFTAG_REGEX_G=/\^([A-Za-z_]+[#\.~A-Za-z_\-\d]*)(\[(?:\\.|.)*?\])?/g //標記樣式
export const QSTRING_REGEX_G= /"((?:\\.|.)*?)"/g                                  //字串標式
export const TNAME=0, TATTR = 1, TPOS = 2,TWIDTH =3 ,TLINE=4;                     //標記數據結構

const parseCompactAttr=str=>{  //              序號和長度和標記名 簡寫情形，未來可能有 @ 
    const out={}, arr=str.split(/([#~])/);
    while (arr.length) {
        const v=arr.shift();
        if      (v==='~') out['~']=arr.shift();
        else if (v==='#') out['#']=arr.shift(); 
        else if (v)       out.n=v;
    }
    return out;
}
const resolveTagWidth=(text,tags)=>{  //正文已準備好，可計算標記終點
    tags.forEach(tag=>{
        const tagpos=tag[TPOS];    //負數為從行末倒數之位置
        if (-1 > tag[TWIDTH]){     //只有-1常見（會壓縮儲存），其他的負值轉換為正值（從標記起算）
            const nl0=text.indexOf('\n',tagpos);
            const nl1=text.lastIndexOf('\n',tagpos);
            const linewidth=nl0-nl1;
            tag[TWIDTH]= tag[TWIDTH] +tagpos-nl1+linewidth-1;
            if (tag[TWIDTH]<0) tag[TWIDTH]=0;
        } else {    //以文字標定結束位置
            const w=tag[TATTR]['~'];
            if (!w)return;
            const pos=text.indexOf(w,tagpos);
            if (pos>0) {
                tag[TWIDTH]=pos+1-tagpos;
            } else tag[TWIDTH]=0;
            delete tag[TATTR]['~'];
        }
    })
}

const parseOfftextLine=(str,idx)=>{
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
            width=parseInt(W);
            delete attrs['~'];
        }
        width=putback.length?putback.length:width;
        if (!width && (offset==0 || str[offset-1]=='\n')) {
            width=-1; //to end of line
        }
        textoffset+= offset-prevoff;            //目前文字座標，做為標記的起點
        tags.push( [tagName, attrs, textoffset, width, idx]);
        textoffset+=putback.length - m.length;  
        prevoff=offset;
        return putback;
    })
    resolveTagWidth(text,tags);
    return [text,tags];
}

export const parseOfftext=str=>{
    let lines=str;
    if (typeof str=='string') lines=str.split(/\r?\n/);
    const out=lines.map( parseOfftextLine );
    const text=out.map(item=>item[0]).join('\n');
    const tags=[];
    out.forEach(item=>tags.push(...item[1]) );

    return {text,tags};
}