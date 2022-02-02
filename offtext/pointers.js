//unpack array of serialized pointer
import pool from '../basket/pool.js';
import {PATHSEP,NAMESPACESEP,LOCATORSEP} from '../platform/constants.js'
import {makeHook, parseHook} from './hook.js';
import {parseOfftextLine} from './parser.js';

/*
   db:bk.p:delta/k1=v1/k2=v2
*/
export const parseAddress=str=>{
    if (!str) return null; 
    const res={basket:'',loc:'', dy:0, attrs:{} }; 
    const arr=str.split(PATHSEP);

    const o=arr.shift().split(NAMESPACESEP);

    if (o.length==1) {
        res.loc=o[0];
    } else {
        res.basket=o[0];
        res.loc=o[1];
        res.dy=parseInt(o[2]||0)||res.dy;
    }

    arr.forEach( (item,idx) =>{
        const at=item.indexOf('=');
        if (at>0) {
            res[item.substr(0,at)]=item.substr(at+1);
        } else {
            res.attrs[idx]=item;
        }
    })
    return res;
}
export const stringifyAddress=obj=>{
    if (!obj.basket && obj.ptk) obj.basket=obj.ptk.name;
    const arr=[];
    arr.push(obj.basket+NAMESPACESEP+obj.loc+ (obj.dy?NAMESPACESEP+obj.dy:''));
    for (let key in obj.attrs||{})  arr.push( key+'='+obj.attrs[key])
    return arr.join(PATHSEP)
}

export const dereferencing=async (arr,ptk=null)=>{
    if (typeof arr=='string') arr=[arr];
    const out=[],jobs=[];
    for (let i=0;i<arr.length;i++) {
        const ptr={ptk:null, p:'',h:null};
        if (ptk) ptr.ptk=pool.get(ptk.name);
        const pths=arr[i].split(LOCATORSEP);
        if (arr[i][0]!==LOCATORSEP) {
            pths.shift(); //drop leading PATHSEP
            ptk=pool.get(pths.shift());
            ptr.ptk=ptk.name;
        }

        const addr=pths.join(PATHSEP);
        const [from,to]=ptk.getPageRange(addr);

        const chunks=ptk.unreadyChunk(from,to)
        if (chunks.length) jobs.push( ptk.prefetchChunks(chunks));
        out.push([ptr, pths, from, to]);
    }
    await Promise.all(jobs);    //text is ready

    for (let i=0;i<out.length;i++) {
        const [ptr,pths, y, to]=out[i];
        const linetext= ptr.ptk.getLine(y);
        ptr.next=to;
        ptr.h=parseHook(pths,linetext,y);
    }

    return out.map(i=>i[0]);
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
                ptk=pool.get(pths.shift());
                p=pths.join(PATHSEP)
            }
            [from,to]=ptk.getPage(p);
            y=from;
        } else {
            if (!y) y=0;
            p=ptk.locOf(y||0);
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
    return pointers.map(({p,k})=>p+PATHSEP+k);
}
