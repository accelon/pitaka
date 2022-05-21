export default {
    labels:{
        'bk':{},
        'ck':{reset:"bk"},
        'n':{sequencial:true,range:true,reset:"bk"},
        'b':{}, //bold
        'h':{},//generic header
        "f":{},
        "v":{}, // volto be remove
        "sz":{},//stanza
        "fn":{"caption":"注釋","reset":"ck"},
        "cs":{"type":"LabelTransclusion","basket":"cs"},
        "z":{},
    },
    //default value, set in pitaka.json to overwrite
    "chunk":"ck",
    "locator":"bk.n",
    "heading":"ck",
    "rootdir":"off/",
    "license":"CC0",
    "fulltextsearch":false, //for faster build
}