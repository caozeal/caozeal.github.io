---
title: Jenkins在Java web项目CI/CD中的简单应用
date: 2023-03-02 18:41:01
tags: jenkins
---
> [傲然绝唳的小栈](https://mp.weixin.qq.com/s/-bJfhCfjlKZ3gK2uf2w3Ug)

# Jenkins

> Jenkins is a self-contained, open source automation server which can be used to automate all sorts of tasks related to building, testing, and delivering or deploying software.

- 主要介绍使用Jenkins来达到持续集成持续交付/持续部署（CICD）的一些方案和选择，不涉及Jenkins的深入研究。
- 实现CI/CD的方式有很多种，本文介绍的只是我这几天一些粗略的摸索，仅供大家参考。

## 一、安装

- Jenkins的安装方式有很多选择，这里不做详细讨论，我这次采用了比较熟悉的部署WAR包的方式，将其部署到tomcat上来运行。
  ![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe510fd9338f~tplv-t2oaga2asx-image.image)
- 部署完成之后访问相应地址即可，这是会提示新建用户，大家按照指引一步一步完成即可，不做赘述。

## 二、新建任务

- Jenkins部署完成之后，接下来便要进入正题了，新建一项任务，已达到CICD的目的。
- 首页左侧菜单按选择新建任务-》输入任务名称-》构建一个自由风格的软件项目-》确定（这里我已经创建过一个名为test的项目了）
  ![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe51110eb415~tplv-t2oaga2asx-image.image)
  ![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe511837c710~tplv-t2oaga2asx-image.image)
- 点击确定后进入了该项目的配置页面，先总览所有的配置项，共有六项：General，源码管理，构建触发器，构建环境，构建，构建后操作.从字面意思上不难理解。

  - General，一些通用的信息，本次不做重点；
  - 源码管理，构建的来源，git，svn，亦或是其他一些源码管理服务；
  - 构建触发器，以何种规则自动触发源码的构建（持续构建），若该项不做任何配置，则只能手动触发；
  - 构建环境，本次也未做关键性修改；
  - 构建，以何种方式构建，maven， gradle， 亦或是其他；
  - 构建后操作，成功构建之后的一些操作，持续交付/持续部署的操作主要放到这一块。
    ![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe50fb46705a~tplv-t2oaga2asx-image.image)

接下来分别较少这几项配置，以及用到的插件，已完成CI/CD的目标。

### 1. General

- 本次并没有做一些关键的修改
  ![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe50fb644e66~tplv-t2oaga2asx-image.image)

### 2. 源码管理

- 只说明git的一些相关配置，其他的源码管理服务同理
  ![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe5116f6a6db~tplv-t2oaga2asx-image.image)
- Repository URL： git上的源码地址
- Credentials： 用户名/密码
- Branch Specifier：指定需要构建的分支
- 上边这些做完后其实基本上已经可以了，之所以修改Advanced clone behaiours，是防止第一次构建时拉取源码超时，默认超时时间为10minutes，多次构建失败后，我把此处修改为了20minutes，如果依旧超时，可延长此处时间，或检查网络（点击Additional Behaviours旁边的add，选择Advanced clone behaiours）

  - Shallow clone，Shallow clone depth：浅拷贝，节省拷贝时间和磁盘空间

### 3. 构建触发器

- 实现触发构建的方式主要有定时触发、web hook触发，这些触发方式可以单独使用，也可以组合使用。

#### 3.1 定时触发

- Build periodically： 周期性构建
- Poll SCM： 周期性检测，若源码有变化则构建
- 图中为每六小时检测一次

  - [搞清楚jenkins中“Poll SCM”和“Build periodically”的啥意思](http://heipark.iteye.com/blog/1736477)
    ![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe520c715542~tplv-t2oaga2asx-image.image)
- 定时构建部署，可控制频率

#### 3.2 Gitlab Hook插件

 　　web hook触发主要介绍gitlab hook插件，接下来我们先保存已经完成的配置，回到首页，下载所需插件。
![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe522800622d~tplv-t2oaga2asx-image.image)

　　可选插件中搜索gitlab，勾选列表中的GitLab Plugin和Gitlab Hook Plugin, 选择直接安装。待安装完成后回到首页，点击右边刚刚我们创建的任务，然后点击配置回到我们之前的配置页面。
![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe523421ce8b~tplv-t2oaga2asx-image.image)

　　此时发现构建触发器中多了个选项：`Build when a change is pushed to GitLab. GitLab CI Service URL: http://172.16.192.142:9081/jenkins/project/test`，如果仍然没有，尝试重启Jenkins之后查看。
![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe523255dfaa~tplv-t2oaga2asx-image.image)

　　图中红框上边为Gitlab Web Hook处需要添加的URL，若Jenkins设置了不允许匿名用户执行构建操作，则需要在Gitlab安全令牌处添加第二个红圈处的Secret token。

- Gitlab处需要增加的配置（设置-》集成，注意登录账户需要有相应权限）
  ![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe52344b9f8a~tplv-t2oaga2asx-image.image)
- 随时提交，随时构建，快速相应开发人员的操作，但需要开发人员提交代码的时候确保提交可用，多次commit一次push，除非紧急需要尽量在午休时间，早上上班前，晚上下班后push代码
- 参考资料:[Gitlab利用Webhook实现Push代码后的jenkins自动构建](https://www.cnblogs.com/kevingrace/p/6479813.html)

### 4. 构建环境

- 没有关键配置的修改，其中Color ANSI Console Output为下载的插件AnsiColor，可以使日志输出带有颜色，详情可查看[Jenkins 的输出日志也可以变得色色的](https://zhuanlan.zhihu.com/p/22032462?refer=debugtalk)

### 5. 构建

- 构建部分主要采用了maven构建，确保部署Jenkins的机器已经配置好了maven环境，maven的配置不做赘述。
  ![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe5243029ee0~tplv-t2oaga2asx-image.image)

### 6. 构建后操作

- 使用maven构建打包完成后，与pom.xml同级的target目录下会生成一个war包(取决于pom.xml中的配置，对pom.xml的配置不做描述)，接下来我们要做的就是将生成的war包部署到中间件或容器中，下面主要介绍两个插件，可以根据实际情况有选择的使用，使用之前首先需要参考之前介绍的步骤下载相应插件。

#### 6.1 Deploy to Container插件

- 达到效果：构建前需保证目标中间件正常启动，每次Jenkins构建时会把指定的war包自动部署到指定的服务器上的context path中，如果目标服务已存在，首先undeploy目标服务，再把新的war包redeloy上去，已完成自动部署的功能。
- 仅支持GlassFish,JBoss,Tomcat
  ![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe52f209ed0b~tplv-t2oaga2asx-image.image)

1. 增加构建后操作步骤中选择Deploy war/ear to a container
2. WAR/EAR files中填上所需要部署的程序包，支持 `**/*.war`的形式
3. Context path配置程序相对于中间件环境的发布路径
4. 本文中Containers我选择了Tomcat 7.x，Credentials需要在tomcat里配置上，Tomcat URL即环境的基础地址

   - 在tomcat中添加授权用户：修改conf/tomcat-users.xml

   ```xml
   <role rolename="manager-script"/>
   <user username="caozeal" password="******" roles="manager-script"/>
   ```

   ![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe5320a4d1de~tplv-t2oaga2asx-image.image)
5. 只是做上边这些配置的话，你会发现Jenkins的自动部署仅支持第一次，已有旧版应用运行时，自动部署会报undeploy失败，原因是在应用运行时，tomcat会对应用的资源进行锁定，导致无法覆盖更新，这时需修改tomcat的另一项配置：conf/context.xml（详情可查看[Tomcat中antiResourceLocking和antiJARLocking的作用](https://blog.csdn.net/yanjun008/article/details/41249753)）

```xml
<Context antiJARLocking="true" antiResourceLocking="true">
```

![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe53331d7314~tplv-t2oaga2asx-image.image)

#### 6.2 Publish Over SSH插件

- 通过SSH操作目标服务，从而传输文件，执行命令已达到目的
- 更灵活，支持各种中间件服务器
- 首先在系统设置中配置上所需连接的远程服务器，配置上相关配置，其中Remote Directory是访问服务器的基础路径，之后步骤能用到
  ![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe5348ff7396~tplv-t2oaga2asx-image.image)
- 然后回到任务配置继续配置构建后操作一块
  ![图片](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/12/1696fe533a949a50~tplv-t2oaga2asx-image.image)
- Remote directory	远程服务器文件夹，空即为默认的上边步骤配置的路径，如果此处不为空，即为相对路径
- Remove prefix 去除前置路径
- Exec command 执行脚本，此处的脚本比较简单，调用目标中间件的停止与启动
- 需要注意的是执行脚本的时候有个坑，读取不到系统的环境变量，原因是此处执行脚本的方式为non-interactive + non-login shell，不会读取/etc/profile中的配置，此处的解决方案是采用bash执行命令，由于bash恒执行BASH_ENV中的变量，因此需要把/etc/profie赋值到BASH_ENV中，详细解决思路参考链接

  - [ssh连接远程主机执行脚本的环境变量问题](https://www.cnblogs.com/asia90li/p/6437677.html)
  - [转：深入了解bash与sh的区别](https://www.cnblogs.com/hopeworld/archive/2011/03/29/1998488.html)

## 三、其他

- 至此已经完成了从开发人员push代码到应用构建、部署等相关操作的基本自动流程，具体细节部分还需要继续深入研究探索
- 遗留问题：
  - Jenkins构建的时候控制台乱码
    - 参考[Jenkins控制台中文输出乱码解决方法](https://www.cnblogs.com/dtest/p/4142825.html)处理
    - 解决之后，Jenkins启动的tomcat发生乱码
  - 自动构建部署的时候，Jenkins调用命令启动StartTAS.sh的时候会一直监听启动日志，直到超时才断开链接，这时候因超时而导致本次构建为黄灯，即不稳定的构建
