import {readTextFile} from '../platform/inputfiles.js'
export const loadOfftextChunk=async fn=>{
    const content=await readTextFile(fn);
    const items=content.split(/(\^[ce][\d ]+.+?\n)/);
    const entries={};
    let i=0,key='';
    while (i<items.length) {
        const c=items[i].trim();
        const m=c.match(/^\^[ce]([\d ]+)/);
        if (m) {
            if (parseInt(m[1])) {
                key=parseInt(m[1]);
            } else {
                key=c.substr(3);
            }
        } else {
            const lines=c.split("\n");
            if (entries[key]) entries[key].push(...lines);
            else entries[key]=lines;
        }
        i++;
    }
    return entries;
}