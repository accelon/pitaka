import {alphabetically0, bsearch} from 'pitaka/utils'
import { openBasket } from '../index.js';
import { parseOfftextLine } from '../offtext/parser.js';
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
        console.log(pat)
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

export const search=async ()=>{
    const fn=process.argv[3];
    const ptkname=process.argv[4];
    const ptk=await openBasket(ptkname);
    if (!ptk) throw "cannot open pitaka "+ptkname;
    let lbl=ptk.getLabel('bk');
    let arr=[];
    if (!lbl) {
        lbl=ptk.getLabel('e');
        if (lbl) arr=lbl.idarr;
    } else {
        arr=lbl.names;
    }
    if (!lbl) throw "not a valid pitaka"
    
    const lines=fs.readFileSync(fn,'utf8').trimLeft().split(/\r?\n/);

    let notfound=0,touched=0;
    for (let i=0;i<lines.length;i++) {
        const line=lines[i];
        const items=line.split(/,/);
        
        const at=arr.indexOf(items[0]);       
        if (at>0) {
            items[items.length]=lbl.idarr[at];
            lines[i]=items.join(',');
            touched++;
        } else notfound++;
    }

    console.log('total',lines.length,'not found',notfound)
    if (touched) {
        const outfn=fn+'.found';
        fs.writeFileSync(outfn,lines.join('\n'),'utf8');
        console.log('written to',outfn)
    }
}