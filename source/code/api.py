# -*- coding: utf-8 -*-
import openai

# 设置API访问密钥
openai.api_key = "---"

# 设置请求参数
temperature = 0.5
max_tokens = 50
messages = [
        {"role": "system", "content": "You are a helpful assistant."},
    ]

user_message = input("user: ")
assistant_message = ""
while user_message != "exit":
    messages.append({"role": "user", "content": user_message})
    # 发送API请求
    stream = openai.ChatCompletion.create(
        model="gpt-4",  # gpt-3.5-turbo
        messages=messages,
        stream=True,
    )

    # 处理响应
    for chunk in stream:
        for choice in chunk['choices']:  # type: ignore
            if 'delta' in choice:
                if 'role' in choice['delta']:
                    print(choice['delta']['role'], end=': ')
                if 'content' in choice['delta']:
                    print(choice['delta']['content'], end='')
                    assistant_message = assistant_message + choice['delta']['content']
            else:
                print("Error:", choice)
    
    messages.append({"role": "assistant", "content": assistant_message})
    user_message = input("\nuser: ")
