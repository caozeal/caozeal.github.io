---
title: 为什么我推荐 Orca?
date: 2026-08-21 12:00:00
index_img: /resources/why-orca/PixPin_2026-08-03_19-46-03.png
banner_img: /resources/why-orca/PixPin_2026-08-03_19-46-03.png
categories:
  - AI
tags:
  - Orca
  - 工具
---

# 为什么我推荐 Orca？

我已经连续使用 Orca 一个多月，并逐渐把大部分 AI Coding 工作迁移到了这里。

我推荐它，不是因为 Orca 又提供了一个和 Agent 对话的界面，而是因为当 Codex、Claude Code、OpenCode 同时进入工作流后，真正麻烦的已经不是“怎么让 Agent 写代码”，而是怎么管理任务、Worktree、终端和远程执行。

Orca 解决的正是这一层问题：它本身不提供模型能力，而是站在多个 Coding Agent 之上，负责把原本散落的工作流组织起来。

## 一、Orca 是什么？

> Orca 官方将它定义为“面向 100x 构建者的 AI 编排器”：可以并排运行 Codex、Claude Code、OpenCode 或 Pi，让每个 Agent 在自己的 Worktree 中工作，并在一个地方统一跟踪。

如果只看产品形态，Orca 很像是把多个 Agent 终端放进了一个桌面应用。但实际用下来，它真正有价值的地方不是“多开几个终端”，而是将项目、任务、 Worktree 和 Agent 组织成了一套完整的工作流。

传统的做法是自己打开几个终端，分别进入不同目录，再手动记住每个 Agent 在做什么、改了哪些文件。当任务只有一个时，这种方式当然没有问题；但当我开始同时使用多个 Agent，这些原本零散的细节就会变成额外的管理成本。

所以 Orca 给我的感受并不是“多了一个对话界面”，而是给这些 Agent 补上了一层统一的工作组织。

我推荐它，主要是因为这几点：

- **跨 Agent 编排与统一管理**
- **多 Worktree 并行工作**
- **远程执行与指挥**：远程 Orca 服务器、SSH 以及移动端 Orca Relay

这些能力的具体使用方式，我会放到后面的文章中分别展开。这篇先说清楚一件事：**Orca 本身不提供 Agent 或模型能力，但它能让多 Agent 工作流更容易组织和管理。**

它更适合愿意阅读 Diff、关注提交并管理 Worktree 的开发者，不适合寻找无代码工具，或者希望 AI 完全代替工程判断的人。

如果你已经在使用 Codex、Claude Code 或其他 Coding Agent，又希望把多个任务放在一个清晰的工作流里管理，那么 Orca 值得亲自试一下。下面先从最基础的安装和项目创建开始。

![PixPin_2026-08-03_19-46-03](/resources/why-orca/PixPin_2026-08-03_19-46-03.png)

## 二、安装和使用

> https://www.onorca.dev

我们可以访问 Orca 官网下载安装。安装好后就可以看到主界面，我们先来管理一下智能体“团队”（设置 -> 智能体）：
![PixPin_2026-08-10_10-09-16](/resources/why-orca/PixPin_2026-08-10_10-09-16.png)


这里可以看到已经安装的智能体，并且可以对这些 Agent 进行一些基础设置。

然后，我们可以在主界面左上角的 Projects 处添加项目：

![PixPin_2026-08-10_10-06-32](/resources/why-orca/PixPin_2026-08-10_10-06-32.png)

接着，可以选择新建 Worktree，或者直接在当前空间中新建 Agent。完成后，就可以像平时一样与 Agent 对话了。

![PixPin_2026-08-10_10-11-47](/resources/why-orca/PixPin_2026-08-10_10-11-47.png)

如果你不习惯命令行模式，也可以使用对话界面，左上角可以切换这两种模式。

![PixPin_2026-08-11_11-20-06](/resources/why-orca/PixPin_2026-08-11_11-20-06.png)

我想吐槽的一点是它的宠物功能。这也是当下各大 Agent 陆续推出的辅助功能，可以用来提醒任务，也增加一点乐趣。我们可以在“实验性”中打开，使用默认宠物，或者自制并从 Codex 中导入。

![PixPin_2026-08-11_12-01-46](/resources/why-orca/PixPin_2026-08-11_12-01-46.png)

不同于 Codex，Orca 的宠物无法脱离窗口，且动作判定也比较奇怪，导致宠物会一直跑动。可能是直接从 Codex 导入的原因，实际体验不是很好。

## 三、最后

Orca 更像是把多个 Agent 管理起来的工作台。偶尔用一次 Agent，可能感觉不到它的价值；但如果你已经开始并行使用 Codex、Claude Code、OpenCode，Orca 确实能省下不少管理上的麻烦。

后面我会再详细介绍我认为更重要的功能：Agent 编排、移动端 Relay、Orca 服务端、 浏览器控制等等，以及其他实际使用中的体验。
