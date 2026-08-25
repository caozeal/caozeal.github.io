---
title: DeepSeek Harness 初体验
date: 2026-08-14 12:00:00
index_img: /resources/dsh-first-look/PixPin_2026-08-14_09-12-36.jpg
banner_img: /resources/dsh-first-look/PixPin_2026-08-14_09-12-36.jpg
categories:
  - AI
tags:
  - DeepSeek
  - 体验手记
---

多次听到DeepSeek Harness（dsh）的消息传出，直到8月13日终于发布V0.1开发者预览版，DeepSeek一直是能给人惊喜的，我们也一起来体验一下。

## 一、安装

如果你已经在使用了其他Agent（如Codex, Claude Code, OpenClaw等），安装还是比较容易的，可以把git项目（https://github.com/deepseek-ai/deepseek-harness）直接丢给它让它安装，或者直接执行`npx @deepseek-ai/dsh web`命令来使用。

安装后浏览器访问 http://127.0.0.1:3080 便能打开 Web UI，可以看到内测声明，也就是当前主要面向的对象是开发者，不适合希望一键安装、稳定使用Agent的用户，还有很多需要折腾的元素在里边。

![PixPin_2026-08-14_09-27-36](/resources/dsh-first-look/PixPin_2026-08-14_09-27-36.png)

我们按照提示输入API Key, 便进入了对话主界面。
![PixPin_2026-08-14_09-33-18](/resources/dsh-first-look/PixPin_2026-08-14_09-33-18.png)

## 二、一切皆插件：底座的地基

它和市面上已经成熟的Agent有什么不同呢？回头看dsh官网，赫然五个大字 —— 一切皆插件，这是和其他Agent打出差异化的关键点。

> DeepSeek Harness 基于具有时空可组合性的 Cordis 插件系统构建。Cordis 元框架只负责插件的加载与卸载以及依赖关系，Agent Harness 的所有具体组件都是不同的 Cordis 插件。插件通过 Cordis 服务与事件彼此协作，并可以在配置层自由组合。

和它最像的感觉是 Pi Agent，但又有不同，Pi Agent 是把 Agent 本身做的尽量精简，更多的功能通过插件来丰富，**Pi Agent 的“插件”**：是**功能扩展包**。插件通过基座预留的“钩子”（Hooks）来介入工作流，但不能改变基座引擎本身的运行机制。而dsh的插件是一等公民，插件可以重写基座的任何行为，甚至可以替换Agent循环本身。插件之间可以互相依赖，像搭建积木一样，共同构成一个新的功能。

![PixPin_2026-08-14_09-12-36](/resources/dsh-first-look/PixPin_2026-08-14_09-12-36.jpg)

可以说，dsh本身就是由插件构成的。

打开设置，我们看到刚安装就已经有了一批颇为庞大的插件群。我们可以以插件的方式独立选择、替换或扩展其中的任一能力。

大家可以参考官方文档来开发扩展：
https://deepseek-harness.github.io/deepseek-harness/reference/cordis-primer

![PixPin_2026-08-14_09-53-49](/resources/dsh-first-look/PixPin_2026-08-14_09-53-49.png)

## 三、运行与可观测：四种模式 × Trajectory

回到首页会话，我们再来看四种运行模式 —— 标准模式、PTC（Programmatic Tool Calling）模式、极简模式、创造模式。

正常开发使用标准模式足矣，PTC模式把多轮工具调用合成一段程序一次跑完，更快也更省上下文，同样地也适合稳定、精确的、可复现的自动化流程，想要扩展模式则使用创造模式来添加适合自己的模式。

![PixPin_2026-08-14_10-14-41](/resources/dsh-first-look/PixPin_2026-08-14_10-14-41.png)

用标准模式来体验一下

![PixPin_2026-08-14_10-27-00](/resources/dsh-first-look/PixPin_2026-08-14_10-27-00.png)

整个过程很丝滑，具体能力还需要长期使用感受。我们看到对话旁边有轨迹（Trajectory）的tab，很详细地记录了系统提示词、思维链、工具调用与结果、子 Agent 调度，以及每一次上下文注入。这对于优化使用、调试、构建稳定可复用的 Agent 流程十分有用。
![PixPin_2026-08-14_10-28-29](/resources/dsh-first-look/PixPin_2026-08-14_10-28-29.jpg)


## 四、远程访问

既然是 Web UI，第一想法就是可以随时随地进行交互了——原生界面，拥有全部完整的体验。

直接暴露到公网肯定是不安全的，我习惯的做法是使用**WireGuard**构建私有内网，仅开放WG网络访问，当然也可以使用 TailScale，国内则可以用节点小宝等组网 App 来实现同样的效果。

默认是绑定到127.0.0.1的，无法远程访问，尝试将其绑定到0.0.0.0

```zsh
pnpm dsh web --host 0.0.0.0 --port 3080
```

结果直接遇到报错： 
```log
  error: --host 0.0.0.0 is intentionally not supported yet for safety:
  it would expose remote code execution to the network; use 127.0.0.1 instead
```

看来也是有着安全拦截的，绑到所有网卡等于把远程代码执行能力暴露给网络。CLI 在第一道门就把最危险的配置拒了。

那我只绑 WG 接口行不行？

```bash
pnpm dsh web --host 10.0.0.2 --port 3080
```

仍然报了错：

```log
- $.host expected "127.0.0.1" | "0.0.0.0" but got "10.0.0.2" (at host)
```

结论很清晰：这个版本里，dsh web 事实上只能听 127.0.0.1，没有任何官方支持的远程绑定路径。

那就换个思路：dsh 不动，让它继续只听 127.0.0.1，我们在外面加一个转发，把 WG 接口上的请求递进去，这就得使用socat的端口转发能力了（没装的话 brew install socat）。

  **转发 + 启动**

  ```zsh
  socat TCP-LISTEN:3080,bind=10.0.0.2,fork,reuseaddr TCP:127.0.0.1:3080 &
  pnpm dsh web --port 3080 --trusted-host 10.0.0.2:3080
  ```

  两个要点：

  - socat 的 `bind=10.0.0.2` 让转发**只开在 WG 隧道接口上**，局域网网卡完全不涉及
  - `--trusted-host 10.0.0.2:3080` 必须加，dsh 的 API 会校验请求的 Host 是否在白名单里，不在的直接 403（实测过）

通过这样配置，就可以在WG网络中的任何一台设备上进行交互了，~~（上下班路上也可以愉快工作了）~~

## 五、探索未至之境

正如对话界面的标题：**探索未至之境**，DeepSeek 之所以这么火，不只是因为其价格屠夫的称号，也不仅是其能研发前沿模型的能力，更多的还是，一次又一次地，让我们看到AI不同的一面，更多的可能，以及更多元的未来。

![dsh-尾图-深探索](/resources/dsh-first-look/dsh-尾图-深探索.jpg)
