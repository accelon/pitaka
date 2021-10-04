class Label {
    constructor(name,opts={}) {
        this.cb=opts.cb;
        this.log=opts.log||console.log;
        this.name=name;
        this.scope='';
        this.filename='';
        this.lastLine=opts.lastLine||-1;
        return this;
    }
    action(){
        console.error('not implemented')
    }
    find(){
        
    }
    serialize(){
        return [];
    }
    fileDone() { //file completed

    }
    locate(nline){
        //give human readible expression        
    }
    parse(str,basket){
        //parse address and produce action line position for reading
    }
    finalize() { //build complete

    }
}
export default Label;