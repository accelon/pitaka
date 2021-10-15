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
}
export default Element;