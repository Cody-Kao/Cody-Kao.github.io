---
title: Docker 基本功(一)
layout: post
date: 2026-01-20 14:38:23
tags: [Docker, Container, Backend]
categories: [Docker]
---

## 前言
有接觸過容器化(Containerization)的朋友們一定對一隻藍色小鯨魚🐳不陌生吧  
沒錯! 目前主流的容器化技術就是我們熟悉(也可能還不熟悉🤫)的Docker，當然還有Podman、LXC等等  
而這篇文章將會作為Docker系列的第一篇，所以相當新手友善，如果講到這邊還沒造成生理不適的話就放心地看下去吧
<!--more-->

## 什麼是Docker?
![Docker Logo](/images/Docker/docker-logo-blue.png "Docker Logo")  
要完全解釋甚麼是Docker前應該先認識何謂**容器(Container)** 以及與之相近的**虛擬機(Virtual Machine)** 分別是甚麼，這裡先容我挖個坑之後再來補齊這個概念。不過簡單來說呢**容器**的存在就是為了要解決一個重要的工程問題`It works on my machine`，想必大家或多或少都有遇過這樣的情況: 本地測試的時候一切都運行的好好的，但為什麼上線到運行環境、另一台電腦上甚至是~~給主管demo~~的時候就出狀況了呢?而我們又不可能把整台電腦置換過去(也不知道怎麼移殖環境)，所以這時候就會需要用到這些容器化的技術，把所有運行會需要的依賴以及版本設定等等全部包裝成一個唯讀的模板檔案，這樣就可以在任何機器上依照模板建構執行環境並執行其應用服務，而這其中其實牽涉到了三個很重要的概念
- 映像檔(Image)
- 容器(Container)
- 倉庫(Repository)

映像檔可以把它想成是創建容器所需要的藍圖 也就是先前提到的模板，我們要先有藍圖才知道如何"建立"出容器並"運行"它，他們就像設計圖跟房子的關係，所以同一份映像檔可以創造出多個容器，而一台電腦基本上可以同時運行成百上千個容器都不是問題! 而建立出來的容器就像一個**應用程式**一樣，你可以選擇運行或是停止它。倉庫的概念不用我多說，就是存放這些映像檔的地方，它也分成公開倉庫(public)與私有倉庫(private)兩種類型。
當然用說的相當簡單，可實際該如何操作呢? 讓我們一步一步了解

## 下載與安裝
各位請容我偷個懶🫠 [官方網站](https://www.docker.com/get-started/)已經把安裝步驟講得非常詳細了 照著操作基本上不會出問題，但值得一提的是如果是Windows/Mac用戶則需要多安裝一個Docker Desktop否則無法順利運行

## 開啟Docker
下載安裝完Docker後我們可以到終端機上輸入
```bash
docker --version
```
如果成功印出版本訊息就表示安裝成功咯
```text
Docker version 25.0.3, build 4debf41
```
之後開啟Docker Desktop並運行它  
![Docker Desktop](/images/Docker/Docker-engine-resume.png "Docker Desktop")

## 基本語法
一開始下載完Docker會看到本地倉庫應該是空空如也的，這時候你會好奇難道我要純手工自己做映像檔(Image)才能開啟嗎? 非也，其實已經有許多現成的映像檔能夠直接抓下來使用喔(也就是從網路上的公開倉庫抓取)，最直接的範例就是[Docker hub](https://hub.docker.com/)  
今天的範例就讓我們使用現成的Image來啟動redis服務吧，至於[redis](https://www.ibm.com/think/topics/redis)是甚麼我日後有機會再來介紹一下，但簡單來說它就是種key-value store，屬於NoSQL的一種類型

首先先抓取redis Image，輸入`docker pull [REPOSITORY:TAG]`
```bash
docker pull redis:latest
```
其中REPOSITORY就是去Docker hub查詢redis後顯示的名稱  
![Docker redis Image](/images/Docker/Docker-redis-image.png "Docker redis Image")  
而tag則是可以指定，在底下列出的"Supported tags and respective Dockerfile links"都可以選用，若想用最新的版本則輸入 **latest**

下載完成後可以輸入docker images查看本機現有的所有映像檔
```bash
docker images
```
應該會看到剛剛下載好的redis  
(因為我還有其他Image所以會一併顯示出來) 
![Docker Image](/images/Docker/Docker-image.png "Docker Image")   

之後我們建構這個Image成Container並且運行它
`docker run [REPOSITORY:TAG]`
```bash
docker run redis:latest
```
這時候應該會看到我們的終端機被他占用住了!  
而這顯然在開發上面相當不方便，我們先*ctrl+C*或*Command (⌘) + C*把它停掉，然後使用**flag**去設定讓他變成背景模式（detached）
```bash
docker run -d redis:latest
```
這時候會打印出剛剛執行的container ID，就表示正在背景執行了

這時候我們再透過終端機查看**正在運行**的所有Container
```bash
docker ps
```
![Docker ps](/images/Docker/Docker-ps.png "Docker ps")  
會看到我們的Container的ID、Image名稱、port、以及一個奇怪的Container名稱，但我們能不能給每個運行的Container自訂名稱呢，答案是肯定的，也是一樣透過flag去設置 `--name [containerName]`  
我們先輸入 `docker stop [containerID]` 或是 `docker stop [containerName]` 來停止服務
```bash
docker stop 33b5c1407bce
```
接著重啟服務
```bash
docker run -d --name my-redis-server redis:latest
```
這時再輸入`docker ps`  
![Docker ps](/images/Docker/Docker-ps-2.png "Docker ps")  
就看到my-redis-server成功顯示啦  

接著聰明的你就會想說要連線至創建好的redis server(預設於6379 port)，於是輸入以下的指令嘗試連線:  

(如果有裝redis-cli)
```bash
redis-cli -h 127.0.0.1 -p 6379
```
Linux users
```bash
nc localhost 6379
```
或是直接輸入
```bash
docker run --rm redis redis-cli -h host.docker.internal -p 6379
```
但發現明明服務已經啟動了卻如何也連不上
```text
Could not connect to Redis at host.docker.internal:6379: Connection refused
```
那是因為我們並沒有使Container的**6379 port**對外曝露，而這件事也可以從我們之前透過`docker ps`打印的資訊得知  
![Docker ps](/images/Docker/Docker-ps-2-1.png "Docker ps")  
一般來說，redis服務預設是使用TCP監聽**6379 port**，就像是http服務跑在80 port，但是圖中顯示`6379/tcp`代表雖然Container本身在監聽這個端口，但我們並沒有指派一個host port讓Docker幫我們轉接出來。為此我們指派host的6379 port去給Container(建議使用同樣的host port去對應container port) 我們一樣使用flag: **-p hostPort:containerPort**去指派  

**Port Mapping in Docker**  
<i style="font-size:.75rem;">source: https://medium.com/@ppran234/why-do-we-bind-ports-in-docker-4f2a62ea2e69</i>  
![Docker port mapping](/images/Docker/Docker-port-mapping.png "Docker port mapping") 

在著手設定端口映射之前，我們先停止當前的容器，再輸入`docker ps -a`把所有的Container打印出來(先前的`docker ps`只能印出正在執行的)  
![Docker ps -a](/images/Docker/Docker-ps-a.png "Docker ps -a")  
之後先把所有停止的容器刪除(目前會有3個)  
至於為甚麼這麼多呢? 因為每次我們執行`docker run`都會基於Image建立並啟動一個新的container，而若要指定啟動某個已經建立好的container則是使用`docker start`的指令。  

我們輸入以下指令把容器刪除
```bash
docker rm id_1 id_2 id_3
```
然後再次輸入`docker ps -a`檢查所有容器都被清空了  

我們就接著執行:
```bash
docker run -d --name my-redis-server -p 6379:6379 redis:latest
```
這時候輸入`docker ps`並查看port應該會顯示**0.0.0.0:6379->6379/tcp**這樣就表示端口有正確對外映射  
接下來我們模擬使用該redis服務，寫入一筆資料並讀取出。我們先輸入以下指令進入到redis的終端去  
`docker exec -it [containerName] redis-cli`
```bash
docker exec -it my-redis-server redis-cli
```
接著輸入以下redis命令
```bash
SET myKey "Hello Redis"
```
然後新開一個終端機視窗，輸入以下命令連線到6379端口
```bash
docker run -it --rm redis redis-cli -h host.docker.internal -p 6379
```
連線成功後測試一下是否能正確把剛剛寫入的資料讀取出
```bash
GET myKey
```
若出現 **"Hello Redis"** 代表成功咯! 送給自己200個掌聲👏   
然後我們可以退出redis連線並且把container關閉
```bash
docker stop my-redis-server
```
然後可以放心使用`docker rm`把停止的container刪除咯
```bash
docker rm my-redis-server
```
最一開始下載的redis Image也可以透過`docker rmi [ImageID]`或是`docker rmi [REPOSITORY:TAG]`刪除
```bash
docker rmi redis:latest
```

## 總結
以上的語法都相當簡單但卻非常實用，應對基本的日常開發是沒甚麼問題的! 這邊我也幫大家整理的一個表格，可以快速查閱基本語法

### Docker 基本語法速查表

| 類別         | 指令 / 範例                                          | 說明 |
|--------------|---------------------------------------------------|------|
| **Container** | `docker run -d --name my-container redis:latest` | 建立並啟動新的 container |
|              | `docker ps`                                      | 查看正在運行的 container |
|              | `docker ps -a`                                   | 查看所有 container（包括停止的） |
|              | `docker logs <container>`                        | 查看該container所有日誌(常配合detached mode) |
|              | `docker stop <container>`                        | 停止正在運行的 container |
|              | `docker start <container>`                       | 啟動已停止的 container |
|              | `docker restart <container>`                     | 重啟 container |
|              | `docker exec -it <container> <command>`         | 在 container 內執行命令（例如redis-cli以直接操作redis） |
|              | `docker rm <container>`                          | 刪除 container（需先停止） |
|              | `docker container prune`                         | 刪除所有停止的 container |
| **Image**     | `docker pull`                                 | 下載Image |
| |`docker images`                                 | 列出所有 image |
|              | `docker rmi <image>`                             | 刪除指定 image |
|              | `docker rmi -f <image>`                          | 強制刪除 image（即使有 container 依賴） |
|              | `docker image prune`                             | 刪除 dangling image |
|              | `docker image prune -a`                          | 刪除所有未使用的 image |
| **Port 映射** | `-p <host_port>:<container_port>`               | 將 container 內的 port 映射到 Host 
| **快速清理** | `docker system prune`                             | 刪除未使用的 container、image、volume 等 |


下一集再跟大家分享Dockerfile以及製作自己的映象檔!

<div class="post-end-notification">
  {% note info no-icon %}
  #### 謝謝閱讀到這裡的你/妳
  如果覺得文章對您有幫助不妨按個**喜歡**  
  若有任何疑問也歡迎底下**留言**
  {% endnote %}
</div>
