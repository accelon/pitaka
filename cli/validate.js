/* check if the tag is balance , and warn for null tag*/

import { readdirSync,readFileSync } from "fs";
let allownulltag=true;
//need <meta http-equiv=Content-Type content="text/xhtml; charset=utf8">

 const filename=process.argv[3];

export default function(){
    const files=filename?[filename]:readdirSync('.');
    let totalerror=0;
    const checkxml=(content,fn,lineoffset)=>{
        let error=0;
        const lines=content.split(/\r?\n/);
        const tagstack=[];
        lines.forEach((line,idx)=>{
            const nline=idx+1+lineoffset;
            line.replace(/<([^>]+)>/g,(m,tag)=>{
                if (tag[tag.length-1]=='/') {
                	if (!allownulltag) {
                		console.log('cannot have null tag, line:',nline,'file',fn)
                    	error++;
                    }
                    return;
                }
                
                const at=tag.indexOf(' ');
                const tagname=(at>-1)?tag.substring(0,at):tag;
                if (tagname[0]!=='/') {
                	if (tagname=='p' && tagstack.length&&tagstack[tagstack.length-1][0]=='p') {
                		console.log("nested p",nline);
                		error++;
                	} else {
    	                tagstack.push([tagname,idx ]);
	                }
                } else {
                	
                    if (!tagstack[tagstack.length-1]) {
                        console.log('closing tag without opening',tagname,'line',nline);
                        error++;
                        return;
                    }
                    if (tagstack[tagstack.length-1][0] !== tagname.substring(1)) {
                        console.log('unmatched tag',tagname,'line',nline,'open tag',tagstack[tagstack.length-1])
                            error++;
                    }
                    tagstack.pop();
                }
            })
        })
        if (error) console.log('file',fn,'has',error,'errors','\n');
        totalerror+=error;
    }

    files.forEach(file=>{
        if (file.indexOf('.htm')==-1) return;
        if (file==='index.htm' || file==='index.html')return;
        const content=readFileSync(file,'utf8');
        let start=content.indexOf('<htll');
        if (start==-1)start=content.indexOf('<xml');
        
        let end=content.indexOf('</htll>');
        if (end==-1) end=content.indexOf('</xml>');
        
        if ((start==-1 || end==-1) ) {
            console.log('not enclosed by <htll> or <xml',file)
            return;
        }
        // if (content.indexOf('<xml')>-1) allownulltag=true;
        let lineoffset=0;
        for (let i=0;i<start;i++) if (content[i]=='\n') lineoffset++;
        checkxml( content.substring(start,end+6),file,lineoffset);
    })
        
    console.log(files.length,'files checked','error',totalerror);
    if (!totalerror) console.log('congratulation! all files are clean.');
}