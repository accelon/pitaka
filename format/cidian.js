export default {
	"labels": {
		'bk':{type:'LabelBook'},
	    'e':{type:'LabelEntry',named:true,sorted:true,criterion:"entry"},
	    'y':{type:'Label',reset:'e'},
	    'eg':{type:'Label',reset:'y'},
	    'd':{type:'Label',reset:'y'},
	    'q':{type:'Label',reset:'y'},
	    't':{type:'LabelTransclusion'},
	    'se':{type:'Label'},
	    'en':{type:'Label'},
	   	'rem':{type:'Label'}, //remark
	    'cf':{type:'Label'}    //未定位的引
	},
    //default value, set in pitaka.json to overwrite
    "chunk":"e",      // 瀏覽分頁單元
    "locator":"e",  // 定位方式：冊.段
    "heading":"e",    //標題
    "rootdir":"off/", //source offtext folder
    "license":"CC0",  //版權 creative common zero
    "fulltextsearch":false, //for faster build , 不產生全文索引
};
