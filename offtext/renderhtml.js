import {AUTO_TILL_END,ALWAYS_EMPTY,OffTag} from './def.js';
import {parseOfftextLine} from './parser.js'
import {offtext2indic} from 'provident-pali'
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
            if (w==0 && AUTO_TILL_END[tag.name]) w=line.length-tag.x; // 自動標記到行尾

            T.push( new HTMLTag(offset+tag.x,0,tag.name, tag.attrs,y,w) );  //open tag
            tagcount++;
            
            if (tag.name!=='r' && tag.name!=='br') { //closing a tag
                //y is needed at rendering phase.
                T.push( new HTMLTag(offset+tag.x+w, tagcount,tag.name, tag.attrs,y,w ) ); // close after n characters
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
const htmlAttrs=(attrs,sim=0)=>{
    if (!attrs)return '';
    let s='';
    for (let name in attrs) {
        let aname=name;
        if (name=='#') aname='n';
        else if (name=='@') aname='hook'; //link
        // else if (name=='id') aname='n';
        else if (name=='~') continue;
        const val=attrs[name];
        s+=' '+aname+'="'+((sim&&aname===name)?toSim(val):val)+'"';//do not convert @,#
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

        if (ALWAYS_EMPTY[name]) {
            out.push({empty:name,i,attrs,x,y,w,extra:(name=='br'?' ':'')});
            prev=x;
            continue;
        }
        if (closing) {
            const actives=activetags.filter( c=>c.i==closing-1);
            let name='';
            if (actives.length) {
                name=actives[0].name;
            }
            const openx=T[closing-1].x;
            if (name) out.push({i:closing,closing:true, name ,attrs}); //第i個tag關閉
            activetags=activetags.filter( c=>c.i!==closing-1);
            const clss=activetags.map(t=>t.name);
            clss.push( ... lastSpan(T,activetags,idx,x) );
            if (clss.length) {
                out.push({clss,attrs,x:openx,y,w});
            }
        } else {
            let clss=activetags.map(t=>t.name);
            if (clss.length) {
                out.push({attrs,closing:true}); //attrs is needed sometime
            }
            clss.push(name);
            if (w) clss.push(name+'-'); //原始的標記位置，不是自動補上的

            if (!ALWAYS_EMPTY[name]) activetags.unshift( {i,attrs, clss,idx,name,closed:false} );
            i++;
            out.push({i,name,clss,attrs,x,y,w}); 
        }
        prev=x;
    }
    if (content.substring(prev)) out.push([content.substring(prev),prev]);
    
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
            while (i<out.length && (typeof out[i][0]=='string' || out[i].empty)) {
                const emptytag=out[i].empty
                    ?(out[i].extra+'<'+out[i].empty
                        +(open.i?' i="'+i+'" ':'')
                        +' x="'+open.x+'" '+' y="'+open.y+'" '
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

export const composeSnippet=(snippet,lineidx,sim=0,script)=>{
    const {text,open,close}=snippet;
    let t=text, oritext='';
    if (script) {
        t=offtext2indic(text,script);
        if (t!==text) oritext=text;
    } else if (parseInt(sim)) t=toSim(text,sim);

    let out='';
    if (open && open.empty) {
        out+=open.extra+'<'+open.empty+(open.i?' i="'+open.i+'" ':'')
            +' x="'+open.x+'" '+' y="'+(lineidx+open.y)+'" '+htmlAttrs(open.attrs,sim)+'/>';
    } else {
        if (!open) out+=t;
        else out+=
        '<t'+ htmlAttrs(open.attrs,sim)
                +(open.clss&&open.clss.length?' class="'+open.clss.join(' ')+'"':'')
                +' x="'+open.x+'"'+' y="'+(lineidx+open.y)+'"'
                + (open.w?' w="'+(open.w)+'"':'')
                +(open.i?' i="'+open.i+'" ':'')
                +(oritext?' ori="'+oritext+'" ':'')
                +'>'
        +t
        +'</t'+(close&&close.i?' i="'+close.i+'" ':'')+'>';
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

export const OfftextToSnippet =(linetext , extra=[] , renderInlinetag=true, debug=false)=>{
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
    //會造成 pryt-zh:cma.104 塗色錯誤 ^cs@aas.104^n104 ^b[不善心] 
    //因為 ^b 的x 是0，w又比cs和n 大，會被移到前頭
    // tags.sort((a,b)=>a.x==b.x?b.w-a.w:a.x-b.x);  
    const snippets= renderSnippet(text,tags);
    return snippets;
}

export const OfftextToHtml=(linetext , extra , renderInlinetag=false,sim=0)=>{
    const hastag=linetext.includes('^');
    if (!hastag && extra.filter(it=>!!it.trim()).length==0 )return toSim(linetext,sim);
    const snippets=OfftextToSnippet(linetext,extra,renderInlinetag);
    
    return snippetsToHTML(snippets,sim);
}