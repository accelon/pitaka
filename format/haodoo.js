// uPDB file format: http://www.haodoo.net/?M=hd&P=mPDB22#P
/*

#新版 uPDB (Unicode) 及 PDB (Big5) 檔規格

機子及作業系統越來越多，我不可能逐一撰寫閱讀軟體，因而特將uPDB及PDB檔詳細規格公布如下，
方便有興趣、有時間、能寫程式的讀友，為新機種撰寫閱讀軟體。

1.PDB是源自Palm作業系統的一個單一檔案，簡易資料庫。
2.每一個PDB檔含N筆不定長度的資料(record)。
3.PDB檔最前面當然要有個Header，定義本資料庫的特性。
4.因資料長度非固定，無法計算位置。所以Header之後，是各筆資料所在的位置，
    可以用來讀資料及計算每筆資料的長度。
5.之後，就是一筆一筆的資料，沒什麼大學問可言。

6.檔案的前78個bytes，是Header[0..77]：
    Header[0..34]舊版是放書名，新版是放作者。可以不理。
    Header[35]是2，舊版是1。可以不理。
    Header[36..43]是為Palm而加的兩個日期，可以不理。
    Header[44..59]都是0。可以不理。
    Header[60..63]是"BOOK"。可以不理。
    Header[64..67]是判別的關鍵，PDB是"MTIT"，uPDB是"MTIU"。
    Header[68..75]都是0。可以不理。
    Header[76..77]是record數 = N (章數) 加2 (目錄及書籤)。

7.每筆資料的起始位置及屬性，依Palm的規格是8個bytes，前4個bytes是位置，
    後4個bytes是0。一共有 (N+2) * 8 bytes。

8.第一筆資料定義書的屬性，是8個空白字元、書名、章數及目錄：
    (PDB檔)
    8個空白btyes，可以不理；
    之後接書名是Big5碼，後接三個ESC(即27)；
    之後接章數(ASCII string)，後接一個ESC；
    之後接目錄，各章之標題是以ESC分隔。
    (uPDB檔)
    8個空白btyes，可以不理；
    之後接書名是Unicode碼，後接三個ESC(即27,0)；
    之後接章數(ASCII string)，後接一個ESC (27, 0)；
    之後接目錄，各章之標題是以CR(13,0) NL(10,0) 分隔。

    再來是N筆資料，每筆是一章的內容，PDB檔是Big5碼
    (是null-terminated string，最後一個byte是0)，uPDB檔是Unicode碼。

    第N+2筆資料是書籤，預設是-1。可以不理。
*/
import {extractChineseNumber} from 'pitaka/utils';
const ctbl=[
    [/︽/g,'《'],    [/︾/g,'》'],
    [/︵/g,'（'],    [/︶/g,'）'],
    [/︿/g,'〈'],    [/﹀/g,'〉'],
    [/︻/g,'【'],    [/︼/g,'】'],
    [/﹁/g,'「'],    [/﹂/g,'」'],
    [/︹/g,'〔'],    [/︺/g,'〕'],
    [/︷/g,'｛'],    [/︸/g,'｝'],
    [/﹃/g,'『'],    [/﹄/g,'』'],
    [/︙/g,'…'], [/[︱｜]/g,'—'],
]
const convertHaodoo=str=>{
    for (let i=0;i<ctbl.length;i++) {
        str=str.replace(ctbl[i][0],ctbl[i][1])
    }
    return str; //use unix-style linebreak;
}

//first record consists mix ucs2 and ascii encoding,
//not 16-bits align, coundn't pass to decoder.
const parseFirstRecord=(buf,start,len,decoder)=>{ //special care with mix ule-16 and ascii encoding
    const u16=new Uint16Array(buf, start,len);

    const endOfBookName=u16.indexOf(0x1b);
    const bookname=decoder.decode(new Uint8Array(buf,start,endOfBookName*2 ))
    .replace(/\u2020/g,'');

    let tocstart=start+endOfBookName*2+6;//skip 3 (0x1b,0x0)
    
    const u8=new Uint8Array(buf,tocstart,8);
    //assuming chapter less than 10 digits
    //nChapter is redundant, just skip it.
    //
    let i=0;
    while (i<8&&u8[i]>=0x30&&u8[i]<0x40) {//ascii n chapter
        i++;
    }
    i+=2;//skip 0x1b,0x0
    tocstart+=i;
    const toc=decoder.decode(new Uint8Array(buf,tocstart,start+len-tocstart)).replace(/\r?\n/g,'\n');

    return '^bk '+bookname+'\n'+toc;
}
/* 
   input :uPDB raw buffer
   output: array of string holding each record, unix-style line break.
    
   structure of first record:
      《bookname》
      Table-of-content (one line per chapter)

*/
export const readHaodoo=buf=>{
    if (typeof Buffer!=='undefined'&& buf instanceof Buffer) {
        buf=buf.buffer;
    }
    const signature=new DataView( buf, 64,4);

    //must be MTIU, only accept uPDB format
    if (signature.getUint32()!==0x4d544955) return;
    
    const nrec=(new DataView( buf, 76,2)).getUint16();
    
    const recheader=new DataView(buf, 78, nrec*8);

    const offsets=[],output=[];
    for (let i=0;i<nrec;i++) {
        offsets.push(recheader.getInt32(i*8));
    }
    const decoder=new TextDecoder('utf-16le');
    for (let i=0;i<nrec-1;i++) {
        const start=offsets[i]
        const len=offsets[i+1]-start;
        const rec=new DataView(buf, start, len);
        let s;
        if (i==0){     //remove ascii 章
            s=parseFirstRecord(buf,start,len,decoder); 
        } else {//remaining record are pure utf-16
            const content=decoder.decode(rec).replace(/\r?\n/g,'\n');
            const at=content.indexOf('\n');
            const firstline=content.substr(0,at);
            let n=extractChineseNumber(firstline);
            s='^c'+n+' '+content;
        }
        output.push( convertHaodoo(s)); //first line is chapter
    }
    return output;
 }