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

export {DOMFromString,JSONify,xpath,Sax};