import Label from './label.js'
class LabelParagraph extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        return this;
    }
    action( {tag ,nline,text}){
        // this.log('processing p')
    }
    serialize(){
    }
    deserialize(payload){

    }
    finalize() {
        this.log('finalize p')
    }
}

export default LabelParagraph;