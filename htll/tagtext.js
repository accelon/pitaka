/*
   tag :  <any_thing_but_&lt;>
   text : any_thing_outside_tag

   /n as line break
*/


import { parseAttr } from '../utils/argument.js';


export const scanTag=(t,cb)=>{
   let i=0,lineNumber=0;
   while (i<t.length) {
      let lc=0;
      const start=i;
      if (t[i]==='<') {
         while (i<t.length && t[i]!=='>') {
            if (t[i]=='\n') lc++;
            i++;
         }
         if (t[i]==='>') {
            cb(t.substring(start,i+1),{offset:start,lineNumber:lineNumber+lc});
         }
      } else {
         while (i<t.length && t[i]!=='<') {
            if (t[i]=='\n') lc++;
            i++;
         }
         cb(t.substring(start,i), {offset:start,lineNumber:lineNumber+lc});
      }
      lineNumber+=lc;
   }

   if (t[t.length-1]!='\n') lineNumber++; // EOF as a linne
   return lineNumber;
}


export const scanLine=(arr,cb)=> {
   const li={tags:[]};
   for (let i=0;i<arr.length;i++) {
      const t=arr[i];
      li.tags=[];
      t.replace(/<(.+?)>/g,(m,raw,rawoffset)=>{
         const at=raw.indexOf(' ');
         let ele=at>0?raw.substr(0,at):raw.trim();
         if (ele.match(/[^a-z_!\d\/]/i)) {
            throw 'invalid element '+ele
         }
         let closing=false;
         if (ele[0]=='/') {
            ele=ele.substr(1)
            closing=true;
         }
         const attrs=at>0?parseAttr(raw.substr(at+1)):null;
         li.tags.push({raw,ele,attrs,rawoffset,len:m.length,closing});
      });
      cb(li,i,arr);
   }
}

export const convertLine=(arr,cb)=>{
   const out=[];
   scanLine(arr,(li,idx)=>{
      let s='',prev=0;  
      const text=arr[idx];
      cb(li,idx);
      for (let i=0;i<li.tags.length;i++) {
         const {raw,rawoffset,len,remove}=li.tags[i];
         s+=text.substring(prev,rawoffset);
         li.tags[i].offset=s.length;
         if (!remove) s+='<'+raw+'>';
         prev=rawoffset+len;
      }
      s+=text.substring(prev);
      out.push(s);
   });
   return out;
}