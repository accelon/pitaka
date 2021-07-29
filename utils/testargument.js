import { parseArg,parseAttr } from "./argument.js";
let pass=0,test=0;


let {$,_,S} =parseArg('bk_idS2');
pass+=$=='bk'; test++;
pass+=_=='id'; test++;
pass+=S=='2'; test++;

({$,_,S} = parseArg('書名_段名S段號'))
pass+=$=='書名'; test++;
pass+=_=='段名'; test++;
pass+=S=='段號'; test++;

const attrs=parseAttr('scope="yi" uid="H2"');
pass+=attrs.scope=='yi'; test++;
pass+=attrs.uid=='H2'; test++;

console.log(`pass ${pass} total:${test}`);
if (pass!==test) throw "not passed!"