export default class HTLLField {
    constructor(opts) {
        let count=0;
        this.opts=opts||{};
        this._inc=()=>count++;    
        this._getcount=()=>count;
        return this;
    }
    pushCount() {
        return this._getcount();
    }
    push(){
        this._inc();
    }
    serialize(){
    }
    deserialize(){
    }
}