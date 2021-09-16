import {LabelType} from 'pitaka/htll'
import {Builder} from 'pitaka/basket'
import kluer from './kluer.js'
const {blue,yellow,red,bgGreen} = kluer;
import {existsSync,readFileSync} from 'fs'
import { ROMEXT } from '../rom/romconst.js';
const report=(builder,files)=>{
    const out=[], maxshow=5;
    if (builder.romfile) out.push(yellow(' romfile   :')+builder.rom.header.name+ROMEXT);
    else out.push(yellow(' folder    :')+builder.rom.header.name);
    const showfile=files.slice(0,maxshow);
    out.push(' '+yellow((files.length+' files').padEnd(10,' ')+':')
      +showfile.join(',')
      +(files.length>maxshow?'...':''));
    out.push(yellow(' last line :')+builder.rom.header.lineCount);
    out.push(yellow(' max chunk :')+builder.rom.header.chunkStarts.length.toString().padStart(3,'0')+'.js');
    out.push(yellow(' build time:')+builder.rom.header.buildtime);
    
    return out.join('\n');
}

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
export const getWorkingPitakaName=()=>{
    let name=process.cwd();
    const m=name.match(/[\\\/\-\.]([a-z\d]+)$/i);
    return m[1].toLowerCase();
}
export const buildPitaka=({name,title,files,rom}={})=>{
	if (!name) name=getWorkingPitakaName();
    if (!files) [files,title]=indexHTMLFiles();

    const builder=new Builder({name,title,rom}); //core chinese text
    builder.defineLabel('anchor',LabelType.LabelAnchor); //超連結
    builder.defineLabel('sections',LabelType.LabelHeader); //書-章回(序號) 結構
    files.forEach(fn=>builder.addFile(fn))
    builder.finalize();
    
    return report(builder,files);
}


