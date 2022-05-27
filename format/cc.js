export default {
    "labels":{
            "bk":{"caption":"書名"}, 
           "ck":{"caption":"篇名","named":true,"sequencial":true,"reset":"bk","criterion":"substring"},
 	       "ad":{"caption":"公元","criterion":"double_number"},
            "f":{"type":"LabelMilestone","sequencial":true,"reset":"ck"}, // if link is true, skip sequencial checking
            "fn":{"type":"LabelMilestone","sequencial":true,"reset":"ck"},
            "z":{"type":"LabelMulu"},
            "li":{"type":"Label"},
    },
    //default value, set in pitaka.json to overwrite
    "chunk":"ck",      // 瀏覽分頁單元
    "alignment":"cc",  // 對齊方式 
    "locator":"bk.ck",  // 定位方式：冊.段
    "heading":"ck",    //標題
    "rootdir":"off/", //source offtext folder
    "license":"CC0",  //版權 creative common zero
    "fulltextsearch":true, //for faster build , 不產生全文索引
}