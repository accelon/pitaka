import {ALLOW_EMPTY, ALWAYS_EMPTY,OffTag} from './def.js';
import {parseOfftextLine} from './parser.js'
import {toSim} from 'lossless-simplified-chinese'
function HTMLTag (x,closing,name,attrs,y,w,tempclose=false) {
    return {
        x,       //offset from begining of line
        closing, //one-base to opening HTMLTag
        name,
        attrs,
        y,        //relative line index
        w,        //width
        tempclose, // temporary closed, need to reopen on next span
    }
}
const toHtmlTag=(content,tags)=>{
    const T=[];
    tags.sort((a,b)=> (a.line==b.line)? ((a.pos==b.pos)?0:a.pos-b.pos) : (a.line-b.line)  );
    const lines=(typeof content=='string')?content.split(/\r?\n/):content;
    let offset=0;  //offset of content
    let ntag=0,tag=tags[ntag], tagcount=0;
    for (let y=0;y<lines.length;y++) {
        const line=lines[y];
        while (ntag<tags.length && tag) {
            let w=tag.w;
            if (tag.y!==y) break;           //tag beyond in this line

            if (w==0 && !ALLOW_EMPTY[tag.name]) w=line.length-tag.x; // 從行末倒數

            T.push( new HTMLTag(offset+tag.x,0,tag.name, tag.attrs,y,w) );  //open tag
            tagcount++;
            
            if (tag.name!=='r' && tag.name!=='br') {
                T.push( new HTMLTag(offset+tag.x+w, tagcount ) ); // close after n characters
            }
            ntag++;
            tag=tags[ntag];
        }
        offset += lines[y].length+1; //width of \n
    }
    T.sort((a,b)=>{
        if (a.x==b.x && b.closing) {    //multiple closing tag at same position
            return b.closing-a.closing;     //closing the nearer tag
        } else return a.x-b.x;    //sort by offset
    })
    return T;
}
const htmlAttrs=attrs=>{
    if (!attrs)return '';
    let s='';
    for (let name in attrs) {
        let aname=name;
        if (name=='#') aname='id';
        if (name=='@') aname='hook'; //link
        if (name=='~') continue;
        s+=' '+aname+'="'+attrs[name]+'"';
    }
    return s;
}

const lastSpan=(T,activetags,idx,x)=>{ //if last span of a tag, return -name
    const out=[];
    for (let j=0;j<activetags.length;j++) {
        const tag=T[activetags[j].i];
        const tagend=tag.x+tag.w;
        let hasopentag=false;
        for (let i=idx;i<T.length;i++) {
            if (!T[i].closing) {
                hasopentag=true;
                break;
            }
            if (T[i].x + T[i].w > tagend) break;
        }
        if (tag.name=='t') debugger
        if (!hasopentag && tagend==x && !activetags[j].closed) {
            out.push('-'+tag.name);
            activetags[j].closed=true;
            break;
        }
    }
    return out;
}
export const renderSnippet=(lines=[],tags=[])=>{
    /*
    rendering unit= [ text_to_render, open_tag, close_tag ]
    */
    const content=(typeof lines=='string')?lines:lines.join('\n');
    const T=toHtmlTag(content,tags);
    let out=[];
    let activetags=[];//active classes
    let prev=0, i=0;           //offtag index
    for(let idx=0;idx<T.length;idx++) { //idx=html tag index
        const {x,closing,name,attrs,y,w} = T[idx];
        const s=content.substring(prev, x);
        s&&out.push([s,prev]);

        if (name=='br'||name=='r') {
            out.push({empty:name,i,attrs,x,y,extra:(name=='br'?' ':'')});
            prev=x;
            continue;
        }
        if (closing) {
            const {name}=activetags.filter( c=>c.i==closing-1)[0];
            out.push({i,closing:true, name }); //第i個tag關閉
            activetags=activetags.filter( c=>c.i!==closing-1);
            const clss=activetags.map(t=>t.name);
            clss.push( ... lastSpan(T,activetags,idx,x) );
            if (clss.length) {
                out.push({clss,x});
            }
        } else {
            let clss=activetags.map(t=>t.name);
            if (clss.length) {
                out.push({closing:true});
            }
            clss.push(name);
            if (w) clss.push(name+'-'); //原始的標記位置，不是自動補上的

            if (w && !ALWAYS_EMPTY[name]) activetags.unshift( {i, idx,name,closed:false} );
            i++;
            out.push({i,name,clss,attrs,x,y}); 
        }
        prev=x;
    }
    if (content.substr(prev)) out.push([content.substr(prev),prev]);
    
    let py=0;
    i=0;
    const units=[]; 
    while (i<out.length) {
        if (typeof out[i][0]=='string') {
            const [text,x]=out[i];
            units.push({ text,open:{x,y:py}, close:{closing:true} } ); 
            i++;
        } else {
            let text='';
            const open=out[i];i++;
            while (typeof out[i][0]=='string' || out[i].empty) {
                const emptytag=out[i].empty
                    ?(out[i].extra+'<'+out[i].empty
                        +(open.i?' i="'+i+'" ':'')
                        +'x="'+open.x+'" '+'y="'+open.y+'" '
                        +htmlAttrs(open.attrs)+'/>')
                    :'';
                py=open.y;
                text+=emptytag||out[i][0];
                i++;
            }
            const close=out[i];i++;
            units.push({text,open,close});
        }
    }
    return units;
}
export const composeSnippet=(snippet,lineidx,sim=0)=>{
    const {text,open,close}=snippet;
    let out='';
    if (open && open.empty) {
        out+=open.extra+'<'+open.empty+(open.i?' i="'+i+'" ':'')
            +'x="'+open.x+'" '+'y="'+(lineidx+open.y)+'" '+htmlAttrs(open.attrs)+'/>';
    } else {
        if (!open) out+=text;
        else out+=
        '<t'+ htmlAttrs(open.attrs)
                +(open.clss&&open.clss.length?' class="'+open.clss.join(' ')+'"':'')
                +' x="'+open.x+'"'+' y="'+(lineidx+open.y)+'"'
                +(open.i?' i="'+open.i+'" ':'')
                +'>'
        +toSim(text,sim)
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
    extra=extra.filter(i=>!!i);
    for (let i=0;i<extra.length;i++) {
        if (typeof extra[i]==='string' && extra[i].trim()) { //search keyword
            const keywords=extra[i].split(/ +/).filter(i=>!!i.trim());
            for (let j=0;j<keywords.length;j++) {
                const keyword=keywords[j];
                const regex=new RegExp(keyword,'g');
                text.replace(regex,(m,offset)=>{
                   tags.push(new OffTag('hl'+i, null, 0, offset, m.length) );
                })
            }
        } else if (extra[i].name) {//instance of offtag
            tags.push(extra[i]);
        } else if (extra[i][1]){ //highlight
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