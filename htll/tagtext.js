/*
   tag :  <any_thing_but_&lt;>
   text : any_thing_outside_tag

   /n as line break
*/
import {readFileSync} from 'fs'
import { parseAttr } from '../utils/argument.js';
export const fileContent=(fn,format='utf8')=>{
   let c=readFileSync(fn,format).replace(/\r?\n/g,'\n');
   const bom=c.charCodeAt(0);
   if (bom===0xfeff || bom==0xffe) c=c.substr(1);
   return c;
}
export const fileLines=(fn,format='utf8')=>{
   const content=fileContent(fn,format);
   return content.split(/\n/g);
}
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
         const ele=at>0?raw.substr(0,at):raw.trim();
         const attrs=at>0?parseAttr(raw.substr(at+1)):null;
         li.tags.push({raw,ele,attrs,rawoffset,len:m.length});
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