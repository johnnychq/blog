---
title: nodejs中的调试
date: 2017-11-26T11:18:12Z
updated: 2017-12-10T14:33:03Z
categories:
- tools
tags:
- nodejs
---

node如何断点调试？运行时？多进程时？

> https://nodejs.org/api/debugger.html

请先阅读完上述官方关于debug的文档。

## 官方的两种方式 

官方文档中主要介绍了两种启用方式

* `--debug` 方式启用调试，命令行（已经废弃）
* `--inspect` 方式启用调试，界面化


### 方式一：`--debug`


#### 官方方案

方法：`node --debug app.js`

`--debug`是node提供的最基本方式，启动后会默认开启`5858`端口，然后就可以侦听该端口进行调试了。尝试访问下5858提供的侦听端口服务把：http://localhost:5858

之后，侦听该端口，进行调试，方式及工具很多，官方只提供了命令行方式，

* `node debug -p <pid>` 或
* `node debug <URI>`


备注：

> node debug index.js 其实是两条命令的缩写
> - node --debug app.js // 假设其pid为10010
> - node debug -p 10010


这里不细讲，重点讲基于该端口的社区方案：

#### 社区扩展

社区提供了很多其他选择，列下比较知名的两个：

* [node-inspector](https://github.com/node-inspector/node-inspector)
* [iron-node](http://s-a.github.io/iron-node/)

这里重点介绍下`node-inspector`

安装很简单：`npm install -g node-inspector`

使用也非常简单：`node-debug app.js`

但，`node-debug app.js`其实包含了三个过程

1. `node-inspector` 启动8080web服务，访问后是一个CHROME_DEV_TOOLS界面
2. `node --debug app.js`这个是最基本、核心的，启用node的`--debug`模式，暴露默认5858端口。
3. 访问`http://127.0.0.1:8080/?port=5858`即可进行调试，node-inspector会通过socket与5858建立长连接，进行调试。


总结一下前两者：

![image](https://cloud.githubusercontent.com/assets/1297278/23822659/2d9ae982-068c-11e7-9ac5-6bfaa7d3aab2.png)



### 方式二：`--inspect`


方法：`node --inspect app.js`

其实是把社区的方案直接内置到nodejs中了，不需要安装`node-inspector`即可以直接用Chrome DevTools进行可视化界面调试。

此方案直到nodejs v6.3才被node内部支持，具体纳入过程可以参见：https://nodesource.com/blog/the-10-key-features-in-node-js-v6-lts-boron-after-you-upgrade


纳入后的调用及部署变得简单，对比如下：

![image](https://cloud.githubusercontent.com/assets/1297278/23822666/58f71f42-068c-11e7-89d8-8cbbf5f0a071.png)


## IDE中如何debug

Debug原理就是上述两种方式，IDE中的内置debug也遵从

### WebStorm

采用`方式一`进行, 只要配置好`启动/入口JS`文件即可：

![image](https://cloud.githubusercontent.com/assets/1297278/23823075/426703d8-0695-11e7-9f94-1dcca56d8caf.png)

Webstorm有两个button, 分别为启动和调试

* 启动：用配置的 node `启动/入口JS`
* 调试：额外加上调试参数 node `启动/入口JS` `--debug-brk=55077` `--expose_debug_as=v8debug`

由于IDE的高度集成，使得调试体验非常好：

![image](https://cloud.githubusercontent.com/assets/1297278/23823065/26d92128-0695-11e7-9a00-02df3967c9fd.png)

### VisualStudioCode

![image](https://user-images.githubusercontent.com/1297278/33805811-9b0c19f6-ddf9-11e7-83e1-7d87232eac11.png)

![image](https://user-images.githubusercontent.com/1297278/33805819-a90dd724-ddf9-11e7-94f3-bea572f2997b.png)

由于VS运行node环境为v8.9, 所以直接启用方式二进行debug: `node --inspect-brk=25696 test.js`

## 关于运行时调试

已经启动的服务器不想停掉，有办法进行调试吗？

* `--debug`方式有, 对具体node进程传入`USR1`信号即可： `kill -s USR1 <pid>`
* `--inspect`方式缺乏，有望在node v8.0提供，参见：[Debug already running process using v8-inspector?](https://github.com/nodejs/node/issues/8464)

![image](https://cloud.githubusercontent.com/assets/1297278/23822717/80ff748e-068d-11e7-868c-473c481a2a6f.png)


## 关于多进程


`--inspect`方式不会有问题（缺点不提了），因为会对每个进程单独开启一个debug链接，但传统`--debug`就麻烦了。

---------

只有一条：请尽可能降维为单进程后再调试。当然，多进程Debug是有方法的，只不过比较麻烦，可以参见：

> https://strongloop.com/strongblog/whats-new-nodejs-v0-12-debugging-clusters/

另外，针对eggjs，如何进行调试呢？因为即使开发模式，egg也会启动主进程、worker进程及agent 3个进程。比较简单，找出woker进程的pid，运行时设置为`--debug`模式。其他多进程也可以按照这种方式手动设置后debug。

> ps -ef | grep app_worker.js // 找到pid
> kill -s USR1 [pid]

然后便可以开启`node-inspector`，在浏览器中Debug了。

## 最后

界面化调试偶尔用用即可，不要过于依赖，养成打印日志，通过日志定位、排查问题才是王道。
