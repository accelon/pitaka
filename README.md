# Pitaka
BackEnd and CLI of Accelon2021
Accelon2021 後端引擎及製作資料庫的工具

## install 

    npm -g install


## usage
need pitaka.json in working folder

list all available commands

    pitaka

build a "pitaka"
    
    pitaka build


example json file
https://github.com/accelon/sc/blob/main/pitaka.json

## 架構

* 來源不同的數據以不同的repo管理，一律轉換成offtext格式（詳見 https://github.com/accelon/cs ）。
* `pitaka build` 產生pitaka數據庫
* [前端程式](https://github.com/accelon/accelon2021) 消費pitaka數據庫（不必發布offtext源文件）。 

## pitaka 數據庫

* 唯讀式
* 前端無須安裝任何軟件，直接打開 html 即可（不依賴http協議）。
* 數據庫包含了正文(從多個offtext文件合併)、標題清單、標記群、注釋群、反向索引(非必要)。
* 每個數據庫一個文件夾，分成若干個js(數據塊) ，000.js 為metadata ，001.js 之後大小相近，最多999.js。每個js約 128K 個字符。
* 000.js 記錄每個數據塊的起始行(chunkStarts)，以及 pitaka.json 。
* 載入內存的最小單元是數據塊。換言之，即使只要求一行文字，也會載入該行所在的數據塊。讀兩行文字，最糟的情況是載入兩個數據塊（第一行在上一數據塊的最後一行，第二行在這個數據塊的第一行）。


## offtext 標記格式

* 容易剖析及轉換成其他格式。
* 從純文本開始，只標記必要的結構支撐信息。
* 在內存表現為字符串陣列，而非XML複雜的樹狀結構。
* 非結構信息盡量外部化（從底文剝離）。（如腳注、紙本頁碼、科判、異讀、校勘等等）
* offtext將複雜的TEI/XML分隔成多個「文層」。
* 以底文為基礎、不同使用者的批注、校釋等等可分層處理及編輯，不相互干擾。
  就像標注於透明薄片再疊在地圖上（而非直接修改底圖）。
  換言之，offtext 是類似 Adobe Photoshop 多圖層格式，
  而TEI/XML就像所有編輯操作都攪在一起的 bitmap/png 格式。

標記以 ^ 開頭，標記名稱必須英文小寫，且在一行內結束。標記正則表達式見 offtext/def.js

只有 簡單id 或 地址 的標記。
    ^標記名稱#簡單id                       //  id 必須是 a-z (小寫) ，數字 或 _ - . 
    ^標記名稱數字起頭的id                   //  id 以數字起頭，則 # 可省略 ，例:  ^f7   (id為"7"的注腳)
    ^標記名稱@地址                         //  地址 必須是 a-z (小寫) ，數字 或 _ - . :

帶屬性陣列的標記：

    ^標記名稱[屬性=值]                      // 帶屬性的標記，多組以空格隔開，值的雙引號可省略
    ^標記名稱[屬性=值 屬性="帶 空格 的值"]    // 有空格的值必須有雙引號
    ^標記名稱[包夾文字]                     // 包夾文字的標記  例：^b[加粗的文字]
    ^標記名稱[屬性=值 包夾文字]              // 帶屬性及包夾文字，例： ^a[@=dn2.372 大念住經]


屬性名稱可以是任意英文(大小寫皆可)及中文，特殊的屬性名稱有兩個：# 及 @
    ^f7 為 ^f[#=7] 之簡寫 ，^f[#=可以帶中文及大寫英文字母的id] 不能簡寫
    ^t@dn1.1 為 ^t[@=dn1.1] 之簡寫

## 基本標記

    ^bk     書名 (冊名)
    ^ck     瀏覽單元
    ^n      段落，可帶數字 如 ^n272 ，^n851-860 (連號)


## 瀏覽單元 (chunk)

    ^ck 定義分卷，即網頁捲動的的範圍，長部及中部一經一chunk，相經部及增支部一個vagga一chunk，約十經左右。
    清淨道論一章一chunk。

## pin 文釘 ：
//前釘，定位斷句

    abc       首個"abc"出現的位置
    abc:2     第三個"abc"的位置
    
//後訂，定位腳注

    :abc      首個"abc"出現的位置加 "abc"的長度
    2:abc     第三個"abc"出現的位置加 "abc"的長度
    
