import TDenList from './denlist.js';
let tests=0,passes=0;

const str='^n3Namo tassa ^a^b^i[zh=如來 bhagavato] arahato^c7^d8 sammāsambuddhassa nikāyo';
const vri=new TDenList(str,{akey:'vri',markup:'offtext',lang:'iast'});

// console.log(vri.data)
const str2=vri.serialize();
console.log(str)
console.log(str2)
// console.log(vri.data)

tests++; if (str==str2) passes++;

console.log('tests',tests,'passes',passes)