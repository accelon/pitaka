export * from './sortedarray.js'
export * from './packintarray.js'
export * from './unpackintarray.js'
export * from './packstr.js'
export * from './unpackstr.js'
export * from './rlestr.js'
export * from './argument.js'
export * from './unicode.js'
export * from './nested-ordered-list.js'
export * from './bsearch.js'
export * from './es6.js'
export * from './html.js'
export * from './cnumber.js'
export * from './rnumber.js'
export * from './symbols.js'
export * from './device.js'
export * from './cjk.js'
export * from './diff.js'
export * from './pattern.js'
export * from './errata.js'
export * from './base26.js'
export * from './loadscript.js'
export * from './array.js'
export * from './lemma.js'

export function linesOffset(lines){
    const out=[0];
    let acc=0;
    for (let i=0;i<lines.length;i++) {
        out.push(acc);
        acc+=lines[i].length;
    }
    out.push(acc);
    return out;
}
export function chunkjsfn(chunk,folder){
    const jsfn=chunk.toString().padStart(3,'0')+'.js'
    return folder?folder+'/'+jsfn:jsfn;
}

export const stripLinesNote=(lines,notes,marker='⚓')=>{
    const regex=new RegExp(marker+'([0-9]+)','g');

    lines=lines.map((line,y)=>{
        let accwidth=0;
        let nline=line.replace(regex,(m,m1,offset)=>{
            const note=notes[m1];
            if (note) {
                note[0]=y;
                note[1]=offset-accwidth;    
            } else {
                /* skip note in the first line , difficult to pin */
                if (y) console.log('note not found',m1,y,line)
            }
            accwidth+=m.length;
            return '';
        })
        return nline;
    })
    return lines;
}

export const combineObject=(obj1,obj2)=>{
    const out=Object.assign({},obj1);
    for (let lbl in obj2 ) {
        if (out[lbl]) {
            out[lbl]=Object.assign(obj1[lbl],obj2[lbl]);
        } else {
            out[lbl]=obj2[lbl];
        }
    }
    return out;
}
