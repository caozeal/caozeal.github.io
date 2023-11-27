for num in range(1, 21):
    print(num)

millions = list(range(1, 1000001))

print(min(millions))
print(max(millions))

print(sum(millions))

odds = list(range(1, 21, 2))

for odd in odds:
    print(odd)

multiples = list(range(3, 31, 3))

for multiple in multiples:
    print(multiple)

cubes = [value ** 3 for value in range(1, 11)]
print(cubes)