import {tokenize} from './tokenizer.js';
let test=0,pass=0;

let r

r=tokenize('話說');
pass+=r.length==2?1:0;test++

r=tokenize('話說 ');  //blank after chinese create extra token
pass+=r.length==3?1:0;test++

r=tokenize('話說  天下');
pass+=r.length==5?1:0;test++

r=tokenize('話說eng天下');
pass+=r.length==5?1:0;test++

r=tokenize('孔𠀉子');
pass+=r.length==3?1:0;test++

r=tokenize('english word');  //one space will not create extra token
pass+=r.length==2?1:0;test++

r=tokenize('Sokāvatiṇṇaṃ jṭḍṣḷṃṇṅūāīḥ ');  //one space will not create extra token
pass+=r.length==2?1:0;test++


r=tokenize('english   word'); //more than one space will create more token 
pass+=r.length==3?1:0;test++

r=tokenize('english???word'); // punc create more token
pass+=r.length==3?1:0;test++

r=tokenize('123 456'); // numbers
pass+=r.length==2?1:0;test++

r=tokenize('123中456'); // numbers
pass+=r.length==3?1:0;test++

r=tokenize('a123 b456'); // alpha numeric
pass+=r.length==2?1:0;test++


r=tokenize('နမော တဿ ဘဂဝတော အရဟတော သမ္မာသမ္ဗုဒ္ဓဿ');
pass+=r.length==5?1:0;test++

r=tokenize('॥ नमो तस्स भगवतो अरहतो सम्मासम्बुद्धस्स॥');
pass+=r.length==7?1:0;test++

r=tokenize('（一九二五年十二月一日）')
pass+=r.length==12?1:0;test++

//let r=tokenize(' 話說 天下大勢，分久必合，abc合久必分。Sokāvatiṇṇaṃ janatamapetasoko;');
//console.log(r)

console.log('test',test,'pass',pass)