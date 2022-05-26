import {nodefs} from 'pitaka/cli';
await nodefs;
import {openBasket} from 'pitaka'
import {parseQuery} from 'pitaka/search'
const ptk= await openBasket('pitaka');

await ptk.prefetchLines(0,100);
console.log(ptk.getLine(1));

const {names,linepos,idarr} =ptk.getHeadingLabel();
console.log(names,linepos);