import Sax from './sax.js'
import Element from './element.js'

const DOMFromString=str=>{
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

const XML2OffText = (el,teictx,H={},CH={}) =>{
    if (typeof el=='string') {                     // a string node arrives
        let s=el.trimRight();
        if (teictx.hide) {
            if (teictx.compact) {
                teictx.compact=false;
                return ' ';
            }
            return '';
        }

        if (teictx.compact && s.charCodeAt(0)<0x7f) { // a compact offtag is emitted just now
            s=' '+s;                               // use blank to separate tag ]
            teictx.compact=false;
        }
        if (s) teictx.snippet=s;
        return teictx.started?s:'';
    }
    let out='';
    const handler= H[el.name] || H["*"];
    if (handler) {
        const out2 = handler(el,teictx);
        if (typeof out2=='string') out=out2;
    }

    if (el.children && el.children.length) {
        out+=el.children.map(e=>XML2OffText(e,teictx,H,CH)).join('');
    }

    if (CH) {
        const closehandler= CH[el.name] || CH["*"];
        if (closehandler) out+=closehandler(el,teictx)||'';    
    }
    return out;
}
export {DOMFromString,JSONify,xpath,Sax,XML2OffText};