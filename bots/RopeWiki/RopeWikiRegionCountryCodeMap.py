import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path


def build_region_code_map(
    csv_path: Path,
    region_column: str,
    code_column: str,
    include_empty_codes: bool,
) -> tuple[dict[str, list[str]], dict[str, int]]:
    region_to_codes: dict[str, set[str]] = defaultdict(set)

    stats = {
        "rows": 0,
        "rows_missing_region": 0,
        "rows_missing_code": 0,
    }

    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)

        if reader.fieldnames is None:
            raise ValueError("CSV has no header row.")

        if region_column not in reader.fieldnames:
            raise ValueError(
                f"Region column '{region_column}' not found. Available columns: {reader.fieldnames}"
            )

        if code_column not in reader.fieldnames:
            raise ValueError(
                f"Code column '{code_column}' not found. Available columns: {reader.fieldnames}"
            )

        for row in reader:
            stats["rows"] += 1

            region = (row.get(region_column) or "").strip()
            code = (row.get(code_column) or "").strip().lower()

            if not region:
                stats["rows_missing_region"] += 1
                continue

            if not code:
                stats["rows_missing_code"] += 1
                if include_empty_codes:
                    region_to_codes[region].add("")
                continue

            region_to_codes[region].add(code)

    # Ensure deterministic ordering for stable diffs and easier review.
    ordered_map = {
        region: sorted(codes)
        for region, codes in sorted(region_to_codes.items(), key=lambda item: item[0].lower())
    }

    return ordered_map, stats


def build_one_to_one_map(region_code_map: dict[str, list[str]]) -> dict[str, str]:
    one_to_one: dict[str, str] = {}
    for region, codes in region_code_map.items():
        if len(codes) == 1 and codes[0]:
            one_to_one[region] = codes[0]
    return one_to_one


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Build a Region -> [country_code, ...] JSON map from an extracted RopeWiki canyon CSV."
        )
    )

    parser.add_argument(
        "--input",
        default="./ropewiki_canyons_extracted.csv",
        help="Path to the extracted canyons CSV file.",
    )
    parser.add_argument(
        "--output",
        default="./cache/RopeWikiRegionCountryCodeMap.json",
        help="Path for the Region -> [country_code, ...] JSON output.",
    )
    parser.add_argument(
        "--region-column",
        default="Region",
        help="CSV column name containing region names.",
    )
    parser.add_argument(
        "--code-column",
        default="Region Code",
        help="CSV column name containing country codes.",
    )
    parser.add_argument(
        "--include-empty-codes",
        action="store_true",
        help="Include empty country codes as empty strings in the output list.",
    )
    parser.add_argument(
        "--one-to-one-output",
        default="./cache/RopeWikiRegionCountryCodeMap_1to1.json",
        help=(
            "Optional JSON output path for regions with exactly one mapped country code"
            " (Region -> country_code)."
        ),
    )

    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        raise FileNotFoundError(f"Input CSV does not exist: {input_path}")

    region_code_map, stats = build_region_code_map(
        csv_path=input_path,
        region_column=args.region_column,
        code_column=args.code_column,
        include_empty_codes=args.include_empty_codes,
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(region_code_map, f, indent=4, ensure_ascii=False)

    print(f"Processed rows: {stats['rows']}")
    print(f"Rows missing region: {stats['rows_missing_region']}")
    print(f"Rows missing country code: {stats['rows_missing_code']}")
    print(f"Total regions in output: {len(region_code_map)}")
    print(f"Saved region->country-code map: {output_path}")

    single_code_regions = sum(1 for codes in region_code_map.values() if len(codes) == 1)
    multi_code_regions = sum(1 for codes in region_code_map.values() if len(codes) > 1)

    print(f"Regions with 1:1 mapping: {single_code_regions}")
    print(f"Regions with multiple country codes: {multi_code_regions}")

    if args.one_to_one_output:
        one_to_one_path = Path(args.one_to_one_output)
        one_to_one_path.parent.mkdir(parents=True, exist_ok=True)

        one_to_one = build_one_to_one_map(region_code_map)
        with one_to_one_path.open("w", encoding="utf-8") as f:
            json.dump(one_to_one, f, indent=4, ensure_ascii=False)

        print(f"Saved 1:1-only map: {one_to_one_path}")


if __name__ == "__main__":
    main()
