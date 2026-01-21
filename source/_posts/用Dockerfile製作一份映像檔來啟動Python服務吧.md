---
title: 用Dockerfile製作一份映像檔來啟動Python服務吧
layout: post
date: 2026-01-21 19:42:59
tags: [Docker, Python, Flask, Backend]
categories: Docker
---

## 前言
前面幾篇我們一直在使用「現成的 image」(例如 **redis**)  
但你一定會開始好奇一件事：

> **image 到底是怎麼被做出來的？**

這一篇，我們就用一個**最小可執行、看得到效果的 Flask Hello World demo**  
一步一步認識：
- Dockerfile 的角色
- base image 的意義
- COPY / RUN / CMD / ... 各自負責什麼
<!--more-->

## Dockerfile是甚麼
Dockerfile簡單來說就是由一行一行的指令組成 目的就是使得Docker Engine能依照該檔案製作出映像檔(Image)  
而這份特殊的檔案就叫做 **Dockerfile** ，沒錯他不是甚麼後綴名稱又或是副檔名，他就叫做Dockerfile

Dockerfile 並不是在操作 container，而是在定義 image  
而 image 中的設定，會在 container 啟動時成為其執行環境的一部分。
## 範例目標

我們要完成的事情很單純：

1. 用 Python 寫一個 Flask Hello World
2. 用 Dockerfile 把它包成 image
3. 用 `docker run` 跑成 container
4. 透過瀏覽器看到結果  
![Docker-python-flask](/images/Docker/Docker-python-flask.png "Docker-python-flask")
---

## 專案結構

```text
flask-docker-demo/
├── app.py
└── Dockerfile
```

## Python 程式碼
相信大家或多或少都有寫過Python，沒有也沒關係 因為今天用到的語法完全不是重點! 直接複製以下程式碼到剛剛建立的`app.py`就好咯
```py
from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello from Docker + Flask!"

if __name__ == "__main__":
    # port可以隨意設定 只要自己記得多少就行XD
    app.run(host="0.0.0.0", port=5000)
```
{% note warning %}
#### 為什麼要 host="0.0.0.0"？
Docker container 有自己的 network namespace
如果只監聽某個特定的hostname外部是連不到的。  
0.0.0.0 代表「接受所有網路介面」  
{% endnote %}

## Dockerfile 建立
可以先把以下的內容複製，我們再一行一行拆解
```Dockerfile
# 1. Base image
FROM python:3.12-slim

# 2. 設定工作目錄
WORKDIR /app

# 3. 複製程式碼進 image
COPY app.py .

# 4. 安裝相依套件
RUN pip install flask

# 5. container 啟動時要執行的命令
CMD ["python", "app.py"]
```

### From 指令

```Dockerfile
FROM python:3.12-slim
```

這行代表我們創建的image 是建立在 python:3.12-slim 這份base image之上，這是必要且關鍵的一步。 至於base image的挑選一樣可以去[Docker hub](https://hub.docker.com/)上選擇

也就是說：
- 已經有 Linux user space
- 已經有 Python runtime  

我們不用從零開始安裝作業系統與 Python

📌 重點觀念：
Docker image 是「一層一層疊加」的，
每個 image 幾乎都是從某個 base image 開始

{% note warning %}

#### base image 後面的slim代表甚麼? 
python:3.12 => 環境中Python的版本  
而後綴的意思指的是**不同底層OS**  
會直接影響：
  - image 的大小(由小到大: alpine -> slim -> bullseye -> bookworm)
  - 預設包含的系統工具數量
  - 套件相容性(特別是 pip 套件)
  - 是否需要自行編譯 native library
  
{% endnote %}

也因此，選擇適合的 base image，遠比「選最新版本」來得重要。

### WORKDIR 設定工作目錄

```Dockerfile
WORKDIR /app
```

簡單來說就是在container啟動後指派一個工作目錄 讓**之後所有的指令都運行在此工作目錄之下**。  
講白了 `WORKDIR /path/to/dir` 就是做了兩件事情:
1. 如果該目錄已存在 則cd進去
2. 若該目錄不存在 則先創建再cd進去   

> 比起手動建立再跳轉目錄，官方建議直接寫WORKDIR  

### COPY <來源> <目的地>

```Dockerfile
COPY app.py .
```

他的意思相當直覺:
- 從「build context（你的專案資料夾）」
把 app.py 複製到 image metadata 中定義的 WORKDIR (會在 container runtime 生效，也就是 /app)

{% note warning %}
#### image 是不可變的
COPY 發生在 build time，不是 runtime  
修改原始檔案後，一定要重新 build image  
{% endnote %}

### RUN: 在 image build 時執行命令
```Dockerfile
RUN pip install flask
```

在 build image 的過程中啟動一個**暫時的 container** 並執行指令，再把結果存成 image layer  

這邊這樣寫是因為在container環境下是沒有flask這個套件的，所以我們需要安裝必要的外部依賴。值得注意的是 `RUN <command>` 可以有多個

### CMD: Container 啟動時要做什麼？
```Dockerfile
CMD ["python", "app.py"]
```

> 當 container 被啟動時，預設執行這個 command

而我們會把指令中間的空格用"，"隔開寫進CMD  
{% note warning %}
#### RUN跟CMD的差異
|  指令   | 執行時機  |
|:-----|:-----|
|RUN	|build image 時 |
| CMD	| run container 時 |

📌 一個 Dockerfile 只能有一個 CMD  
{% endnote %}

## Build Image
```bash
docker build -t flask-demo .
```
`-t` 表示image 名稱  
最後的這個`.`可不能省略，它代表的是 build context (Dockerfile 所在目錄) 也就是當前目錄  

執行完成後我們一樣用`docker images`是否成功出現剛剛建立好的映象檔  
![Docker-flask-image](/images/Docker/Docker-flask-image.png "Docker-flask-image")

然後我們接著啟動container，一樣輸入
```bash
docker run -d --name flask-server -p 5000:5000 flask-demo
```
記得`-p`如果不是使用範例的5000port的話要用你自己的!  
然後使用`docker ps`查看，成功之後去瀏覽器打開`http://localhost:5000`就會看到結果了🎉  
![Docker-python-flask](/images/Docker/Docker-python-flask.png "Docker-python-flask")  

## 總結
完成一個映像檔的建立應該相當有成就感吧! 而且也沒有想像中的困難，最後我們一樣做一個重點整理:  
- Dockerfile 操作的對象是 image，而不是 container
- WORKDIR、ENV、CMD 等設定，是被寫進 image 的 metadata， 當 image 被 docker run 啟動時，這些設定才會成為 container 的執行環境
- COPY app.py . 中的 **.** 指的是 image 中定義的 WORKDIR  

最後也別忘了給自己100個掌聲阿👏  
期待下次再來介紹更進階的docker compose

<div class="post-end-notification">
  {% note info no-icon %}
  #### 謝謝閱讀到這裡的你/妳
  如果覺得文章對您有幫助不妨按個**喜歡**  
  若有任何疑問也歡迎底下**留言**
  {% endnote %}
</div>
