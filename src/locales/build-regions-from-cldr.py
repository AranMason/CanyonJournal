import json
from pathlib import Path

language = "en"


import os
file_path = os.path.dirname(os.path.realpath(__file__))
print(file_path)


# Option A: Load directly from a file object
with open(f"{file_path}/{language}/ref/territories.json", "r", encoding="utf-8") as f, open(f"{file_path}/{language}/ref/subdivisions.json", "r", encoding="utf-8") as f2:
    territories = json.load(f)["main"]["en-001"]["localeDisplayNames"]["territories"]
    subdivisions = json.load(f2)["subdivisions"]["localeDisplayNames"]["subdivisions"]

    merged = {**territories, **subdivisions}

    with open(f"{file_path}/{language}/regions.json", 'w', encoding='utf-8') as f:
        json.dump(merged, f, ensure_ascii=False, indent=4)