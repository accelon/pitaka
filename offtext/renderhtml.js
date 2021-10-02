import {ALLOW_EMPTY, ALWAYS_EMPTY,OffTag} from './def.js';
import {parseOfftextLine} from './parser.js'

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

export const renderHTML=(lines,tags,opts={})=>{
    const content=(typeof lines=='string')?lines:lines.join('\n');
    const T=toHtmlTag(content,tags);
    let output='';
    let activetags=[];//active classes
    let prev=0, i=0;           //offtag index
    for(let idx=0;idx<T.length;idx++) { //idx=html tag index
        const {pos,closing,name,attrs,width} = T[idx];
        if (name=='br'||name=='r') {
            output+=content.substring(prev, pos)+'<br i='+i+htmlAttrs(attrs)+'>';
            prev=pos;
            continue;
        }
        if (closing) {
            output+=content.substring(prev, pos) +'</t '+closing+'>';
            activetags=activetags.filter( c=>c.i!==closing-1);
            const clss=activetags.map(t=>t.name);
            clss.push( ... lastSpan(T,activetags,idx,pos) );
            if (clss.length) output+='<t class="'+clss.join(" ").trim()+'">';
        } else {
            output+=content.substring(prev,pos);
            let clss=activetags.map(t=>t.name);
            if (clss.length) output+='</t>';
            clss.push(name);
            if (width) clss.push(name+'-'); //原始的標記位置，不是自動補上的

            if (width && !ALWAYS_EMPTY[name]) activetags.unshift( {i, idx,name,closed:false} );

            i++;
            output+='<t i='+i+' class="'+clss.join(' ').trim()+'"'+htmlAttrs(attrs)+'>';
        }
        prev=pos;
    }
    output+=content.substr(prev);
    return output;
}

//render a line with extra keywords ( string or [pos,width])
export const OfftextToHtml =(linetext , extra , renderInlinetag=false)=>{
    const hastag=linetext.includes('^');
    if (!hastag && extra.filter(it=>!!it.trim()).length==0 )return linetext;
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
    return renderHTML(text,tags);
}