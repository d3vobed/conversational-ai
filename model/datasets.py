import json
import random

emotions = ["lonely", "confused", "sadness", "frustrated", "scared"]
intents = ["seek_reassurance", "express_confusion", "seek_support", "vent", "request_help"]
difficulties = ["easy", "moderate", "hard"]
tags_pool = [
    ["memory", "forgetting", "support"],
    ["family", "burden", "dementia"],
    ["confusion", "orientation", "safety"],
    ["fear", "loneliness", "aging"],
    ["support", "validation", "love"]
]

en_templates = [
    ("I feel like {emotion}.", "You're not alone. You're understood."),
    ("I'm always {emotion}, it's scary.", "That sounds tough. I'm here to support you."),
    ("Sometimes I just feel so {emotion}.", "You're valued. Let's work through this together."),
    ("Why do I keep forgetting things?", "It's okay. Memory issues happen, and you’re not alone."),
    ("I don’t know where I am.", "Let’s take a deep breath. I can help guide you.")
]

fr_templates = [
    ("Je me sens {emotion}.", "Tu n'es pas seul. Je suis là pour toi."),
    ("Je suis toujours {emotion}, c'est effrayant.", "C'est dur. Je te comprends."),
    ("Parfois je me sens si {emotion}.", "Tu comptes beaucoup. Ensemble, on va y arriver."),
    ("Pourquoi j'oublie tout le temps ?", "Ce n'est pas grave. Ça arrive à beaucoup de gens."),
    ("Je ne sais pas où je suis.", "Respire un peu. Je vais t'aider.")
]

def create_entry(lang):
    templates = en_templates if lang == "en" else fr_templates
    input_template, response = random.choice(templates)
    emotion = random.choice(emotions)
    intent = random.choice(intents)
    tags = random.choice(tags_pool)
    difficulty = random.choice(difficulties)
    input_text = input_template.format(emotion=emotion)

    return {
        "input": input_text,
        "response": response,
        "emotion": emotion,
        "intent": intent,
        "tags": tags,
        "care_mode": True,
        "language": lang,
        "difficulty": difficulty,
        "is_dementia_related": True
    }

# Generate samples
en_data = [create_entry("en") for _ in range(100)]
fr_data = [create_entry("fr") for _ in range(50)]
all_data = en_data + fr_data
random.shuffle(all_data)

# Smart split
train = all_data[:int(0.7 * len(all_data))]
validation = all_data[int(0.7 * len(all_data)):int(0.9 * len(all_data))]
test = all_data[int(0.9 * len(all_data)):]

# Save
with open("dementia_train_split.json", "w", encoding="utf-8") as f:
    json.dump(train, f, indent=2, ensure_ascii=False)

with open("dementia_validation_split.json", "w", encoding="utf-8") as f:
    json.dump(validation, f, indent=2, ensure_ascii=False)

with open("dementia_test_multilang.json", "w", encoding="utf-8") as f:
    json.dump(test, f, indent=2, ensure_ascii=False)

print("✅ Generated dataset splits: train/validation/test")
