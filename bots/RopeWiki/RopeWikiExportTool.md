1) Extract all the Region information into a tree structure with `python ./RopeWikiRegiosExtraction.py` which will export all the data to `./cache/RopeWikiRegionCodeMap.json`
2) **TODO - CREATE** Check the `./ref_data/RegionSetMap.json` file, that maps the name of a RopeWiki Region, to an internal Region Code and Id 
3) Run the `python ./RopeWikiExporter.py` which will export a CSV to `./ropewiki_canyons_extracted.csv`
Also check output for Regions that could not be mapped **TODO - Add Output Summary**
4) **TODO - CREATE** Run the update tool that will update existing Canyons, Create new Canyons and Delete old Canyons in the database.