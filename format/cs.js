export default {
    labels:{
        'bk':{type:'LabelBook'},
        'ck':{type:'LabelChunk',reset:"bk"},//同一bk 內ck id 不重覆
        'n': {type:'LabelMilestone',sequencial:true,range:true,reset:"bk"}, //連號，可以有區間，同一bk內 n 號不重覆
        'b':'Label', //bold
        'h':'Label', //generic header，未處理的標題
        "f":"Label",  //腳注
        "v":"Label", //to be remove
        "sz":"Label", //偈
        "fn":{type:"LabelFootnote", "caption":"注釋"},
        "z": {type:"LabelMulu"}
    },
    //default value, set in pitaka.json to overwrite
    "chunk":"ck",      // 瀏覽分頁單元
    "alignment":"cs",  // 對齊方式 
    "locator":"bk.n",  // 定位方式：冊.段
    "heading":"ck",    //標題
    "rootdir":"off/", //source offtext folder
    "license":"CC0",  //版權 creative common zero
    "fulltextsearch":false, //for faster build , 不產生全文索引
}