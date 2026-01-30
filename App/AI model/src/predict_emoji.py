import joblib
from sentence_transformers import SentenceTransformer

# Load models
clf = joblib.load("models/emoji_classifier.pkl")
embed_model = SentenceTransformer("models/embed_model")

# Map emotions to emojis
emotion_to_emoji = {
    "happy": "😊",
    "sad": "😢",
    "love": "❤️",
    "neutral": "😐",
    "angry": "😠",
    "surprise": "😲"
}

# Optional keyword fallback
keywords = {
    "sad": "😢",
    "unhappy": "😢",
    "happy": "😊",
    "love": "❤️",
    "like": "❤️"
}

def predict_emoji(text):
    # Check keywords first
    for word, emoji in keywords.items():
        if word in text.lower():
            return emoji
    
    # Model prediction
    vec = embed_model.encode([text])
    emotion = clf.predict(vec)[0]
    return emotion_to_emoji.get(emotion, "😐")  # Default neutral

# Example usage
if __name__ == "__main__":
    texts = [
        "I am so happy today!",
        "I feel very sad",
        "I love programming",
        "Just another normal day",
        "hello"
    ]
    for t in texts:
        print(t, "→", predict_emoji(t))
