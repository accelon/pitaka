export default {
    labels:{
        'bk':['LabelBook',{}],
        'ck':['LabelChunk',{reset:"bk"}],
        'n':['LabelMilestone',{sequencial:true,range:true,reset:"bk"}],
        'b':'Label', //bold
        'h':'Label', //generic header
        "f":"Label",
        "v":"Label", //to be remove
        "sz":"Label",
        "fn":["LabelFootnote", {"caption":"注釋"}],
        "cs":["LabelTransclusion",{"basket":"cs"}]
    },
    //default value, set in pitaka.json to overwrite
    "chunk":"ck",
    "locator":"bk.n",
    "heading":"ck",
    "rootdir":"off/",
    "license":"CC0",
    "textOnly":true, //for faster build
}