export default {
    "labels":{
            "bk":{"caption":"書名"}, 
            "vol":{"type":"LabelMilestone","caption":"冊名","sequencial":true, "criterion":"range_multiple", "named":true},
           "ck":{"caption":"篇名","named":true,"sequencial":true,"reset":"bk","criterion":"substring"},
 	       "ad":{"caption":"公元","criterion":"double_number"},
            "intro":{"caption":"導讀"},
            "f":{"type":"LabelMilestone","sequencial":true,"reset":"ck"}, // if link is true, skip sequencial checking
            "fn":{"type":"LabelMilestone","sequencial":true,"reset":"ck"},
    },
    //default value, set in pitaka.json to overwrite
    "chunk":"ck",      // 瀏覽分頁單元
    "alignment":"cs",  // 對齊方式 
    "locator":"bk.ck",  // 定位方式：冊.段
    "heading":"ck",    //標題
    "rootdir":"off/", //source offtext folder
    "license":"CC0",  //版權 creative common zero
    "fulltextsearch":true, //for faster build , 不產生全文索引
}