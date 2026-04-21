import pandas as pd

from sentence_transformers import SentenceTransformer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

# 1️⃣ Load dataset
df = pd.read_csv("data/emoji_dataset.csv")

print("Dataset distribution:\n", df['Emotion'].value_counts())

# 2️⃣ Generate embeddings
embed_model = SentenceTransformer('all-MiniLM-L6-v2')
X = embed_model.encode(df['Text'].tolist())
y = df['Emotion'].tolist()

# 3️⃣ Train classifier
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

# 4️⃣ Evaluate
y_pred = clf.predict(X_test)
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# 5️⃣ Save models
joblib.dump(clf, "models/emoji_classifier.pkl")
embed_model.save("models/embed_model")
print("Models saved to models/ folder.")
