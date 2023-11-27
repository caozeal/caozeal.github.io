with open('pi_digits.txt') as file_object:
    contents = file_object.read()
    print(contents.rstrip())

a = 'test\n\r\ttest'
b = r'test\n\r\ttest'
print(a)
print(b)

with open('pi_digits.txt') as file_object:
    for line in file_object:
        print(line.rstrip())