# Pitaka Database Engine
* Backend and CLI of Accelon21
* Accelon21 後端引擎及製作資料庫的工具

## 功能

* 純 EMCAScript 全文資料庫引擎，不依賴 filesystem API。
* 不依賴 http ，可使用 file:// 協議。單機端不必運行服務器。
* 運行於 https 服務器，支持 Progressive Web Application 離線使用。

## 警告

* 本說明文件滯後於源代碼，欲製作 pitaka 資料庫的朋友請與作者連繫。
* 不經常更新 npm.org 版本

## install 

`npm -g install` 或 clone repo ，再從git repo安裝 cli， `npm -g install .`

## usage
* need pitaka.json in working folder
* list all available commands

    `pitaka`

* build a "pitaka"
    
    `pitaka build`


* example json file
https://github.com/accelon/sc/blob/main/pitaka.json

## 架構

* 來源不同的數據以不同的repo管理，一律轉換成offtext格式（詳見 https://github.com/accelon/cs ）。
* `pitaka build` 產生pitaka數據庫
* [前端程式](https://github.com/accelon/accelon2021) 消費pitaka數據庫（不必發布offtext源文件）。
* [Offtext 標記格式](offtext.md) 

## pitaka 數據庫

* 唯讀式
* 前端無須安裝任何軟件，直接打開 html 即可（不依賴http協議）。
* 數據庫包含了正文(從多個offtext文件合併)、標題清單、標記群、注釋群、反向索引(非必要)。
* 每個數據庫一個文件夾，分成若干個js(數據塊) ，000.js 為metadata ，001.js 之後大小相近，最多999.js。每個js約 128K 個字符。
* 000.js 記錄每個數據塊的起始行(chunkStarts)，以及 pitaka.json 。
* 載入內存的最小單元是數據塊。換言之，即使只要求一行文字，也會載入該行所在的數據塊。

