const input=`TABLE
0,1
"EXCEL"
VECTORS
0,2
""
TUPLES
0,2
""
DATA
0,0
""
-1,0
BOT
1,0
"a
1"
1,0
"b1"
-1,0
BOT
1,0
"a2"
1,0
"b2"
-1,0
EOD`.split(/\r?\n/)
import {fromDIF} from './dif.js'
let test=0,pass=0;
const out=fromDIF(input);
pass+=out[0][0]=='a\n1'?1:0;test++;
pass+=out[0][1]=='b1'?1:0;test++;
pass+=out[1][0]=='a2'?1:0;test++;
pass+=out[1][1]=='b2'?1:0;test++;

console.log('test',test,'pass',pass)