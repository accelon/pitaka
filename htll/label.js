class Label {
    constructor(name,opts={}) {
        this.cb=opts.cb;
        this.name=name;
        this.lastLine=opts.lastLine||-1;
        return this;
    }
    action(){
        console.log('root class label has no action')
    }
    serialize(){

    }
}
export default Label;