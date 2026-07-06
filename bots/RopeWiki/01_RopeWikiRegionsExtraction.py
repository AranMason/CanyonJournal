import requests
import json
import csv
from pathlib import Path

URL = "https://ropewiki.com/api.php"
BASE_DIR = Path(__file__).resolve().parent
MAP_FILE_PATH = BASE_DIR / "cache" / "RopeWikiRegionCodeMap.json"
REGION_SET_MAP_PATH = BASE_DIR / "ref_data" / "RegionSetMap.csv"

region_code_map = {}

# 2. Setup pagination loops for the Semantic API
base_query = "[[Category:Regions]]|format=tree|root=World|parent=Located in region|?Located in region|?pageid"
current_offset = 0
new_regions_count = 0

print("Scanning RopeWiki for regions...")


def load_region_code_overrides(file_path):
    overrides = {}

    with open(file_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            region_name = (row.get("RopeWiki Region") or "").strip()
            raw_code = (row.get("HandLinne Code") or "").strip()

            if not region_name:
                continue

            # Blank value in CSV should remain null in output JSON.
            code = raw_code or None

            # Keep the first non-null mapping if duplicates exist.
            if region_name in overrides and overrides[region_name] is not None:
                continue

            overrides[region_name] = code

    return overrides


region_code_overrides = load_region_code_overrides(REGION_SET_MAP_PATH)

print (region_code_overrides)

def extract_parent_region(printouts):
    parents = printouts.get("Located in region", [])
    if not parents:
        return None

    first_parent = parents[0]
    if isinstance(first_parent, dict):
        return first_parent.get("fulltext")

    return first_parent

while True:
    # Append the offset dynamically to handle pages seamlessly
    animated_query = f"{base_query}|offset={current_offset}"
    
    params = {
        "action": "ask",
        "query": animated_query,
        "format": "json"
    }
    
    response = requests.get(url=URL, params=params)
    data = response.json()

    results = data.get("query", {}).get("results", {})
    
    if not results:
        break  # Break loop if server returns no more regions
        
    for name, details in results.items():
        # Only add the region if it doesn't already exist in your JSON file
        # This protects your manual country code entries from being overwritten!
        if name not in region_code_map:
            printouts = details.get("printouts", {})
            region_code_map[name] = {
                "code": region_code_overrides.get(name),
                "parent": extract_parent_region(printouts)
            }
            new_regions_count += 1
            
    # Check for SMW pagination token
    if "query-continue-offset" in data:
        current_offset = data["query-continue-offset"]
    else:
        break

# 3. Sort the dictionary alphabetically by region name so it's clean to edit manually
sorted_region_map = dict(sorted(region_code_map.items()))

# 4. Save the file back to disk
with open(MAP_FILE_PATH, "w", encoding="utf-8") as j:
    json.dump(sorted_region_map, j, indent=4, ensure_ascii=False)

print(f"\nExtraction complete!")
print(f"Added {new_regions_count} new regions.")
print(f"Total entries in '{MAP_FILE_PATH}': {len(sorted_region_map)}")
print("You can now safely open the file and add your country codes.")