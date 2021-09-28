/** 將內嵌標記剖為正文及標記陣列*/
const QUOTEPREFIX='\u001a'
const QUOTEPAT=/\u001a(\d+)/g
export const OFFTAG_REGEX_G=/\^([A-Za-z_]+[#\.~A-Za-z_\-\d]*)(\[(?:\\.|.)*?\])?/g
export const QSTRING_REGEX_G= /"((?:\\.|.)*?)"/g
export const TNAME=0, TATTR = 1, TPOS = 2,TWIDTH =3;

const parseCompactAttr=str=>{  //  序號和長度和標記名 簡寫情形
    const out={}, arr=str.split(/([#~])/);
    while (arr.length) {
        const v=arr.shift();
        if      (v==='~') out['~']=arr.shift();
        else if (v==='#') out['#']=arr.shift(); 
        else if (v)       out.n=v;
    }
    return out;
}
const resolveTagWidth=(text,tags)=>{ 
    tags.forEach(tag=>{
        const tagpos=tag[TPOS];  //負數為從行末倒數之位置
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
export function parseOfftext(str){
    const tags=[];
    let textlength=0,prevoff=0;
    let text=str.replace(OFFTAG_REGEX_G,
    (m,rawT,rawA,offset)=>{
        let quotes=[],putback=''; //字串抽出到quotes，方便以空白為拆分單元, putback為標記中非屬性的文字，放回正文
        let [m2, tagName, compactAttr]=rawT.match(/([A-Za-z_]*)(.*)/);

        const getqstr=(str,withq)=>str.replace(QUOTEPAT,(m,qc)=>{
            return (withq?'"':'')+quotes[parseInt(qc)]+(withq?'"':'');
        });

        let raw=rawA?rawA.substr(1,rawA.length-2).replace(QSTRING_REGEX_G,(m,m1)=>{
            quotes.push(m1);
            return QUOTEPREFIX+(quotes.length-1);
        }):'';
        const arr=raw.split(/( +)/), attrs={};
        let i=0,width=0;
        if (compactAttr) Object.assign(attrs, parseCompactAttr(compactAttr));
        while (arr.length) {
            const it=arr.shift();
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
                if (arr.length && !arr[0].trim()) arr.shift() ;//drop the following space
            } else {
                putback+=getqstr(it,true);
            }
            i++
        }
        putback=putback.trimRight(); //remove tailing blank
        if (tagName=='br' && !putback) { //put a blank space infront, for English
            putback=' ';
            offset++
        }
        textlength+= offset-prevoff;
        const W=attrs['~'];
        if (W) {
            if (!isNaN(parseInt(W))) { //resolve position
                width=parseInt(W);
                delete attrs['~'];
            }
        }
        width=putback.length?putback.length:width;
        if (!width && (offset==0 || str[offset-1]=='\n')) {
            width=-1; //to end of line
        }
        tags.push( [tagName, attrs, textlength, width]);
        textlength+=putback.length - m.length;
        prevoff=offset;
        return putback;
    })
    resolveTagWidth(text,tags);
    return {text,tags}
}