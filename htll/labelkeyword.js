/* build attach keywords to book or chunk*/
import {pack,unpack} from'../utils/index.js';

export function addKeywords(self,name,keywords){ // keywords:[array of book id] from LabelKeyword 
    self.keywords[name]=[];
    for (let idx=0;idx<keywords.length;idx++) {
        const arrbk=keywords[idx][1];
        for (let i=0;i<arrbk.length;i++) {
            const nbk=parseInt(arrbk[i]);
            if (!self.keywords[name][nbk]) self.keywords[name][nbk]=[];
            self.keywords[name][nbk].push(idx);
        }
    }  
}
export  function deserialize_keywords(self){
    const keylabels=payload[at++].split('\t') ;payload[at-1]='';
    for (let i=0;i<keylabels.length;i++) {
        const arr=unpack(payload[at++])||[];payload[at-1]='';
        let out=[];
        let nbk=0,j=0;
        while (j<arr.length) {
            let int=arr[j];
            if (int===0) { //no keywords
            } else if (int<=options.maxkeyword) {
                out[nbk]=arr.slice(j+1,j+int+1);
                j+=int;
            } else {
                out[nbk]=int-options.maxkeyword-1;
            }
            nbk++;
            j++;
        }
        self.keywords[keylabels[i]]= out;
    }
}
export function serialize_keywords(self){
    const labelsout=[];
    const keylabels=Object.keys(self.keywords);
    //每本書最多有幾個keyword
    for (let i=0;i<keylabels.length;i++) {
        const keylabel=keylabels[i]
        const keywords=self.keywords[keylabel];
        for (let j=0;j<keywords.length;j++) {
            const keyidarr=keywords[j];
            if (keyidarr&&keyidarr.length>self._maxkeyword) {
                self._maxkeyword=keyidarr.length;
            }
        }
    }

    for (let i=0;i<keylabels.length;i++) {
        const keylabel=keylabels[i]
        const keywords=self.keywords[keylabel];
        const labelout=[];

        for (let j=0;j<keywords.length;j++) {
            const keyidarr=keywords[j];
            if (typeof keyidarr=='undefined') { //no keywords in this book
                labelout.push(0);               //separator
            } else {
                if (keyidarr.length==1) { //通常只有一個keyword，加上maxkeyword 
                    labelout.push(keyidarr[0]+self._maxkeyword+1)
                 } else if (keyidarr.length>1) {
                    labelout.push(keyidarr.length); //一本書多個keyword 情況
                    keyidarr.forEach(item=>labelout.push(item));
                } else {
                    throw "empty keyidarr "+keylabel;
                }
            }
        }
        labelsout.push(pack(labelout));
    }
    return {keylabels,labelsout};
}
