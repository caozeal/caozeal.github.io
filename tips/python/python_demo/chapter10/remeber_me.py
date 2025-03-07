import json


file_name = 'username.json'
try:
    with open(file_name) as file_object:
        username = json.load(file_object)
except FileNotFoundError:
    username = input("What is your name? ")
    with open(file_name, 'w') as file_object:
        json.dump(username, file_object)
        print("We'll remember you when you come back, " + username + "!")
else:
    print("Welcome back, " + username + "!")