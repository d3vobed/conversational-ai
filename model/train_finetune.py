from transformers import T5Tokenizer, T5ForConditionalGeneration, Trainer, TrainingArguments
from datasets import load_dataset
from datasets import DatasetDict
import os

# Load tokenizer and model
model = T5ForConditionalGeneration.from_pretrained("t5-base")
tokenizer = T5Tokenizer.from_pretrained("t5-base")

# Load JSON datasets from local files
data_files = {
    "train": "dementia_train_split.json",
    "validation": "dementia_validation_split.json",
    "test": "dementia_test_multilang.json"
}
dataset = load_dataset("json", data_files=data_files)

# Convert to DatasetDict (required for .map with remove_columns)
dataset = DatasetDict(dataset)

# Preprocessing function to tokenize inputs and outputs
def preprocess(example):
    prefix = "émotion: " if example.get("language", "en") == "fr" else "emotion: "
    input_enc = tokenizer(
        prefix + example["input"],
        padding="max_length",
        truncation=True,
        max_length=128
    )
    target_enc = tokenizer(
        example["response"],
        padding="max_length",
        truncation=True,
        max_length=128
    )
    input_enc["labels"] = target_enc["input_ids"]
    return input_enc

# Tokenize and clean up metadata
tokenized_dataset = dataset.map(
    preprocess,
    remove_columns=["input", "response", "emotion", "intent", "tags", "care_mode", "language", "difficulty", "is_dementia_related"]
)

# Define training arguments
args = TrainingArguments(
    output_dir="./model",
    num_train_epochs=4,
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    eval_strategy="epoch",
    save_strategy="epoch",
    logging_dir="./logs",
    logging_steps=10,
    save_total_limit=2,
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss"
)

# Define the Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
    eval_dataset=tokenized_dataset["validation"]
)

# Start training
trainer.train()

# Save and push the final model
trainer.save_model("./model")
tokenizer.save_pretrained("./model")

# Optional: Push to HF hub (requires `huggingface-cli login`)
if training_args.push_to_hub:
    trainer.push_to_hub()
    tokenizer.push_to_hub("obx0x3/empathy-dementia")

print("✅ Model trained and saved!")

