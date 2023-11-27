guests = ["Li Bai", "Du Fu", "Wang Wei"]

print("I would like to invite " + str(guests) + " to dinner.")

# 王维无法赴约
print("Unfortunately, " + guests[2] + " cannot attend the dinner.")

# 王维无法赴约，因此需要另外邀请一位嘉宾
guests[2] = "Li Qingzhao"

print("I would like to invite " + str(guests) + " to dinner.")

# 找到了更大的餐桌
print("I found a bigger table.")

# 可以增加三位嘉宾
guests.insert(0, "Su Shi")
guests.insert(2, "Ouyang Xiu")
guests.append("Bai Juyi")

print("I would like to invite " + str(guests) + " to dinner.")

# 新买的餐桌无法送达，只能邀请两位嘉宾
print("Unfortunately, the new table cannot be delivered on time.")

while len(guests) > 2:
    print("Sorry, " + guests.pop() + ", I cannot invite you to dinner.")

for guest in guests:
    print("Hi, " + guest + ", you are still invited to dinner.")

del guests[0]
del guests[0]

print(guests)
