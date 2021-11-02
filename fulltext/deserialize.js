import {unpack} from '../utils/index.js';
export const unpackPosting=raw=>{
    const out=[],arr=unpack(raw);
    let i=0,prevdoc=0;
    while (i<arr.length) {
        const ndoc=prevdoc+(arr[i]>>1);
        let v=arr[i+1];
        if (arr[i] % 2 == 1) {
            out[ndoc]=v; //one value
            i+=2;
        } else {
            i+=2;
            const a= new Int32Array(v);
            a[0]=arr[i];
            for (let j=1;j<v;j++) {
                a[j]=arr[i+j]+arr[i+j-1];
            }
            out[ndoc]=a;
        }
        prevdoc=ndoc+1;
    }
    return out;
}

export default {unpackPosting}