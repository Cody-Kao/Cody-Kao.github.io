---
title: Docker-基本功(二)
layout: post
date: 2026-01-21 14:38:16
tags: [Docker, Container, Backend]
categories: [Docker]
---

## 前言
在[上一篇](/Docker/Docker-基本功-一)提到過基本的Docker語法後想必對更進階的用法感到好奇吧! 在這一篇將會分享更多關於**flag**的使用，而在日常開發中也有許多好用、必學的flag用法喔! 廢話不多說讓我們馬上開始
<!--more-->

## 回顧
還記得我們在第一篇其實就講過**flag**的存在嗎? 這嚴格來說完全不是Docker專屬，對於有寫過任何bash command的人來說應該是相當熟悉了。  
在進入新的用法之前，先一起來回顧一下[上一篇](/Docker/Docker-基本功-一)提到過的!

```bash
docker run -d --name my-redis-server -p 6379:6379 redis:latest
```
`-d` 是讓container進入背景模式(detached)  
`--name` 是給container一個名稱  
`-p` 則是port mapping，讓主機的端口能連接到container中

緊接著是以下這行命令
```bash
docker run -it --rm redis redis-cli -h host.docker.internal -p 6379
```
這裡包含了三個額外的 **flag**：-it、--rm、-h，今天我們也會講如何在 container 的環境中設定**環境變數**

## Docker Flag
> **Flag** 旨在加工docker命令的行為  

簡單說，image 是「模板」，而 flag 決定你**想怎麼使用這個container**，今天要介紹的有:
- [-i](#i-保持-stdin-開啟（interactive）)
- [-t](#t-分配-pseudo-TTY（terminal）)
- [-it](#it-互動-flag-組合)
- [-rm](#–rm-容器停止後自動刪除)
- [-e / --env](#e-–env-設定環境變數)
- [-h](#h-設定-container-主機名稱)

### -i 保持 stdin 開啟（interactive）
```bash
docker run -i ubuntu bash
```
> 適合你想直接進入 container 或給程式輸入資料時使用
- -i = interactive
- 即使沒有 terminal，也能輸入命令或資料給container  
- 常用於需要「輸入」的程式，沒有 -i 的話，stdin 會立即關閉，很多 CLI 會直接結束  
### -t 分配 pseudo-TTY（terminal）
```bash
docker run -t ubuntu bash
```
- -t = terminal
- 為 container 分配一個「假 terminal」
讓程式以為自己是在真正的 terminal 中執行
- 沒有 -t，輸出可能沒顏色、提示符異常，或不能正常互動

### -it 互動 flag 組合
```bash
docker run -it ubuntu bash
```
- 幾乎總是一起使用， -i 保留輸入 -t 提供 terminal
- 適合 debug、測試、操作型 container
- 沒有其中一個 flag，互動體驗就不完整

{% note warning %}  

與 -d（背景執行）屬於互斥思維：
- -d → 背景服務型  
- -it → 前景互動型  

{% endnote %}

### --rm 容器停止後自動刪除
```bash
docker run --rm ubuntu echo "Hello World"
```
- container 停止後自動刪除，適合臨時測試或單次執行的容器
- 不必手動清理，避免累積大量停止 container

### -e / --env 設定環境變數
```bash
docker run -e MY_VAR=123 ubuntu env
```
- 在 container 內設置環境變數
常用於：密碼、帳號、API key  

多個變數可以重複使用 -e
```bash
docker run -e VAR1=foo -e VAR2=bar ubuntu env
```

### -h 設定 container 主機名稱
套用之前的例子
```bash
docker run -it --rm redis redis-cli -h host.docker.internal -p 6379
```
如果我們連線成功應該會看到terminal顯示著我們的hostname  
![Docker -h](/images/Docker/Docker-h.png "Docker -h")

> 在 container 裡， **host.docker.internal** 是用來存取 宿主機（host machine） 的一個特殊 DNS 名稱。  
> 它是 Docker Desktop（Mac / Windows）內建的便利功能，Linux 上則需額外設定

## 驗收
這時候再回來看以下的指令應該就清晰了不少
```bash
docker run -it --rm redis redis-cli -h host.docker.internal -p 6379
```
我們開啟一個redis container並且透過`--rm`讓他自動在結束的時候刪除，`-it`既保留了stdin輸入也讓後續的操作分配 terminal 讓CLI正常。  
`redis-cli -h host.docker.internal -p 6379`這部分是 container 內要啟動的 process，開啟`redis-cli`，並且用`-h`把主機名稱設為"host.docker.internal"然後`-p`連線到6379 port

{% note warning %}
#### 為甚麼沒有port mapping?
上一篇介紹過port mapping是透過 `-p <host_port>:<container_port>` ，其實他是等價於
`-h host.docker.internal -p 6379`的，因為 **host.docker.internal**代表的是本機(host machine)，所以兩者的效果都是 **本機:6379  ←→  Redis container:6379**
{% endnote %}

## 總結 
以上就是我們今天所介紹的**flag**，當然還有一些例如: `-v` `-f`等等 但他們值得一個額外的篇幅。 
 
這邊一樣幫大家整理了表格:  
| Flag       | 作用                                     | 使用情境 |
|-----------|----------------------------------------|-----------|
| `-d`      | 背景執行 container                        | Server / daemon 型 container |
| `-i`      | 保持 stdin 開啟（interactive）             | 需要輸入資料的程式、互動式 CLI |
| `-t`      | 分配 pseudo-TTY terminal                  | 讓程式以為自己在真 terminal 中執行，提供正確提示符、顏色、行為 |
| `-it`     | 互動模式（`-i` + `-t`）                   | Debug、操作型 container、進入 shell |
| `--rm`    | 停止後自動刪除 container                   | 臨時測試或單次執行的容器 |
| `-e` / `--env` | 設定環境變數                          | 調整程式行為、設定密碼或 API key |
| `-h`      | 設定 container hostname                    | Network / 容器辨識、內部通信 |

接下來就可以認識Dockerfile並製作你第一份的 **映像檔(Image)** 啦

<div class="post-end-notification">
  {% note info no-icon %}
  #### 謝謝閱讀到這裡的你/妳
  如果覺得文章對您有幫助不妨按個**喜歡**  
  若有任何疑問也歡迎底下**留言**
  {% endnote %}
</div>
