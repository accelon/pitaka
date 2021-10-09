import {openBasket} from './open.js';
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
import pool from './pool.js';
const opened=()=>pool.getAll();
const useBasket=name=>pool.get(name);
import Builder from './builder.js';
import {validateConfig} from './config.js'
export {openBasket,pool,opened,useBasket,readLines,Builder,validateConfig};
