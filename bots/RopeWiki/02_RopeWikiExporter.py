import requests
import csv
import json
import re
import os
from datetime import datetime, timedelta, timezone


URL = "https://ropewiki.com/api.php"
MINIMUM_RATINGS = 3
REGIONS_PER_BATCH = 50 # We need to batch the exports, otherwise we run into pagination limits of the export

COORDS_MAP_FILE = './cache/RopeWikiCoordsMap.json'
REGION_COUNTRY_CODE_MAP_FILE = './cache/RopeWikiRegionCodeMap.json'


def load_json_object(file_path):
    if not os.path.exists(file_path):
        return {}

    with open(file_path, encoding='utf-8') as j:
        content = j.read().strip()

    if not content:
        return {}

    data = json.loads(content)
    if not isinstance(data, dict):
        raise ValueError(f"Expected JSON object in {file_path}")

    return data

COORDS_CODE_MAP = {}
COORDS_CODE_MAP = load_json_object(COORDS_MAP_FILE)

REGION_COUNTRY_CODE_MAP = {}
REGION_COUNTRY_CODE_MAP = load_json_object(REGION_COUNTRY_CODE_MAP_FILE)

# geolocator = geopy.Nominatim(user_agent="hand_linne")

# The base query template (will be filled with region conditions)
base_query_template = (
    "[[Category:Canyons]]{region_conditions}"
    "|?Has pageid"
    "|?Has coordinates"
    "|?Located in region"
    "|?Has rating"
    "|?Has vertical rating"
    "|?Has aquatic rating"
    "|?Has commitment rating"
    "|?Has technical rating"
    "|?Has water rating"
    "|?Has time rating"
    "|?Has total rating"
    "|?Has total counter"
)

# Start tracking the offset as an integer variable
current_offset = 0
count = 0

csv_filename = "ropewiki_canyons_extracted.csv"

# Helper function to safely extract the first item or return default
def safe_extract(printout_list, default=""):
    if printout_list and len(printout_list) > 0:
        # If SMW returns a sub-object (like a nested dict for internal wiki links), 
        # convert it to string or fetch its text key
        if isinstance(printout_list[0], dict) and "fulltext" in printout_list[0]:
            return printout_list[0]["fulltext"]
        return printout_list[0]
    return default

print("Starting extraction and writing to CSV...")


def utc_now_iso():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()

def convert_commitment_rating(rating):
    match rating:
        case "":
            return 0
        case "I":
            return 1
        case "II":
            return 2
        case "III":
            return 3
        case "IV":
            return 4
        case "V":
            return 5
        case "VI":
            return 6
        case "VII":
            return 7
    raise Exception("Cannont convert {rating} to a numerical value")

def extract_vertical_rate(printouts):
    vert = safe_extract(printouts.get("Has technical rating"))
    if(vert):
        return vert
    return safe_extract(printouts.get("Has vertical rating")) or None

def extract_aquatic_rating(printouts):
    aqua = safe_extract(printouts.get("Has water rating"))
    if(aqua):
        return aqua
    return safe_extract(printouts.get("Has aquatic rating")) or None

def extract_commitment_rating(printouts):
    commitment = safe_extract(printouts.get("Has commitment rating")) or safe_extract(printouts.get("Has time rating"))
    return convert_commitment_rating(commitment) or None

def extract_star_rating(row, printouts):
    # We only accept star ratings from RopeWiki that have hit the minimum threshold
    ropewiki_rating = safe_extract(printouts.get("Has total rating"))
    total_ratings = int(safe_extract(printouts.get("Has total counter")))

    row["RopeWiki Rating"] = ropewiki_rating
    row["RopeWiki Rating Total"] = total_ratings

    if(total_ratings < MINIMUM_RATINGS):
        row["Star Rating"] = 0
        return
    row["Star Rating"] = int(ropewiki_rating)


pattern = re.compile(r'[vV](?P<v>[1-7])[&nbsp;<i>|</i>|\s]*[aA](?P<a>[1-7])[&nbsp;|<i>|</i>|\s]*(?P<c>IV|VI|VII|IV|III|II|I|V){0,1}')

def extract_ratings(row, printouts): 
    
    rating = safe_extract(printouts.get("Has rating"))
    match = pattern.search(rating) if rating else None
    
    if(not match):
        row["Vertical Rating"] = extract_vertical_rate(printouts)
        row["Aquatic Rating"] = extract_aquatic_rating(printouts)
        row["Commitment Rating"] = extract_commitment_rating(printouts)
        
    else: 
        groups = match.groupdict()

        v_rating = groups.get('v') or "1"
        a_rating = groups.get('a') or "1"
        c_rating = convert_commitment_rating(groups.get('c') or "I")

        if(not v_rating and not a_rating and not c_rating):
            row["Vertical Rating"] = extract_vertical_rate(printouts)
            row["Aquatic Rating"] = extract_aquatic_rating(printouts)
            row["Commitment Rating"] = extract_commitment_rating(printouts)

        row["Vertical Rating"] = v_rating
        row["Aquatic Rating"] = a_rating
        row["Commitment Rating"] = c_rating

    # Must have at least vertical and aquatic rating to be counted as rated.
    # TODO: Determine if we allow 'Zero' commitment rating
    v_rate = row["Vertical Rating"]
    a_rate = row["Aquatic Rating"]

    row["Is Rated"] = (
        isinstance(v_rate, int) and v_rate > 0 and 
        isinstance(a_rate, int) and a_rate > 0
    )

missing_regions = []
def get_region_code(region, path): 

    path.append(region)
    if not region:
        missing_regions.append(path)
        return None
    
    if region in REGION_COUNTRY_CODE_MAP:
        region_map_data = REGION_COUNTRY_CODE_MAP[region]
    else:
        missing_regions.append(path)
        return None

    if not region_map_data["code"]:
        return get_region_code(region_map_data["parent"], path)
    return region_map_data["code"]



def extract_country_code(row):
    region = (row.get("Region") or "").strip()

    row["Region Code"] = get_region_code(region, [])
    return

def mark_row_is_valid(row):

    if not row["Region Code"]:
        row["Is Valid"] = False
        row["Error"] = "Could not resolve location" 
        return
    if row["Region Code"] == "gb":
        row["Is Valid"] = False
        row["Error"] = "UK Canyons provided by Canyon Log"
        return
    row["Is Valid"] = True
    row["Error"] = ""

try:
    # Load region map to get all regions
    region_map = load_json_object(REGION_COUNTRY_CODE_MAP_FILE)
    region_names = sorted(region_map.keys())
    
    print(f"Loaded {len(region_names)} regions from region map.")
    print(f"Will process regions in batches of {REGIONS_PER_BATCH}...\n")
    
    with open(csv_filename, mode='w', newline='', encoding='utf-8') as file:
        fieldnames = ["Id", "Name", "Url", "Coordinates_Lat", "Coordinates_Lon", "Region", "Region Code", "RopeWiki Rating", "Vertical Rating", "Aquatic Rating", "Commitment Rating", "RopeWiki Rating", "RopeWiki Rating Total", "Star Rating", "Is Rated", "Is Valid", "Error"]
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        
        # Process regions in batches
        for batch_idx in range(0, len(region_names), REGIONS_PER_BATCH):
            batch_regions = region_names[batch_idx:batch_idx + REGIONS_PER_BATCH]
            region_conditions = "[[Located in region::" + "||".join(batch_regions) + "]]"
            
            print(f"Batch {batch_idx // REGIONS_PER_BATCH + 1}: Querying {len(batch_regions)} regions ({batch_regions[0]} to {batch_regions[-1]})...")
            
            current_offset = 0
            batch_count = 0
            
            while True:
                # Build query with region conditions and offset
                animated_query = f"{base_query_template.format(region_conditions=region_conditions)}|offset={current_offset}"
                
                params = {
                    "action": "ask",
                    "query": animated_query,
                    "format": "json"
                }
                
                response = requests.get(url=URL, params=params)
                data = response.json()

                # Log raw response for debugging
                with open("ropewiki_raw_response.json", "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                
                results = data.get("query", {}).get("results", {})
                
                # Break out if the server returns no more results for this batch
                if not results:
                    break
                
                for name, details in results.items():
                    printouts = details.get("printouts", {})
                    
                    # Parse coordinates safely
                    raw_coords = printouts.get("Has coordinates", [])
                    lat = ""
                    long = ""
                    if raw_coords and isinstance(raw_coords[0], dict):
                        lat = raw_coords[0].get('lat')
                        long = raw_coords[0].get('lon')

                    row = {
                        "Id": safe_extract(printouts.get("Has pageid")),
                        "Name": name,
                        "Url": details.get("fullurl", ""), 
                        "Coordinates_Lat": lat,
                        "Coordinates_Lon": long,
                        "Region": safe_extract(printouts.get("Located in region")),
                        "RopeWiki Rating": safe_extract(printouts.get("Has rating"))
                    }

                    extract_ratings(row, printouts)
                    extract_star_rating(row, printouts)
                    extract_country_code(row)

                    mark_row_is_valid(row)
                    
                    writer.writerow(row)
                    count += 1
                    batch_count += 1
                
                # Check for pagination token for this batch
                if "query-continue-offset" in data:
                    current_offset = data["query-continue-offset"]
                else:
                    break
            
            print(f"  Batch complete: {batch_count} canyons. Total so far: {count}\n")

    print(f"\nDone! Saved {count} canyons to '{csv_filename}'.")
finally:
    with open(COORDS_MAP_FILE, 'w', encoding='utf-8') as j:
        json.dump(COORDS_CODE_MAP, j, indent=4, ensure_ascii=False)
    print("Missing: ", missing_regions)