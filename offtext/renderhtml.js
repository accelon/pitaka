import {ALLOW_EMPTY, ALWAYS_EMPTY,OffTag} from './def.js';
import {parseOfftextLine} from './parser.js'
import {toSim} from 'lossless-simplified-chinese'
function HTMLTag (pos,closing,name,attrs,width,tempclose=false) {
    return {
        pos,
        closing, //one-base to opening HTMLTag
        name,
        attrs,
        width,
        tempclose, // temporary closed, need to reopen on next span
    }
}
const toHtmlTag=(content,tags)=>{
    const T=[];
    tags.sort((a,b)=> (a.line==b.line)? ((a.pos==b.pos)?0:a.pos-b.pos) : (a.line-b.line)  );
    const lines=(typeof content=='string')?content.split(/\r?\n/):content;
    let offset=0;  //offset of content
    let ntag=0,tag=tags[ntag], tagcount=0;
    for (let i=0;i<lines.length;i++) {
        const line=lines[i];
        while (ntag<tags.length && tag) {
            let w=tag.width;
            if (tag.line!==i) break;           //tag beyond in this line

            if (w==0 && !ALLOW_EMPTY[tag.name]) w=line.length-tag.pos; // 從行末倒數

            T.push( new HTMLTag(offset+tag.pos,0,tag.name, tag.attrs,w) );  //open tag
            tagcount++;
            
            if (tag.name!=='r' && tag.name!=='br') {
                T.push( new HTMLTag(offset+tag.pos+w, tagcount ) ); // close after n characters
            }
            ntag++;
            tag=tags[ntag];
        }
        offset += lines[i].length+1; //width of \n
    }
    T.sort((a,b)=>{
        if (a.pos==b.pos && b.closing) {    //multiple closing tag at same position
            return b.closing-a.closing;     //closing the nearer tag
        } else return a.pos-b.pos;    //sort by offset
    })
    return T;
}
const htmlAttrs=attrs=>{
    if (!attrs)return '';
    let s='';
    for (let name in attrs) {
        let aname=name;
        if (name=='#') aname='id';
        if (name=='~') continue;
        s+=' '+aname+'="'+attrs[name]+'"';
    }
    return s;
}

const lastSpan=(T,activetags,idx,pos)=>{ //if last span of a tag, return -name
    const out=[];
    for (let j=0;j<activetags.length;j++) {
        const tag=T[activetags[j].i];
        const tagend=tag.pos+tag.width;
        let hasopentag=false;
        for (let i=idx;i<T.length;i++) {
            if (!T[i].closing) {
                hasopentag=true;
                break;
            }
            if (T[i].pos + T[i].width > tagend) break;
        }
        if (!hasopentag && tagend==pos && !activetags[j].closed) {
            out.push('-'+tag.name);
            activetags[j].closed=true;
            break;
        }
    }
    return out;
}
export const renderSnippet=(lines=[],tags=[])=>{
    const content=(typeof lines=='string')?lines:lines.join('\n');
    const T=toHtmlTag(content,tags);
    let out=[];
    let activetags=[];//active classes
    let prev=0, i=0;           //offtag index
    for(let idx=0;idx<T.length;idx++) { //idx=html tag index
        const {pos,closing,name,attrs,width} = T[idx];
        const s=content.substring(prev, pos);
        s&&out.push(s);
        if (name=='br'||name=='r') {
            out.push({empty:'br',i,attrs});
            prev=pos;
            continue;
        }
        if (closing) {
            out.push({i,closing:true});
            activetags=activetags.filter( c=>c.i!==closing-1);
            const clss=activetags.map(t=>t.name);
            clss.push( ... lastSpan(T,activetags,idx,pos) );
            if (clss.length) {
                out.push({clss});
            }
        } else {
            let clss=activetags.map(t=>t.name);
            if (clss.length) {
                out.push({closing:true});
            }
            clss.push(name);
            if (width) clss.push(name+'-'); //原始的標記位置，不是自動補上的

            if (width && !ALWAYS_EMPTY[name]) activetags.unshift( {i, idx,name,closed:false} );
            i++;
            out.push({i,clss,attrs});
        }
        prev=pos;
    }
    if (content.substr(prev)) out.push(content.substr(prev));
    
    i=0;
    const units=[]; //  單純字串  或 <tag>, 字串, </tag> 
    while (i<out.length) {
        if (typeof out[i]=='string') {
            units.push([out[i]]);
            i++;
        } else {
            const unit=[];
            let innertext='';
            unit[1]=out[i];i++;
            while (typeof out[i]=='string' || out[i].empty) {
                const emptytag=out[i].empty?('<'+out[i].empty+(open.i?' i="'+i+'" ':'')+htmlAttrs(open.attrs)+'/>'):'';
                innertext+=emptytag||out[i];
                i++;
            }
            unit[2]=out[i];i++;
            unit[0]=innertext;
            units.push(unit);
        }
    }
    return units;
}
export const composeSnippet=(snippet,sim=0)=>{
    const [innertext,open,close]=snippet;
    let out='';
    if (open && !close) {
        out+='<'+open.empty+(open.i?' i="'+i+'" ':'')+htmlAttrs(open.attrs)+'/>';
    } else {
        if (!open) out+=innertext;
        else out+=
        '<t'+ htmlAttrs(open.attrs)
                +(open.clss&&open.clss.length?' class="'+open.clss.join(' ')+'"':'')
                +(open.i?' i="'+open.i+'" ':'')
                +'>'
        +toSim(innertext,sim)
        +'</t'+(close.i?' i="'+close.i+'" ':'')+'>';
    }
    return out;
}
export const snippetsToHTML=(snippets,sim=0)=>{
    let out='';
    for (let i=0;i<snippets.length;i++) {
        out+=composeSnippet(snippets[i],sim);
    }
    return out;
}
export const renderHTML=(lines,tags=[],opts={})=>{
    const sim=opts.sim;
    const snippets=renderSnippet(lines,tags);
    return snippetsToHTML(snippets,sim);
}

export const OfftextToSnippet =(linetext , extra=[] , renderInlinetag=true)=>{
    if (!linetext)return[];
    const hastag=linetext.includes('^');
    
    if (extra[0]==extra[1]) extra[0]=''
    let tags=[],text=linetext;
    if (hastag && renderInlinetag) [text,tags]=parseOfftextLine(linetext);

    for (let i=0;i<extra.length;i++) {
        if (typeof extra[i]==='string' && extra[i].trim()) {
            const keywords=extra[i].split(/ +/).filter(i=>!!i.trim());
            for (let j=0;j<keywords.length;j++) {
                const keyword=keywords[j];
                const regex=new RegExp(keyword,'g');
                text.replace(regex,(m,offset)=>{
                   tags.push(new OffTag('hl'+i, null, 0, offset, m.length) );
                })
            }
        } else if (extra[i][1]){
            tags.push(new OffTag('hl'+i, null, 0, extra[i][0], extra[i][1]) );
        }
    }
    const snippets= renderSnippet(text,tags);
    return snippets;
}

export const OfftextToHtml=(linetext , extra , renderInlinetag=false,sim=0)=>{
    if (!hastag && extra.filter(it=>!!it.trim()).length==0 )return toSim(linetext,sim);
    const snippets=OfftextToSnippet(linetext,extra,renderInlinetag);
    
    return snippetsToHTML(snippets,sim);
}