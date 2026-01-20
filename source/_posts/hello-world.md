---
title: Hello World
layout: post
date: 2026-01-20 12:06:37
tags: 
categories: 科普
---

## 前言
還記得當時學習程式的第一段程式碼嗎?  
嗯...讓我猜猜  
一定是`Hello World`對吧!  
先不要著急問我怎麼知道的 也先把崇拜的目光收著  
因為接下來我們將會了解這個專屬工程師的浪漫💖
<!--more-->

## 緣起

> 如果要用一句話來迎接一趟新世界的啟程 你會如何起頭  

西元1972年，位於美國紐澤西州的諾基亞貝爾實驗室，一名傳奇工程師--布萊恩·克尼漢(Brian Kernighan) 著手撰寫了一份內部檔案 **A Tutorial Introduction to the Language B** 而其中的B語言也就是我們日後所熟知的C語言的前身。  
在這份報告的其中第一次提到了`Hello World`的字段，雖然在當時是一段作為使用外部變量(external variable)的示例，但也足以諭示著人類與電腦語言的深刻連結  

##### B
```B
main( ) {
extrn a, b, c;
putchar(a); putchar(b); putchar(c); putchar(’!*n’);
}

a ’hell’;
b ’o, w’;
c ’orld’;
```
若你對上面的程式碼感到陌生也完全沒關係，反正我是已經看得老淚縱橫了😭 那麼來看看以下有沒有專屬於你當初學習程式語言的~~美好~~回憶吧

##### C
```C
#include <stdio.h>

int main(void) {
    printf("Hello, World!\n");
    return 0;
}
```
##### C++
```C++
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```
##### Java
```Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```
##### C#
```C#
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}
```
##### Ruby
```Ruby
puts "Hello, World!"
```
##### PHP
```PHP
<?php
echo "Hello, World!\n";
```
##### R
```R
print("Hello, World!")
```
##### Python
```Python
print("Hello, World!")
```
##### JavaScript
```JavaScript
console.log("Hello, World!");
```
##### Swift
```Swift
print("Hello, World!")
```
##### Go
```Go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```
##### Rust
```Rust
fn main() {
    println!("Hello, World!");
}
```

所以呀 不要再說理工男都是木頭直男🪵了，他們不一定會對妳說100次的"我愛妳"，但一定有100種方式(X)

<div class="post-end-notification">
  {% note info no-icon %}
  #### 謝謝閱讀到這裡的你/妳
  初來乍到，這篇是作者的第一篇文章  
  期許日後我還能繼續更新 也能當作寫給自己的筆記  
  如果覺得文章對您有幫助不妨按個**喜歡**  
  若有任何疑問也歡迎底下**留言**
  {% endnote %}
</div>
