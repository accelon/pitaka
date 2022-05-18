import {alphabetically} from '../utils/sortedarray.js';
import {bsearch} from '../utils/bsearch.js';
//one character word is skipped
const stopwords='the,this,these,must,we,them,out,of,is,but,or,with,to,by,on,he,it,for,an,not,as,if,his,her,she,can,do,also,than,then,have,has,had,at,they,from,will,no,so,in,all,that,be,been,between,only,was,were,us,up,while,more,very,some,other,such,which,under,against,what,who,why,would,their,and,are,our,over,its,'.split(',').sort(alphabetically);

export const isStopword=str=>bsearch(stopwords,str)>-1;