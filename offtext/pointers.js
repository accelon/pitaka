//unpack array of serialized pointer
import {openBasket, useBasket} from '../basket/index.js';
import {PATHSEP,DELTASEP,DEFAULT_TREE} from '../platform/constants.js'
import {makeHook, parseHook} from './hook.js';
import {parseOfftextLine} from './parser.js';

export const parsePointer=str=>{
    if (!str) return null;
    const res={ptk:'',bk:'',c:'',dy:0,hook:''};
    const pths=str.split(PATHSEP);
    if (str[0]=='/') {
        pths.shift();
        res.ptk=pths.shift();
    }
    res.bk=pths.shift();
    const [c,dy]=pths.shift().split(':');
    res.c=c;
    res.dy=parseInt(dy);
    res.hook=pths.join(PATHSEP);
    return res;
}
export const dereferencing=async (arr,ptk=null)=>{
    if (typeof arr=='string') arr=[arr];
    const out=[],jobs=[];
    for (let i=0;i<arr.length;i++) {
        const ptr={ptk:null, p:'',h:null};
        if (ptk) ptr.ptk=ptk.name;
        const pths=arr[i].split(PATHSEP);
        if (pths[0]==PATHSEP) {
            pths.shift(); //drop leading PATHSEP
            ptk=useBasket(pths.shift());
            ptr.ptk=ptk.name;
        }
        const thetree=(ptk.header.tree||DEFAULT_TREE).split(PATHSEP);
        const branches=[];
        for (let j=0;j<thetree.length;j++) {
            let pth=pths.shift();
            const m=pth.lastIndexOf(DELTASEP);
            let delta=m>-1?parseInt(pth.substr(m+1)):0;
            if (m>-1 && !isNaN(delta) ) {
                pth=pth.substr(0,m);
            }
            branches.push({lbl:thetree[j], id:pth , dy:delta});
            ptr.p += (ptr.p?PATHSEP:'')+ pth+(delta?DELTASEP+delta:'');
        }
        const [from,to]=ptk.narrowDown(branches);
        ptr.b=branches;
        const chunks=ptk.unreadyChunk(from,to)
        if (chunks.length) jobs.push( ptk.prefetchChunks(chunks));
        out.push([ptr, pths, from]);
    }
    await Promise.all(jobs);    //text is ready

    for (let i=0;i<out.length;i++) {
        const [ptr,pths, y]=out[i];
        const ptk=useBasket(ptr.ptk);
        const linetext= ptk.getLine(y);
        ptr.h=parseHook(pths,linetext,y);
    }

    return out.map(i=>i[0]);
}

export const serializePointer=({p,k})=>{
    return p+PATHSEP+k;
}

export const openPointerBaskets=async arr=>{
    if (!Array.isArray(arr)) arr=[arr];
    const pitakas={};
    for (let i=0;i<arr.length;i++) {
        let ptr=arr[i];
        if (ptr[0]==PATHSEP) {
            const pths=ptr.split(PATHSEP);
            pths.shift(); //drop leading PATHSEP
            pitakas[pths.shift()]=true;
        }
    }
    const jobs=[];
    for (let name in pitakas) {
        if (!useBasket(name)) jobs.push(openBasket(name));
    }
    await Promise.all(jobs);
}

//serialize array of pointers
export const referencing=async (arr, ptk=null)=>{
    if (!Array.isArray(arr)) arr=[arr];
    const jobs=[];
    const pointers=[];
    let from,to;
    
    for (let i=0;i<arr.length;i++) {
        let {p,x,y,w,hook}=arr[i];
        if (hook) { y=hook.y;x=hook.x;w=hoo.w; }

        if (p) {
            if (p[0]==PATHSEP) {
                const pths=p.split(PATHSEP);
                pths.shift();
                ptk=useBasket(pths.shift());
                p=pths.join(PATHSEP)
            }
            [from,to]=ptk.getPage(p);
            y=from;
        } else {
            if (!y) y=0;
            p=ptk.pageAt(y||0).join(PATHSEP);
        }
        const unready=ptk.unreadyChunk(from,to-from);

        if (unready.length) jobs.push(ptk.prefetchChunks( unready));
        pointers.push({p,y, x, w ,t:'',k:''});
    }
    jobs.length && await Promise.all(jobs);

    for (let i=0;i<pointers.length;i++) {
        const ptr=pointers[i];
        const linetext=ptk.getLine(ptr.y);

        const [text]=parseOfftextLine(linetext);
        if (ptr.w==-1) ptr.w=text.length-ptr.x;

        ptr.t=text.substr(ptr.x,ptr.w);
        ptr.k=makeHook(text,ptr.x,ptr.w);
    }

    //convert to hook
    // return pointers;
    return pointers.map(serializePointer);
}
