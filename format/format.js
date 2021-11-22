import lit from './lit.js';
import cbeta from './cbeta.js';
import cidian from './cidian.js';
import haodoo from './haodoo.js';
import Formatter from '../offtext/formatter.js'; //default formatter
import { DEFAULT_TREE } from '../platform/constants.js';


const formats={
    haodoo,     //好讀
    lit,    //開放文學
    cidian,     //一般辭典格式
    cbeta,      //CBETA TEI p5
}

export const getFormat=format=>{
    const F=formats[format];
    return Object.assign({tree:DEFAULT_TREE,Formatter},F);
}

