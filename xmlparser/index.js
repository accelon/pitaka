import Sax from './sax.js'
import Element from './element.js'

const DOMFromString=(str,debug)=>{
    let tree;
    let el;
    const startElement=(name,attrs)=>{
        const child = new Element(name, attrs);
        el = !el ? child : el.cnode(child);
    }
    const endElement=name=>{
        if (name === el.name) {
            if (el.parent) {
              el = el.parent;
            } else if (!tree) {
              tree = el;
              el = undefined;
            }
        }
    }
    const onText=text=>{
        if (el) el.t(text);
    }
    const sax=new Sax({startElement,endElement,onText});

    sax.write(str);
    return tree;
}
function JSONify(el) {
    if (typeof el !== "object") return el;
    return {
      name: el.name,
      attrs: el.attrs,
      children: el.children.map(JSONify),
    };
}
const xpath=(root,p)=>{
    const paths=p.split('/');
    if (!root.children) return null;
    let found,el,children=root.children;
    for (let i=0;i<paths.length;i++) {
        for (let j=0;j<children.length;j++) {
            found=false;
            if (children[j].name===paths[i]) {
                el=children[j];
                children=children[j].children;
                found=true;
                break;
            }
        }
        if (!found) return null;
    }
    return el;
}
const walkDOM=(el,teictx,onOpen={},onClose={},onText=null)=>{
    onText=onText||teictx.onText;
    if (typeof el==='string') return onText?onText(el,teictx):el;
    let out='';
    const openhandler= onOpen[el.name] || onOpen["*"];
    if (openhandler) {
        const out2 = openhandler(el,teictx);
        if (typeof out2=='string') out=out2;
    }
    if (el.children && el.children.length) {
        out+=el.children.map(e=>walkDOM(e,teictx,onOpen,onClose,onText)).join('');
    }
    const closehandler= onClose[el.name] || onClose["*"];
    if (closehandler) out+=closehandler(el,teictx)||'';    
    return out;
}
const onOfftext=(el,teictx,onText)=>{
    onText=onText||teictx.onText;
    let s=el;
    // if (teictx.trimRight) s=s.trimRight();
    if (teictx.hide || teictx.delete) { 
        teictx.delete=false;
        return '';
    }
    if (teictx.compact && s.charCodeAt(0)<0x7f) { // a compact offtag is emitted just now
        s=' '+s;                               // use blank to separate tag ]
        teictx.compact=false;
    }
    if (s) teictx.snippet=s;
    if (onText) {
        return onText(el,teictx,teictx.started?s:'');
    } else {
        return teictx.started?s:'';
    }
}
const walkDOMOfftext = (el,teictx,onOpen={},onClose={}) =>{
    /* helper for emiting offtext format*/
    return walkDOM(el,teictx,onOpen,onClose, onOfftext );
}


export {Sax,JSONify,DOMFromString,xpath,walkDOM,walkDOMOfftext,onOfftext};