import nodefs from '../platform/nodefs.js';
await nodefs;

import {openBasket} from '../basket/open.js';
import {referencing,dereferencing} from './pointers.js'

const ptk=await openBasket('openlit');  

const pointers=await referencing({p:'6/3',y:1,x:5,w:8},ptk);
console.log(pointers)