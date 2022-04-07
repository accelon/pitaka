import { pack, pack_delta } from '../utils/packintarray.js';
import { unpack_delta,unpack } from '../utils/unpackintarray.js';
export const serializeAttributes=attrIndex=>{
    const out=[];
    const attrs=attrIndex?Object.keys(attrIndex):null;
    if (attrs&&attrs.length) {
        const attrkeys=[];
        for (let i=0;i<attrs.length;i++) {
            const keyvals=attrIndex[attrs[i]];
            const keys=Object.keys(keyvals);
            attrkeys.push([attrs[i],keys]);
        }
        out.push(attrs.join('\t')); //names of attr
        const keycounts=pack(attrkeys.map(it=>1+it[1].length));
        out.push(keycounts); //keycount of each attr and 

        for (let i=0;i<attrs.length;i++) {
            const keyvals=attrIndex[attrs[i]];
            const codes=attrkeys[i][1];
            out.push(codes.join('\t'));
            for (let j=0;j<codes.length;j++) {
                const arr=keyvals[codes[j]];
                out.push(pack_delta(arr));
            }
        }
    }
    return out;
}
export const deserializeAttributes=(jslines,at)=>{
    const attrs=jslines[at++].split('\t');
    const keycounts=unpack(jslines[at++]);
    const attrIndex={};
    for (let i=0;i<attrs.length;i++) {
        attrIndex[attrs[i]]={};
        const codes=jslines[at++].split('\t');
        const count=keycounts[i]-1 ;//deduce codes
        for (let j=0;j<count;j++) {
            attrIndex[attrs[i]][codes[j] ]=unpack_delta(jslines[at++]);
        }
    }
    return attrIndex;
}
export default {serializeAttributes,deserializeAttributes}