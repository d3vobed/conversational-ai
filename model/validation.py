import json
import random

with open("dementia_train_multilang.json", "r") as f:
    data = json.load(f)["train"]

# Shuffle and split
random.seed(42)  
random.shuffle(data)
split_index = int(len(data) * 0.9)
train_split = data[:split_index]
val_split = data[split_index:]

with open("dementia_train_split.json", "w") as f:
    json.dump({"train": train_split}, f, indent=2, ensure_ascii=False)

with open("dementia_validation_split.json", "w") as f:
    json.dump({"validation": val_split}, f, indent=2, ensure_ascii=False)

print(f" New training set size: {len(train_split)}")
print(f" Validation set size: {len(val_split)}")
