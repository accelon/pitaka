import nodefs from '../platform/nodefs.js';
await nodefs;

let tested=0,passed=0;
import {openBasket,useBasket} from '../basket/open.js';
import {referencing,dereferencing,openPointerBaskets} from './pointers.js'

await openPointerBaskets(['/openlit/6']);

const ptk=useBasket('openlit');  


const ptr1=(await referencing({p:'/openlit/6/3:1',x:5,w:8}))[0];   //pointer to a line
const ptr2=(await referencing({y:81,x:5,w:8},ptk))[0];             //provide absolute line number

passed+= (ptr1==ptr2) ;  tested++;

const [p1,p2]=await dereferencing([ptr1,ptr2],ptk);
passed+= (p1.y==p2.y) ;  tested++;
passed+= (JSON.stringify(p1.h)==JSON.stringify(p2.h)) ;  tested++;

console.dir(p1,{depth:4})
console.log(`passed:${passed} /${tested} `)
