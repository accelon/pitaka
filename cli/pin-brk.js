/* generate pin information from off */
import {glob,nodefs,writeChanged, readTextLines,kluer,DELTASEP} from 'pitaka/cli';
import {pinPos, toParagraphs, afterPN} from 'pitaka/align';
const srcfolder='off/';     //不git
const desfolder='brk/';  //須git
// let pat=process.argv[2]||"dn1";
const {red} = kluer;

const pinParagraph=([id,paralines],opts={})=>{
    //每一段第一行必有有號段，之後可能有^n 必定在行首。
    const out=[];
    const paras=[]; //每個<p>  一行
    let line=afterPN(paralines[0]);
    for (let i=1;i<paralines.length;i++) {
        let t=afterPN(paralines[i]);
        if (t.length<paralines[i].length) { //新的一行
            paras.push(line);
            line='';
        }
        line+=t;
    } 
    paras.push(line);
    let lidx=0, pins=[];
    let offset=afterPN(paralines[0]).length;
    
    const addParaPins=()=>{
        //段不分句無釘文，只補空行的情況，多補一個\t ，否則無法區分
        // "\t" 產生一空行，"\t\t" 產生兩空行
        // "A\t" 產生以A開頭的分句，以及補一空行
        // "\tA" 補一空行，然是以A開頭的分句
        //參見breaker.js ::breakByPin，無釘文的情況
        if (pins.filter(it=>!!it).length==0) { 
            pins.push('')
        }
        const prefix=out.length?DELTASEP+out.length:id;
        out.push(prefix+'\t'+pins.join('\t'));
        pins=[];
        lidx++;
        offset=0;
    }

    for (let i=1;i<paralines.length;i++) {
        const l=afterPN(paralines[i]);
        if (!l) { //空白行
            pins.push('');
            continue;
        }
        const paratext=paras[lidx];  //合併後整段(含無號段)文字

        if (l.length<paralines[i].length) {//新的一行
            addParaPins();
        } else { //被折之文字
            const pin=pinPos(paratext,offset,opts);

            if (!pin) {
                throw 'cannot get pin at sentence '+i+' of '+paratext+' offset:'+offset;
            }
            pins.push(pin);
        }
        offset+=l.length;
    }
    addParaPins();
    return out.join('\n'); 
}

export const pin=(config,pat)=>{
    const filelist= glob(srcfolder,pat).filter(fn=>fn.endsWith('.off'));

    const opts={cjk:config.lang=='zh'}//, wholeword:true}//wholeword
    filelist.forEach(fn=>{
        const out=[];
        let lines=readTextLines(srcfolder+fn);
        const paras=toParagraphs(lines);  //返回 [ id, paralines ] , paralines 是分好句的字串陣列
        out.push(... paras.map(([id,lines])=>pinParagraph([id,lines],opts)));
        //dn1有559個段號(^n\d+)，927個p(368個^n )
        //按 sc 分為4104 句。
        //輸出的文字檔只有 927 行，每行的pin 以tab 隔開
        //gen-pli.js 會讀取 pinpos/ 的txt 檔做為分句標準
        
        let outfn=desfolder+fn.replace('.off','.txt');
        let renamed=false;
        if (fs.existsSync(outfn)) {
            renamed=true;
            outfn+='.gen';
        }
        if (writeChanged(outfn, out.join('\n'))) {
            if (renamed) console.log(red('file exists, renamed to'),outfn);
            console.log('written',outfn,'lines',out.length);
        }
    });
}

