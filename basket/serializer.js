import {labelByType,LabelTypedefs} from '../htll/index.js'
import { pack, pack_delta } from '../utils/packintarray.js';
import { unpack_delta,unpack } from '../utils/unpackintarray.js';
import { unpackStrings } from '../utils/unpackstr.js';
import { packStrings } from '../utils/packstr.js';

export const serializeLabels=ctx=>{
    let pos=3;//labelNames,labelTypes,labelPoss
    const labelNames=[],labelPoss=[],labelTypes=[];
    let section=[],finalizing=[];

    for (let name in ctx.labeldefs) {
        const lt=ctx.labeldefs[name];
        finalizing.unshift(lt);
    }
    
    finalizing.forEach(lbl=>{
        lbl.finalize(ctx)
        if (lbl.linepos) {
            lbl.linepos.push(ctx.lastTextLine);
        }
    });

    for (let name in ctx.labeldefs) { 
        const lt=ctx.labeldefs[name];
        if (!lt.count) continue; //empty label not serialized
        labelNames.push(name);
        labelPoss.push(pos);
        labelTypes.push(lt.constructor.name);
        const lines=lt.serialize();
        section=section.concat(lines);
        pos+=lines.length;
    };
    section.unshift(labelPoss.join(','))
    section.unshift(labelTypes.join(','));
    section.unshift(labelNames.join(','));
    return section;
}

export const deserializeLabels=(section,range,typedefs,lastTextLine)=>{
    const labelNames=section[0].split(',');
    const labelTypes=section[1].split(',');
    const labelPoss=JSON.parse('['+section[2]+']');
    const out=[];
    const lastLine=range[1];
    for (let i=0;i<labelNames.length;i++) {
        const name=labelNames[i];
        const lbltype=LabelTypedefs[labelTypes[i]];
        let opts={};
        if (typedefs && typedefs[name]) opts=typedefs[name][1];
        const lt=new lbltype(name, { lastLine, ...opts });
        const labelPayload=[];
        for (let j=labelPoss[i];j<(labelPoss[i+1]||section.length);j++ ) {
            labelPayload.push(section[j]);
        }
        lt.deserialize(labelPayload,lastTextLine);
        out.push(lt);
    }
    return out;
}


export const serializeBreakpos=ctx=>{
    const lblbk=labelByType('LabelBook',ctx.labeldefs);
    if (!lblbk) throw "breakpos need LabelBook";
    const books={};
    const out=[];
    for (let bk of lblbk.idarr) {
        const arr=ctx.breakpos[bk];
        if (!arr) out.push('');
        else for (let i=0;i<arr.length;i++) {
            out.push(pack_delta( arr[i]||[])); //每一行的斷點轉為pack int arr
        }
        books[bk]=arr.length; //記錄每本書有幾行。
    }
    out.unshift( JSON.stringify(books) );
    return out;
}

export const serializeLemma=lemma=>{
    return packStrings(lemma);
}
export const deserializeBreakpos=(breakposSection,breakposSectionRange)=>{
    let si=0;
    const books=JSON.parse(breakposSection[si]);
    si++;
    for (let bk in books) {
        const arr=[];
        let count=books[bk];
        for (let i=0;i<count;i++) {
            arr.push( unpack_delta( breakposSection[si]) );
            si++;
        }
        books[bk]=arr;
    }
    return books;
}
// array of [linepos,"string"]
export const serializeLineposString=lineposString=>{
    const arr=lineposString.map(it=>it[0]);
    const jslines=[pack_delta(arr)];
    jslines.push(...lineposString.map(it=>it[1]));
    return jslines;
}
export const deserializeTrait=(jslines)=>{
    const names=jslines.shift().split('\t');
    const lengths=unpack(jslines.shift());
    return [names,lengths];
}

export const packNotes=(notes,ctx)=>{ //trait is array of {loc, pin, val, ?id }
    //serialize to an array of lines
    const linepos=[], pinarr=[], valarr=[], idarr=[];
    for (let i=0;i<notes.length;i++) {
        const {y,pin, val,id}=notes[i];
        linepos.push(ctx.startY+y+1); //one base
        pinarr.push(pin);
        valarr.push(val.replace(/\t/g,'\\t')); //tab is unlikely but possible
        if (id) idarr.push(id);
    }
    if (!ctx.notes.length) {
        ctx.notes=[ [],[],[],[]];
    }
    ctx.notes[0]=ctx.notes[0].concat(linepos);
    ctx.notes[1]=ctx.notes[1].concat(pinarr);
    ctx.notes[2]=ctx.notes[2].concat(valarr);
    ctx.notes[3]=ctx.notes[3].concat(idarr);
}
export const serializeNotes=ctx=>{
    const notes=new Array(4);
    if (ctx.notes[0]) notes[0]=pack(ctx.notes[0]);
    if (ctx.notes[3] && ctx.notes[3].length) notes[1]=ctx.notes[3].join('\t');
    else notes[1]='';
    if (ctx.notes[1]) notes[2]=ctx.notes[1].map( (pin,idx)=>pin+'\t'+ctx.notes[2][idx]).join('\n');
    const allnotes=notes.join('\n');
    
    return allnotes.split('\n'); //update the total line number
}
export function deserializeNotes(from){
    const linepos=unpack(this.getLine(from));
    const idarr=this.getLine(from+1).split('\t');
    return {section:from+2,idarr,linepos}
}
export function deserializeLemma(from) {
    return unpackStrings(this.getLine(from));
}
export const deserializeLineposString=jslines=>{
    const firstline=jslines.shift();
    const linepos=unpack_delta(firstline);
    const strings=jslines;
    return [linepos,strings];
}

export default {serializeLabels,deserializeLabels,serializeBreakpos
    ,serializeLineposString,deserializeLineposString,deserializeLemma,serializeLemma};