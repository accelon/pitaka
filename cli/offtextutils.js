import {alphabetically0,CJKRange,sortObj,groupArr,fromObj} from '../utils/index.js'
import {segmentText} from '../nlp/segmentator.js'
import { prepareInput } from './input.js';
import { parseOfftextLine } from '../offtext/parser.js';

const segmentOffetxt=(lines,dict,freq,tokens,debug=false)=>{
    const segmentated=[];
    lines.forEach(line=>{
        let prev=0;
        line.replace(/([\u3400-\u9fff\ud400-\udfff]+)/g,(m,text,offset)=>{
            const s=line.substring(prev,offset);
            if (s) segmentated.push(s);
            const [words,candidates]=segmentText(text,dict,freq,debug);
            if (tokens) {
                words.forEach(w=>{
                    if (CJKRange(w)) {
                        if (!tokens[w]) tokens[w]=0;
                        tokens[w]+= w.length>1? w.length*5:1;
                    }
                })
                for (let c in candidates) {
                    if (!tokens[c]) {
                        tokens[c]= c.length>1?c.length*5:1;
                    }
                }
            }
            segmentated.push(...words);
            prev=offset+m.length;
        })
        if (prev<line.length) segmentated.push(line.substr(prev));
        segmentated.push('\n')
    })
    return segmentated;
}

const isBegin=ch=>{
    return  ch=='笑'  || ch=='道' || ch=='這'
    || ch=='那' || ch=='哪' || ch==='說'||ch==='云'||ch=='被'
    ||ch=='向'||ch=='以'||ch==='某'||ch==='於'
}
const isEnd=ch=>{
    return ch=='氏'||ch==='中'||ch==='後'||ch==='等'||ch==='個'
}
const isStopChar=ch=>{
    return ch==='的' || ch=='了' || ch=='是'||ch==='之'||ch=='矣'||ch==='與'
    // ||ch==='又'||ch==='也'||ch=='有'
    // ||ch==='妳'|| ch==='你'||ch==='我'||ch==='曰'||ch==='與'||ch==='此'||ch==='汝'||ch==='吾'
    // ||ch==='而'||ch==='在'||ch==='且'||ch==='或'||ch==='並'||ch=='矣'||ch==='裏'
    // ||ch==='裡';
}
const possibleCombination=wordlist=>{
    const out={};
    let term='',total=0;
    for (let i=0;i<wordlist.length;i++ ){
        const w=wordlist[i];
        if (w.length===1 && w.charCodeAt(0)>=0x3400&&w.charCodeAt(0)<=0x9fff) {
            // if (isBegin(w)) {
            //     if (term.length>1) {
            //         if (!out[term]) out[term]=0;
            //         out[term]++;
            //         total++;
            //     }
            //     term='';
            // }
            term+=w;
            // if (isEnd(w)) {
            //     if (term.length>1) {
            //         if (!out[term]) out[term]=0;
            //         out[term]++;
            //         total++;
            //     }
            //     term='';
            // }
        } else {
            if (term.length>1) {
                if (!out[term]) out[term]=0;
                out[term]++;
                total++;
            }
            term='';
        }
    }
    const arr=sortObj(out);
    const average=total/arr.length;
    const possible=arr.filter(it=>it[1]>average*2);
    return possible;

}
const spacing=arr=>{
    if (!arr.length)return '';
    if (arr.length<1)return arr[0];

    let out='',prev=arr[0];
    for (let i=1;i<arr.length;i++) {
        if (CJKRange(prev[prev.length-1]) && CJKRange(arr[i]) ) {
            out+=' ';
        }
        prev=arr[i];
        out+=prev;
    }
    return out;
}
export const intersectFile=async ()=>{
    let wl1=fs.readFileSync(process.argv[3],'utf8').split(/\r?\n/);
    let wl2=fs.readFileSync(process.argv[4],'utf8').split(/\r?\n/);
    wl1=(wl1.map(it=>it.split(',')[0]))

    let out={};
    wl1.forEach(item=>{
        if (!out[item])out[item]=0;
        out[item]++;
    })

    wl2=(wl2.map(it=>it.split(',')[0]))
    wl2.forEach(item=>{
        if (out[item])out[item]++;
    })
    // console.log(out)

    const arr=sortObj(out).filter(item=>item[1]>1);
    
    // console.log(arr)
}
export const wordseg=async (config)=>{
    // console.time('prepare')
    const [lines,dict,freq,fn]=await prepareInput(config,'entrysize');
    // console.timeEnd('prepare')
    console.time('wordseg')
    let tokens={};
    let segmentated=segmentOffetxt(lines,dict,freq,tokens);
    // console.log('phrase1',segmentated.join('│'))

    const localdict=sortObj(tokens,alphabetically0);
    let newdict=localdict.map(it=>it[0]);
    let newfreq=localdict.map(it=>it[1]);
    
    tokens={};
    segmentated=segmentOffetxt(lines,newdict,newfreq,tokens,true);

    const possible=possibleCombination(segmentated,tokens);

    //phrase 3
    localdict.push(...possible);
    localdict.sort(alphabetically0)
    newdict=localdict.map(it=>it[0]);
    newfreq=localdict.map(it=>it[1]);

    segmentated=segmentOffetxt(lines,newdict,newfreq,tokens,true);
    console.log(spacing(segmentated));
    console.log('token count',sortObj(tokens).length);

    fs.writeFileSync(fn+'-tokens.txt',groupArr(segmentated).filter(it=>CJKRange(it[0])).join('\n'),'utf8');
    console.timeEnd('wordseg')
}

export const entrysort=()=>{
    const fn=process.argv[3]||'';
    if (!fn) {
        console.log('missing file name');
        return;
    }
    if (!fs.readFileSync(fn)) {
        console.log('file not found',fn)
        return;
    }
    const lines=fs.readFileSync(fn,'utf8').trimLeft().split(/\r?\n/);
    
    let body=[], entry='',entries=[];
    lines.forEach((line,i)=>{
        const first3=line.substr(0,3);
        if (first3=='^e['||first3=='^e ') {
            body=[];
            const [text]=parseOfftextLine(line);
            entry=text;
            entries.push([entry,body])
        }
        body.push(line);
    })
    const entries_before=entries.map(it=>it[0]).join('\n');
    console.log('sorting entries',entries.length)
    entries.sort(alphabetically0);

    const entries_after=entries.map(it=>it[0]).join('\n');

    if (entries_before===entries_after) {
        console.log('entry in order')
    } else {
        const out=[];
        const outfn=fn+'.sorted';
        entries.forEach(it=>out.push(...it[1]));    
        fs.writeFileSync(outfn,out.join('\n'),'utf8');
        console.log('saved to',outfn);
    }
}
export const group=()=>{
    const fn=process.argv[3];
    const pat=process.argv[4];
    if (!fs.existsSync(fn)) {
        console.warn('missing filename');
        return;
    }

    const obj={},out=[];
    if (pat) {
        const content=fs.readFileSync(fn,'utf8').trimLeft();
        const regex=new RegExp(pat,'g');
        content.replace(regex,(m,m1)=>{
            if(!obj[m1])obj[m1]=0;
            obj[m1]++;
        })
    } else { 
        const lines=fs.readFileSync(fn,'utf8').trimLeft().split(/\r?\n/);
        lines.forEach(line=>{
            if(!obj[line])obj[line]=0;
            obj[line]++;
        })
    }
    
    for (let key in obj) {
        out.push([key,obj[key],0]);
    }
    out.sort((a,b)=>b[1]-a[1]);
    let sum=0;
    out.forEach(it=>{sum+=it[1];it[2]=sum})
    console.log(out.join('\n'))
}

export const search=async (config)=>{
    const [lines,booknames,bookid]=await prepareInput(config);
    let notfound=0,touched=0;
    for (let i=0;i<lines.length;i++) {
        const line=lines[i];
        const items=line.split(/,/);
        
        const at=booknames.indexOf(items[0]);       
        if (at>0) {
            items[items.length]=bookid[at];
            lines[i]=items.join(',');
            console.log(lines[i]);
            touched++;
        } else notfound++;
    }

    console.log('total',lines.length,'not found',notfound)
    if (touched) {
        const outfn=fn+'.found';
        // fs.writeFileSync(outfn,lines.join('\n'),'utf8');
        console.log('written to',outfn)
    }
}