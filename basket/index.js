import {openBasket} from './open.js';
import {dereferencing} from '../offtext/pointers.js';
import {validateConfig} from './config.js'
import pool from './pool.js';
import Builder from './builder.js';

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
async function fetchHooks(hooks){
    if (typeof hooks=='string') hooks=[hooks];
    const out=[];
    for (let i=0;i<hooks.length;i++){
        const hook=hooks[i];
        const ptr=await dereferencing(hook);
        if (ptr.length) {
            const {h,ptk,y}=ptr[0];  //y is the beginning of chunk
            const pitaka=useBasket(ptk);
            let nline=h.y,count=1;  //h.y is y of hook
            if (pitaka.isDictionary()) { //fetch the dictionary entry
                nline=y;
                count=h.y-y+1;
            }
            const hlines=await readLines({basket:ptk,nline,count});
            for (let j=0;j<hlines.length;j++) {
                out.push({ text:hlines[j][1], y:hlines[j][0] , 
                    ptk:pitaka, key:'bl'+Math.random() }) ; 
            }                
        }
    }
    return out;
}

export {openBasket,pool,opened,useBasket,readLines,Builder,validateConfig
,fetchHooks};
