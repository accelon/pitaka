import {styledNumber ,foreignNumber} from './cnumber.js';
let pass=0,test=0;

styledNumber(2,'①')=='②'?pass++:0;test++;
styledNumber(21,'①')=='21'?pass++:0;test++;

styledNumber(20,'⑴')=='⒇'?pass++:0;test++;
styledNumber(21,'⑴')=='21'?pass++:0;test++; //fall back

styledNumber(20,'⒈')=='⒛'?pass++:0;test++;
styledNumber(21,'⒈')=='21'?pass++:0;test++; //fall back

styledNumber(10,'⓵')=='⓾'?pass++:0;test++;
styledNumber(11,'⓵')=='11'?pass++:0;test++; //fall back

styledNumber(11,'⓫',11)=='⓫'?pass++:0;test++;
styledNumber(20,'⓫',11)=='⓴'?pass++:0;test++; //fall back
styledNumber(21,'⓫',11)=='21'?pass++:0;test++; //fall back


styledNumber(10,'㈠')=='㈩'?pass++:0;test++;
styledNumber(11,'㈠')=='11'?pass++:0;test++; //fall back

styledNumber(10,'㊀')=='㊉'?pass++:0;test++;
styledNumber(11,'㊀')=='11'?pass++:0;test++; //fall back

styledNumber(12,'㋀')=='㋋'?pass++:0;test++;
styledNumber(13,'㋀')=='13'?pass++:0;test++; //fall back

styledNumber(0,'㍘',0)=='㍘'?pass++:0;test++;
styledNumber(24,'㍙')=='㍰'?pass++:0;test++;
styledNumber(25,'㍙')=='25'?pass++:0;test++;


styledNumber(31,'㏠')=='㏾'?pass++:0;test++;
styledNumber(32,'㏠')=='32'?pass++:0;test++; //fall back


styledNumber(21,'㉑',21)=='㉑'?pass++:0;test++;
styledNumber(35,'㉑',21)=='㉟'?pass++:0;test++;
styledNumber(36,'㉑',21)=='36'?pass++:0;test++; //fall back

styledNumber(31,'㏠')=='㏾'?pass++:0;test++;
styledNumber(32,'㏠')=='32'?pass++:0;test++; //fall back

styledNumber(1,'⒜')=='⒜'?pass++:0;test++;
styledNumber(26,'⒜')=='⒵'?pass++:0;test++;
styledNumber(27,'⒜')=='27'?pass++:0;test++;

styledNumber(1,'Ⓐ')=='Ⓐ'?pass++:0;test++;
styledNumber(26,'Ⓐ')=='Ⓩ'?pass++:0;test++;
styledNumber(27,'Ⓐ')=='27'?pass++:0;test++; 

styledNumber(1,'ⓐ')=='ⓐ'?pass++:0;test++;
styledNumber(26,'ⓐ')=='ⓩ'?pass++:0;test++;
styledNumber(27,'ⓐ')=='27'?pass++:0;test++; 


foreignNumber(1230,'x')=='1230'?pass++:0;test++; //not found  , fall back

foreignNumber(1230,'၀')=='၁၂၃၀'?pass++:0;test++;
foreignNumber(1230,'०')=='१२३०'?pass++:0;test++;
foreignNumber(1230,'໐')=='໑໒໓໐'?pass++:0;test++;
foreignNumber(1230,'๐')=='๑๒๓๐'?pass++:0;test++;
foreignNumber(1230,'០')=='១២៣០'?pass++:0;test++;
foreignNumber(1230,'༠')=='༡༢༣༠'?pass++:0;test++;

// ໐
// ၀၉
console.log('test',test,'pass',pass)
