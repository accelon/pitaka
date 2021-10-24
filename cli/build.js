import {Builder} from 'pitaka/basket'
import {filesFromStringPattern} from 'pitaka/utils'
import kluer from './kluer.js'
const {yellow,red} = kluer;
import {existsSync,readFileSync} from 'fs'
import JSZip from 'jszip';
global.JSZip=JSZip; //for ZipSaver

export const indexHTMLFiles=(indexhtm='index.htm')=>{
    if (!existsSync(indexhtm)) {
      console.log(red('missing'),indexhtm)
      return;
  }
  const files=[];
  const content=readFileSync(indexhtm,'utf8');
  const m_title=content.match(/<title>([^<]+?)<\/title>/);
  const m_h1=content.match(/<h1>([^<]+?)<\/h1>/);

  const title=(m_title?m_title[1].trim():m_h1[1].trim())||"無名";
  
  content.replace(/<a href=([^"'\.-][a-z\d\\.]+\.html?)>/g,(m,fn)=>{
      if (fn==indexhtm) return;
      files.push(fn);
  })
  return [files,title];
}
export const getWorkingDirectory=()=>{
    let name=process.cwd();
    const m=name.match(/[\\\/\-\.]([a-z\d]+)$/i);
    return m[1].toLowerCase();
}
export const  buildPitaka=async ({config, nosave=false,
    onContent=null,raw,jsonp,
    PickedFiles=null , log=console.log})=>{
    let {name,files,title,format}=config;

	if (!name) name=getWorkingDirectory();
    if (!files) [files,title]=indexHTMLFiles();
    
    const builder=new Builder({name,title,config,onContent}); //core chinese text

    if (typeof files=='string') {
        files=filesFromStringPattern(files,config.rootdir);
    }
    builder.files=files;

    for (let i=0;i<files.length;i++){ 
        await builder.addFile(files[i],format);
    }
    builder.finalize();

    if (!nosave) builder.save({raw,jsonp});
    return builder;
}