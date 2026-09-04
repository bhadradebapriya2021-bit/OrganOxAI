"""Train a portable seven-class XGBoost model on dirty_v3_path.csv."""
import json
import sys
from pathlib import Path
import pandas as pd
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

SOURCE_COLUMNS = ["Age", "Gender", "Glucose", "Blood Pressure", "BMI", "Oxygen Saturation", "LengthOfStay", "Cholesterol", "Triglycerides"]
KEYS = {"Age": "age", "Gender": "gender", "Glucose": "glucose", "Blood Pressure": "bloodPressure", "BMI": "bmi", "Oxygen Saturation": "oxygenSaturation", "LengthOfStay": "lengthOfStay", "Cholesterol": "cholesterol", "Triglycerides": "triglycerides"}

def encode(frame):
    data = frame[SOURCE_COLUMNS].rename(columns=KEYS).copy()
    data["gender"] = data["gender"].fillna("other").str.lower()
    return pd.get_dummies(data, columns=["gender"], dtype=float)

def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python train_xgboost.py <dirty_v3_path.csv>")
    source = Path(sys.argv[1]).resolve()
    frame = pd.read_csv(source).dropna(subset=["Medical Condition"]).copy()
    labels = LabelEncoder()
    target = labels.fit_transform(frame["Medical Condition"].astype(str))
    features = encode(frame)
    train_x, test_x, train_y, test_y = train_test_split(features, target, test_size=0.15, random_state=42, stratify=target)
    model = XGBClassifier(n_estimators=140, max_depth=4, learning_rate=0.06, subsample=0.9, colsample_bytree=0.9, objective="multi:softprob", num_class=len(labels.classes_), eval_metric="mlogloss", base_score=0.5, random_state=42, n_jobs=1)
    model.fit(train_x, train_y)
    predictions = model.predict(test_x)
    payload = {
        "modelType": "XGBoost decision-tree ensemble",
        "task": "Seven-class medical-condition classification",
        "sourceDataset": source.name, "datasetOwner": "abdallaahmed77",
        "datasetRows": len(frame), "trainingRows": len(train_x), "testRows": len(test_x),
        "trainingPercent": 85, "testPercent": 15,
        "classes": labels.classes_.tolist(), "classCount": len(labels.classes_),
        "featureColumns": features.columns.tolist(),
        "trees": [json.loads(tree) for tree in model.get_booster().get_dump(dump_format="json")],
        "metrics": {
            "accuracy": round(float(accuracy_score(test_y, predictions)), 4),
            "macroF1": round(float(f1_score(test_y, predictions, average="macro")), 4),
            "weightedF1": round(float(f1_score(test_y, predictions, average="weighted")), 4),
        },
        "preprocessing": "Missing numeric values retained as missing for XGBoost; missing gender encoded as other.",
    }
    output = Path(__file__).parent / "xgboost-model.json"
    output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps({"output": str(output), **payload["metrics"], "train": len(train_x), "test": len(test_x)}, indent=2))

if __name__ == "__main__":
    main()
