export default {
    "labels":{
            "bk":{"caption":"書名"}, 
           "ck":{"caption":"章名","named":true,"sequencial":true,"reset":"bk"},
    },
    //default value, set in pitaka.json to overwrite
    "chunk":"ck",      // 瀏覽分頁單元
    "locator":"bk.ck",  // 定位方式：冊.段
    "heading":"bk",    //標題
    "rootdir":"off/", //source offtext folder
    "license":"CC0",  //版權 creative common zero
    "fulltextsearch":true, //for faster build , 不產生全文索引
}