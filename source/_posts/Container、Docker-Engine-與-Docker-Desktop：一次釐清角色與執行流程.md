---
title: Container、Docker Engine 與 Docker Desktop：一次釐清角色與執行流程
layout: post
date: 2026-01-21 12:36:16
tags: [Docker, Container, VM]
categories: Docker
---

## 前言
是否每次執行了Docker命令 或是透過容器化解決了日常開發需求的難題後總不禁去想這一切是如何辦到的?  
還是依然不了解為甚麼要安裝Docker Desktop?  
或是不清楚Container以及Docker Engine究竟是什麼?  
今天透過這篇文章一次釐清! 內容保證不會過於學術艱澀~~因為我也沒那麼厲害~~  
準備好嘔吐袋 我們馬上開始!
<!--more-->

## 常見名詞
在學習 Docker 的過程中，常常會出現幾個看似相關、實際上層次不同的名詞：

- Container
- Docker Engine
- Docker Desktop
- VM
- Kernel  

這篇文章的目標是 **釐清它們各自的角色**，以及在 **非 Linux 作業系統上，container 是如何被執行的**  

## Container 與 VM 的本質差異

在概念上，可以用一句話區分：

> **VM 是硬體層級的抽象，Container 是 OS Kernel 層級的抽象**

### VM（Virtual Machine）

- 模擬 CPU、記憶體、磁碟、網卡等硬體
- 內部有 **完整的 Guest OS 與自己的 kernel**
- 隔離性強，但成本高、效能較低

Host OS  
&nbsp; └── Hypervisor  
&nbsp; &nbsp; └──  Virtual Hardware  
&nbsp; &nbsp; &nbsp; └── Guest OS (Kernel)   
&nbsp; &nbsp; &nbsp; &nbsp; └── Application

---

### Container

- 沒有自己的 kernel
- 本質上是 **被 namespace / cgroup 隔離的 process**
- 與 Host 共用同一個 kernel
- 啟動快、效能接近原生

Host OS (Linux Kernel)  
&nbsp; └── Container Runtime  
&nbsp; &nbsp; └── Application (Process)  

## Container 為什麼一定需要 Linux Kernel？

> **Linux-based container 只能執行在 Linux kernel 上**

Container本身 **不包含 kernel**，
而是依附於其所屬作業系統的 kernel 來處理系統呼叫(syscall)  
在 Docker 的常見使用情境中，這通常指的是 **Linux kernel**(99%的Image都是由linux-based)

這也是為什麼：

- Linux 主機可以直接跑 Docker
- Windows / macOS 無法「直接」執行 Linux container

## Docker Engine 是什麼角色？

Docker Engine（dockerd）是 **container 的控制平面（control plane）**，負責：

- 建立與管理 container
- 設定 namespace / cgroup
- 掛載 image filesystem（overlayfs）
- 建立 network、port mapping
- 啟動 / 停止 container

{% note warning %}  
Docker Engine **不在 container 的 syscall 執行路徑上**。

一旦 container 啟動完成：

container process → Linux kernel


syscall 直接由 kernel 處理，不會經過 Docker Engine。  
{% endnote %}


## 那 Docker Desktop 又是做什麼的？

在 Windows / macOS 上，問題不是 Docker，而是：

> **系統本身沒有 Linux kernel**

Docker Desktop 的核心任務只有一個：

> **先啟動一個 Linux VM，然後在裡面執行 Docker Engine**

實際架構如下：

Windows / macOS  
&nbsp; └── Docker Desktop  
&nbsp; &nbsp; └── Linux VM (真實的 Linux kernel)  
&nbsp; &nbsp; &nbsp; └── Docker Engine  
&nbsp; &nbsp; &nbsp; &nbsp; └── Containers

Docker Desktop ≠ Docker Engine  
Docker Desktop 是「包裝 VM + Docker Engine 的工具」

## Container 內的指令大致是怎麼執行的？

以 Non-Linux OS + Docker Desktop 為例，container 執行流程如下：

**一般指令**  
container process
  ↓（user-space instruction）
CPU 直接執行

**syscall**  
container process
  ↓ syscall
Linux kernel（VM 內）
  ↓
虛擬硬體
  ↓
Hypervisor
  ↓
Host kernel
  ↓
實體硬體

## 簡單總結角色分工

- **Container**：被隔離的 process，本身沒有 kernel
- **Docker Engine**：container 的生命週期與資源管理者
- **Docker Desktop**：為非 Linux 系統提供 Linux VM 的包裝工具
- **Linux VM**：提供 Linux kernel 與硬體虛擬化
- **Host OS**：最終的硬體資源管理者

## 結語

理解 Docker 的關鍵，不只在於指令本身，而在於：

> **哪些事情是 kernel 做的，哪些只是 Docker 幫你「安排好」**

一旦這個邊界清楚，後續學習 Dockerfile、Kubernetes 都會變得清晰且自然

<div class="post-end-notification">
  {% note info no-icon %}
  #### 謝謝閱讀到這裡的你/妳
  如果覺得文章對您有幫助不妨按個**喜歡**  
  若有任何疑問也歡迎底下**留言**
  {% endnote %}
</div>
