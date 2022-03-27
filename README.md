# Pitaka
BackEnd and CLI of Accelon2021
Accelon2021 後端引擎及製作資料庫的工具

# install 

    npm -g install


# usage
need pitaka.json in working folder

    pitaka

example json file
https://github.com/accelon/sc/blob/main/pitaka.json


## offtext 標記格式

設計理念：
    1. 用 regular expression 即簡易剖析
    2. 從純文本開始，只標記必要的結構支撐信息。
    3. 非必要的信息以「文釘」外部化。（如腳注、原書頁碼、校勘等等）
    4. 比XML易讀易用。


   ^標記名#id                   //  id 可以是 a-z (小寫) _ - .
   ^標記名數字id                 //  如果id 是數字，# 可省略 ，例:  ^f7    (注腳7)
   ^標記名[屬性=值]              // 帶值的標記，多組以空格隔開，值的雙引號可省略
   ^標記名[屬性=值 屬性="帶 空格 的值"]    // 值有空格必須有雙引號
   ^標記名[包夾內文]                     // 包夾文字的標記  例：^b[加粗的字體]
   ^標記名[屬性=值 包夾內文]              // 無屬性名一律視為包夾文字

標記必須在同一行完成。

## 基本標記


    ^bk     書名 (冊名)
    ^ck     瀏覽單元
    ^n      段落，可帶數字 如 ^n272 ，^n851-860 (連續號)




## 瀏覽單元 (chunk)

    ^ck 定義分卷，即網頁捲動的的範圍，長部及中部一經一chunk，相經部及增支部一個vagga一chunk，約十經左右。
    清淨道論一章一chunk。

## pin 文釘 ：
//前釘，定位句子

    abc       首個"abc"出現的位置
    abc:2     第三個"abc"的位置
    
//後訂，定位腳注

    :abc      首個"abc"出現的位置加 "abc"的長度
    2:abc     第三個"abc"出現的位置加 "abc"的長度
    
