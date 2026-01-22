---
title: 需要多個Container怎麼辦? 為甚麼要用Docker Compose?
layout: post
date: 2026-01-22 11:34:26
tags: [Docker, Docker Compose, Backend]
categories: [Docker]
---

## 前言
在前面的幾篇文章中，我們已經學會了如何使用 Docker 建立 image、啟動 container，也理解了 base image、WORKDIR、COPY 等背後的設計概念。

但在實際開發中，**服務往往不只一個 container**。

舉例來說：
- 一個後端服務（Flask / FastAPI / Node.js）
- 搭配一個快取或資料庫（Redis / PostgreSQL）

這時候問題就來了：

> container 之間要怎麼連線？  
> 啟動順序誰來管？  
> 每次都要打一長串 `docker run` 嗎？  

如果這時候有一個方法能夠一次管理這些container的啟動與設定該有多好!
<!--more-->

## 目標範例
還記得我們前幾篇使用到的Python+flask以及redis嗎? 這篇會結合這些老朋友做一個簡單的交互  

我們的 demo 非常單純：

- Flask 服務啟動後，先對 Redis 存入一筆資料
- 打開瀏覽器存取 `localhost`
- 顯示 Redis 中的內容

![Hello-Flask-and-Redis](/images/Docker/Hello-Flask-and-Redis.png "Hello-Flask-and-Redis")


我們會先用傳統的方式獨立開啟兩個container 然後再用docker compose的方法，這樣可以清晰的比較差異!

## 傳統方式（手動啟動兩個 container）

### Step 0: 專案結構

```text
flask-docker-compose-demo/
├── app.py
├── requirements.txt
└── Dockerfile
```

### Step 1：啟動 Redis container

```bash
docker run -d --name my-redis -p 6379:6379 redis:latest
```
這裡我們先把 Redis 跑起來，並映射 port，讓 host 可以連線

### Step 2：編輯 app.py 和 requirements.txt

**app.py**
```python
from flask import Flask
import redis

app = Flask(__name__)

r = redis.Redis(
  # 這行非常重要，不然無法讓container互相連線
  host="host.docker.internal",
  port=6379,
  decode_responses=True
)

r.set("message", "Hello Flask and Redis")

@app.route("/")
def hello():
  return r.get("message")

if __name__ == "__main__":
  # port可以隨意設定 只要自己記得多少就行XD
  app.run(host="0.0.0.0", port=5000)
```
這裡你會注意到一件事：
**flask container 必須知道 redis 在哪裡**  
而在此情況下 我們只能手動設定host到 host.docker.internal，然而這樣一來很麻煩 二來也不是長久之計

**requirements.txt**
```text
flask
redis
```

### Step 3: Dockerfile

```Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

CMD ["python", "app.py"]
```

### Step 4: Build Docker Image
```bash
docker build -t my-flask .
```

### Step 5: 啟動服務並察看結果
```bash
docker run -d --rm -p 5000:5000 my-flask
```
再到瀏覽器輸入 `http://localhost:5000` 有順利看到結果就表示成功啦!

雖然成功看到畫面，但你可能已經隱約感覺到哪裡怪怪的。這種做法不是錯，但缺點很明顯：

- Redis 與 Flask 沒有真正「在同一個環境」
- 必須手動管理 port
- container 一多，指令開始變得冗長
- 啟動順序要自己顧(要先開redis才能開啟flask服務)


## 甚麼是 docker compose
> docker compose 是用來「定義並管理多個 container」的工具

它讓我們可以用一個檔案描述並啟動：
- 有哪些服務
- 怎麼連線
- 啟動順序
- port 設定
- ...

他的檔名必須為 **docker-compose.yml** 是個 **yml** 格式的檔案，所以格式要求比較嚴格(但兼容 **json**)

### Step 1: 修改一下 app.py
```python
r = redis.Redis(
  host="redis", # 這裡改成redis就好，也就是底下docker-compose定義的該服務的名稱
  port=6379,
  decode_responses=True
)
```

### Step 2: 創建 docker-compose.yml

我們一樣在root directory新建 **docker-compose.yml**

```docker-compose.yml
version: "3.9"

services:
  flask:
    build: .
    ports:
      - "5000:5000"
    depends_on:
      - redis

  redis:
    image: redis:latest

```

我們先指名一個docker-compose.yml 的語法版本(但在v2 plugin已經不是必要的了)

`services`代表的是所要啟動的containers，並且他們會預設存在於同個網路(Docker network)下

`flask` 和 `redis` 分別是這兩個服務的名稱，可以看到 **flask** 是透過 **build** 指令去指名Dockerfile所在的位置(也就是root directory，所以用 **.** ) 並建立Image後開啟container，而 **redis** 是透過現成Image直接啟動的

再者 **flask** 利用 **port mapping** 成功讓我們可以透過瀏覽器連接，而redis不用對外暴露 且 **flask** 可以直接連接到他是因為他們被創建於同個網路底下，這也是使用 **docker-compose** 的一大好處

最後的 `depends_on` 確保了服務的啟動順序，我們就不用手動先開啟 `redis` 才能開 `flask` 服務

### Step 3: 啟動 docker compose
跟啟動container很類似 輸入一行
```bash
docker compose up --build
```

{% note warning %}
#### 關於啟動指令
一般來說要啟動docker compose是透過 `docker compose up`，但他預設是不會重新build Dockerfile，所以若是來源程式碼或目標Dockerfile有修改了，則使用 `docker compose up --build` 才更正確  
{% endnote %}

一樣到瀏覽器輸入 `http://localhost:5000` 有順利看到結果就表示成功啦🎉🎉🎉

最後執行 `docker compose down` 來關閉服務

## 總結
> docker compose 最大的好處是當container變多時，能高效且安全的管理環境細節

透過 Docker Compose：

- 你可以把「環境結構」寫成程式碼
- container 之間的連線變得直覺
- 啟動與關閉只剩一個指令

這也是為什麼在真實專案中，Docker Compose 幾乎是標配，而不是選配!!

<div class="post-end-notification">
  {% note info no-icon %}
  #### 謝謝閱讀到這裡的你/妳
  如果覺得文章對您有幫助不妨按個**喜歡**  
  若有任何疑問也歡迎底下**留言**
  {% endnote %}
</div>
