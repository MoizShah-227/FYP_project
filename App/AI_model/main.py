from pathlib import Path

import pandas as pd

csv_path = Path(__file__).resolve().parent / "data" / "emoji_dataset.csv"
if not csv_path.is_file():
    raise FileNotFoundError(
        f"Missing dataset: {csv_path}. Add emoji_dataset.csv under AI_model/data/ "
        "(see src/train_model.py)."
    )

df = pd.read_csv(csv_path)

# Check distribution
print(df['emotion'].value_counts())
