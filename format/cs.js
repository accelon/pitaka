export default {
    labels:{
        'bk':['LabelBook',{}],
        'c':['LabelChapter',{reset:"bk"}],
        'r':['LabelChapter',{reset:"bk"}], //new name reading
        'n':['LabelMilestone',{sequencial:true,range:true,reset:"bk"}],
        'b':'Label', //bold
        'h':'Label', //generic header
        "f":"Label",
        "v":"Label", //to be remove
        "sz":"Label",
        "fn":["LabelFootnote", {"caption":"注釋"}],
    
    },
    //default value, set in pitaka.json to overwrite
    "cluster":"c",
    "alignment":"cs",
    "locator":"bk.n",
    "heading":"c",
    "rootdir":"off/",
    "license":"CC0",
    "textOnly":true, //for faster build
}