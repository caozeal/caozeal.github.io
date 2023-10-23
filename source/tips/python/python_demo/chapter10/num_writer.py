import json


numbers = [2, 3, 4, 5, 6, 7, 8, 9, 10]
file_name = 'numbers.json'
with open(file_name, 'w') as file_object:
    json.dump(numbers, file_object)

with open(file_name) as file_object:
    numbers = json.load(file_object)
print(numbers)