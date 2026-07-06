# RopeWiki Region Properties

This file documents the Semantic MediaWiki properties used by RopeWiki Region pages.

## Confirmed Property Names

These were discovered from `Template:Region` and `Form:Region` on RopeWiki.

| Property | Purpose | Notes |
|---|---|---|
| `Located in region` | Parent region relationship | This is the parent-region property to use in queries. |
| `Is major region` | Marks a region as major | Set from the form field `Major region`. |
| `Is top level region` | Flags whether a region has no parent | Auto-derived from whether `Parent region` is empty. |
| `Has map` | Stores a map reference for the region | Set from `Map` in the Region template. |
| `Has best season` | Human-entered best season text | Entered via Region form. |
| `Has best month` | Optional month-focused season helper | Region metadata field used by template logic. |
| `Has location count` | Count of canyons in the region tree | Calculated via `#ask` in the region template. |

## Region-Tree Helper Properties

The Region template also sets helper properties used by RopeWiki's tree/query logic:

- `Located in regions`
- `Located in regionc`
- `Max Modification date`

These appear to support hierarchy expansion/caching and derived querying rather than manual form entry.

## Parent Region Mapping

In the Region form, the field shown as `Parent region` maps to the semantic property `Located in region`.

Use `Located in region` whenever you need a region's parent.

## Useful Query Examples

Single region parent:

```text
[[Escalante]]|?Located in region
```

All regions with a parent:

```text
[[Category:Regions]][[Located in region::+]]|?Located in region|limit=500
```

Region tree in form UI (as used by RopeWiki):

```text
[[Category:Regions]]|format=tree|root=World|parent=Located in region|limit=1000
```
