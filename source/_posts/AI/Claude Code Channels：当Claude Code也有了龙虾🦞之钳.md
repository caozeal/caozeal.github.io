---
title: Claude Code Channels：当Claude Code也有了龙虾🦞之钳
date: 2026-03-20 12:00:00
index_img: /resources/cc-channels/Pasted-image-20260320150155.png
banner_img: /resources/cc-channels/Pasted-image-20260320150155.png
categories:
  - AI
tags:
  - Claude Code
  - OpenClaw
---

OpenClaw 靠 channels这只钳子——QQ、飞书、钉钉——伸进了我们的日常聊天里。而现在，Claude Code也长出了同样的钳子。

说实话，看到 Channels 这个功能，我是有点兴奋的。
这功能表面不算炸裂，但我会觉得它很关键。
它不只是多接了个 聊天渠道，而是 Claude Code 开始真正往外伸手了。
我们可能不再需要通过龙虾去指挥CC编写代码，而是直接通过聊天工具对话CC。

不过目前还只是支持claude.ai登录，不支持控制台和 API 密钥身份验证，后面也许会逐渐放开。

文档中是这样介绍的：
> Channel 是一个将事件推送到正在运行的 Claude Code 会话中的 MCP 服务器，因此 Claude 可以在你不在终端时对发生的事情做出反应。Channel 可以是双向的：Claude 读取事件并通过同一个 Channel 回复，就像聊天桥接一样。事件仅在会话打开时到达，因此为了实现始终在线的设置，你需要在后台进程或持久终端中运行 Claude。

![](/resources/cc-channels/Pasted-image-20260320150155.png)

这个功能真正值得看的地方，不是“Claude Code 终于也能接聊天工具了”，而是它开始承认一件事：一个足够有用的 agent，不应该永远坐在终端里等命令。

它得能被触达，得能在你不盯着它的时候继续跟外面保持连接。

大家感兴趣的话，可以直接查看官方文档介绍：https://code.claude.com/docs/en/channels
