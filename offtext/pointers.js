//unpack array of serialized pointer
import {openBasket} from '../basket/open.js';
import {PATHSEP,INCSEP,DEFAULT_TREE} from '../platform/constants.js'
import {makeHook} from './hook.js';
import {parseOfftextLine} from './parser.js';

export const dereferencing=async arr=>{
    if (typeof arr=='string') arr=[arr];

}

export const serializePointer=({p,y,h})=>{
    return p+PATHSEP+INCSEP+y+PATHSEP+h;
}

//serialize array of pointers
export const referencing=async (arr, ptk=null)=>{
    if (!Array.isArray(arr)) arr=[arr];
    const jobs=[];
    const pointers=[];
    for (let i=0;i<arr.length;i++) {
        const {p,x,y,w}=arr[i];
        const [from,to]=ptk.getPage(p);
        jobs.push(ptk.prefetchLines( from+y, to-from+y));
        pointers.push({p,y,y0:from+y, x, w ,t:'',h:''});
    }
    await Promise.all(jobs);

    for (let i=0;i<pointers.length;i++) {
        const ptr=pointers[i];
        const linetext=ptk.getLine(ptr.y0);

        const [text]=parseOfftextLine(linetext);
        if (ptr.w==-1) ptr.w=text.length-ptr.x;

        ptr.t=text.substr(ptr.x,ptr.w);
        ptr.h=makeHook(text,ptr.x,ptr.w);
    }

    //convert to hook
    return pointers.map(serializePointer);
}
