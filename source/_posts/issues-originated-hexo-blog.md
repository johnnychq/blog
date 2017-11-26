---
title: How to eliminate the gap between github issues blog and hexo blog
date: 2017-11-26T15:55:13Z
categories:
- tools
---

如何抹平`github issues blog`和`hexo blog`的鸿沟呢？指的是既可以拥有自定义的hexo博客，又可以享用github issues的便捷性，且尽可能的只维护其中一份即可。

自己分别研究了这两种博客机制，并结合gitment插件，设计了以github issues为源且兼顾hexo的一种博客维护方法（暂且叫`issues-originated-hexo-blog`），最后得到的效果：

> * 只需要维护github issues即可
> * 提供一种机制，让issues会自动编译并发布到hexo博客中
> * hexo可以享用github issues的评论，包括可以在hexo中评论，回源到github issues

一旦建立此机制后，你的日常blog维护方法只需要在维护github issues的基础之上满足两个约束即可：

* github issue的标签的前缀规范，用于定义博文的标签、分类的同时又可以关联两个博客的文章
* 手动执行一下命令`npm run deploy`，让issues的博客发布、同步到hexo中

## 关于两种blog和gitment插件

`github issues blog`和`hexo blog`都不细说了，github issues没有任何技术门门槛，hexo还是要研究实践一番才可以，但只要花点时间学习，还是很简单的，可以参见：[我的博客是如何搭建的（github pages + HEXO + 域名绑定）](http://www.jianshu.com/p/834d7cc0668d)。

其中，我们这里的`hexo blog`在部署环节特指通过github pages的方式，主要是既简单又使用。

另外，gitment插件是一个基于github issues,利用github 开放apis设计的一款创意第三方评论系统。既然可以把issue评论作为评论系统，那为何不更近一步，把issue本身当成博客呢？这是`issues-originated-hexo-blog`的核心理念。

## 设计结构

1. `issue本身`作为博文主体(包括标题和内容), `issue评论`作为博文评论，通过`github issues tags`作为博文的标签和分类
2. 通过一个特殊的`github issue tag`来标识博文的`unique name`，此name两个作用
   * 是`github issues blog`的与`hexo blog`文章的映射，和关联gitment的关键
   * 是`hexo blog`文章的文件名，也是URL中文件名部分的内容
3. 通过github open api及相应的工程化手段将上述github issues自动转化、发布为hexo blog.

为了实现上述设计，只需要实现两个约束即可

1. `github  issues  tag`规范 (tag前缀规范，定义了两种特殊的前缀）
    * `blog-${unique name}`, 即blog前缀，即`设计结构2`中的unique name
    * `cat-${category name}`,即cat前缀，即`设计结构1`中关于分类的那一小点，因为要区分标签和分类，所以要加前缀
    * `${tag name}`，无前缀时默认为博文的标签
2. 为了解决`设计结构3`中的工程化相关问题，封装了一个`issues-originated-hexo-blog`插件，简化此问题。

约束1只要注意就可以了，约束2有一定的技术门槛，不过既然你能搞定hexo博客，那约束2自然不在话下。

## `issues-originated-hexo-blog`插件的部署

首先我假定,

* 你独立能够搭建hexo静态站点
* 并且了解如何将此hexo站点发布到github gh-pages中
* 并且了解如何在hexo中使用gitment评论插件

在此基础之上，

### I. 先安装`issues-originated-hexo-blog`插件

在hexo工程根目录中

> npm install --save issues-originated-hexo-blog

备注：请保证node版本在`v8.9`及以上

然后配置 `package.json`的 script部分

```
{
    "scripts": {
         "deploy": "issues-originated-hexo-blog",
         "postdeploy": "git add . && git commit -m 'update posts' && git push -u origin master && hexo d -g"
    }
}
```

### II.将`gitment`的配置文件初始化代码部分改为

由
```
const gitment = new Gitment({
  id: 'Your page ID', // optional
  owner: 'Your GitHub ID',
  repo: 'The repo to store comments',
  oauth: {
    client_id: 'Your client ID',
    client_secret: 'Your client secret',
  },
  // ...
  // For more available options, check out the documentation below
})
```

改为
```
function getCommentId(){
  let path = window.location.pathname;
  if(path[path.length - 1] === '/'){
    path =  path.substr(0, path.length -1);
  }
  path =  'blog-' + path.split('/').pop();
  return path;
}

const gitment = new Gitment({
  id: getCommentId(), // optional
  owner: 'Your GitHub ID',
  repo: 'The repo to store comments',
  oauth: {
    client_id: 'Your client ID',
    client_secret: 'Your client secret',
  },
  // ...
  // For more available options, check out the documentation below
})
```

核心是`getCommentId()`，gitment初始化的其余部分略去

### III. 最后，运行一条命令即可

上述两个步骤完成后，想同步`github issues blog`的内容时，只需要运行

> npm run deploy

即可

## 关于hexo blog的说明

在`issues-originated-hexo-blog`插件情况下的hexo blog依旧可以单独维护一些hexo blog独有的页面，比如About me. 不过请注意一个点：

> 运行`issues-originated-hexo-blog`插件时，插件会以 github issues中`blog-${unique name}`的tag里的unique name作为文件名，即`{unique name}.md`保存到`/source/_posts`目录下

所以，只要保证在hexo blog中维护的页面文件名不要有冲突即可

## 后续

关于约束2，即手动运行`npm run  deploy`部署、同步hexo blog的过程可以想方设法实现自动化。

想过`travis`, 不过travis只支持源码的push及MR事件，无法捕获issues相关事件。可以通过web hook达到效果，但需要一个在线编译环境，比如自己的vps，但增加了复杂度。

自己设想，是否可以通过webhook通过某种机制间接触发`travis`呢？

另外，如果实现了github issues blog和hexo blog的同步，是否更进一步让博文也同步发布到`知乎专栏`及`简书`等平台呢？
