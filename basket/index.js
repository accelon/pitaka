import {openBasket} from './open.js';
import {dereferencing,parseAddress} from '../offtext/pointers.js';
import {validateConfig} from './config.js'
import pool from './pool.js';
import Builder from './builder.js';
import { PATHSEP } from '../platform/constants.js';

const opened=()=>pool.getAll();
const useBasket=name=>pool.get(name);

const MAXLINE=256;
async function readLines ({basket,nline,eline,count=10}={}) {
    if (!basket )return;
    const bsk=pool.get(basket);
    if (!bsk) {
        console.error('basket not open',basket)
        return [];
    }
    count=eline?(eline-nline):(count||1);
    if (count>MAXLINE) count=MAXLINE;
    const lines=await bsk.readLines(nline, count );

    return lines;
}

const trimDictDef=lines=>{
    let dline=-1,yline=-1;
    for (let i=lines.length-1;i;i--) {
        const f3=lines[i][1].substr(0,3); 
        if ((f3==='^d ' || f3==='^d[') && dline===-1) dline=i; //最接近的定義
        if (f3==='^y ' && yline===-1) yline=i; //最接近的音
    }
    const out=[];
    out.push(lines[0]);
    if (yline>0) out.push(lines[yline]);

    if (dline>0) for (let i=dline;i<lines.length;i++) {
        out.push(lines[i]);   
    }
    return out;
}

async function fetchLoc(loc,extraline=0){ //fetch a page
    if (!loc)return '';
    const pths=loc.split('/');
    if (pths[0]=='') pths.shift();
    const ptkname=pths.shift();
    if (!pool.has(ptkname))return '';
    const ptk=useBasket(ptkname);
    const [from,to]=await ptk.getPageRange(pths.join(PATHSEP));
    await ptk.prefetchLines(from,to); 
    const rawlines=[];
    for(let i=from;i<=to+extraline;i++) {
        rawlines.push([i,ptk.getLine(i)])
    }
    return [ptkname,rawlines];
}
async function fetchHooks(hooks){
    if (typeof hooks=='string') hooks=[hooks];
    const out=[];
    for (let i=0;i<hooks.length;i++){
        const hook=hooks[i];
        const ptr=await dereferencing(hook);
        if (ptr.length) {
            const {h,ptk,y,next}=ptr[0];  //y is the beginning of chunk
            const pitaka=useBasket(ptk);
            let nline=h.y,count=1;  //h.y is y of hook
            if (pitaka.isDictionary()) { //fetch the dictionary entry
                nline=y;
                count=(h.y==y)? next-y : h.y-y+1; //如果沒有 hook ，返回整條
            }
            let hlines=await readLines({basket:ptk,nline,count});

            if (h.y>y && pitaka.isDictionary()) { //去掉多餘的義項 ，測試 水滸第八回 頭腦 (結婚的對象)
                hlines=trimDictDef(hlines);
            }
            for (let j=0;j<hlines.length;j++) {
                out.push({ text:hlines[j][1], y:hlines[j][0] , 
                    ptk:pitaka, key:'bl'+Math.random() }) ; 
            }                
        }
    }
    return out;
}

function bestEntries(tf){
    const ptks=pool.getAll();
    const out=[];
    ptks.forEach(ptk=>{
        if (!ptk.isDictionary())return;
        const entries=ptk.matchEntry(tf);
        if (entries&&entries.length) {
            out.push({ptk:ptk.name, ...entries[0] } );
        }
    })
    out.sort((a,b)=>b.e.length-a.e.length)
    return out;
}

async function fetchRange(url,opts={}){
    const ptr=parseAddress(url);
    let ptk=opts.ptk;
    const extra=opts.extra||0;
    if (!ptk) ptk=await openBasket(ptr.basket);
    const [from,to]=ptk.getPageRange(ptr.loc);
    await ptk.prefetchLines(from,to+1+extra); 
    
    const lines=[];
    for (let i=from;i<to+1+extra;i++) {
        lines.push(ptk.getLine(i));
    }

    return {from,lines,loc:ptr.loc,ptk}
}

export {openBasket,pool,opened,useBasket,readLines,Builder,validateConfig
,fetchHooks,fetchLoc,bestEntries,fetchRange};
