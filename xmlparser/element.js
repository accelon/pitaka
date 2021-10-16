class Element {
    constructor(name, attrs) {
      this.name = name;
      this.parent = null;
      this.children = [];
      this.attrs = {};
      this.setAttrs(attrs);
    }
    setAttrs(attrs) {
        if (typeof attrs === "string") {
          this.attrs.xmlns = attrs;
        } else if (attrs) {
          Object.assign(this.attrs, attrs);
        }
    }
    c(name, attrs) {
        return this.cnode(new Element(name, attrs));
    }
    cnode(child) {
        this.children.push(child);
        if (typeof child === "object") {
          child.parent = this;
        }
        return child;
    }
    t(text) {
        this.children.push(text);
        return this;
    }
    innerText(trim=false,skip={}) {
        let s='';
        // if (level<1) return '';
        for (let i=0;i<this.children.length;i++) {
            if (typeof this.children[i]==='string') {
                const t=this.children[i];
                s+=trim?t.trim():t;
            } else {
                const t=this.children[i].innerText(trim);
                s+=trim?t.trim():t;
            }
        }
        return s;
    }
}
export default Element;