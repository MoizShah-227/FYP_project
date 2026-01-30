import pandas as pd

# Load CSV
df = pd.read_csv("emoji_dataset.csv")

# Check distribution
print(df['emotion'].value_counts())
