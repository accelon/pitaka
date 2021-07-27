# pitaka
Backend for progressive corpus

## 分散式 JSONP
1. 大約每256KB一個js 檔，file:// 也可以隨需讀取
2. 未來再考慮包成單一檔案。
3. 最多分成 999 個檔。檔頭為000.js，其他檔名為 001.js ~ 999.js 

## 位址語法
basket@volume_[i行號][j字序]       //從頭起算

basket@volume_chunkid[i行號][j字序]  //從段起算

## 文件進化階段
1. 讀取：多個純文字檔（不限格式）合併成一大文件(basket)，只能以絕對行號取得內容。
    - 檔頭：版本、總行數、每個jsonp的起始行陣列。
2. 分段：以RegExpr 定義書(volume)及段(chunk)標示。
    - chunk id 由數字英文大寫字母組成，不能重覆，必要。記錄chunk id 所在行。
    - chunk name 可以命名為任何文字，非必要。

3. 目錄：定義標題及階層關係
4. 互文：內嵌標記外部化。
    - 夾注、腳注、外注
    - 校勘
5. 全文索引。
