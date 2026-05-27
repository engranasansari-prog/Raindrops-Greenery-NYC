#!/usr/bin/env python3
"""
Raindrops Greenery — Dutchie → Site Product Migration

Transforms the raw Dutchie scrape (raindrops-dutchie-products-full.json)
into the clean shape /lib/products.ts expects.

Run:
    python3 migrate-products.py

Outputs:
    products.json        ← canonical product data, copy to /data/products.json
    products.ts          ← typed TypeScript module, copy to /lib/products.ts
"""

import json
import re
from pathlib import Path

SOURCE = Path("raindrops-dutchie-products-full.json")

# Sticky thresholds — products at or above qualify for the STICKY badge.
# Pre-Rolls excluded because every pre-roll is infused (premium by definition),
# so the badge would be meaningless there.
STICKY_THRESHOLDS = {
    "Flower":  {"thcUnit": "%",  "thcValue": 30},     # 30%+ flower
    "Edibles": {"thcUnit": "mg", "thcValue": 1000},   # 1000mg (the gummies)
}

# Strain type normalization: handle empty / weird casings
STRAIN_MAP = {
    "Hybrid": "Hybrid",
    "Indica": "Indica",
    "Sativa": "Sativa",
    "Indica-Hybrid": "Indica-Hybrid",
    "Sativa-Hybrid": "Sativa-Hybrid",
    "": None,  # chocolate edibles have no strain
}


def to_number(s):
    """Convert '40.00' → 40, '32.5' → 32.5, '' → None."""
    if s is None or s == "":
        return None
    try:
        f = float(s)
        return int(f) if f.is_integer() else f
    except (ValueError, TypeError):
        return None


def thc_display(value, unit):
    """Build human-readable THC string: 28 + % → '28%', 1000 + mg → '1000mg'."""
    if value is None:
        return None
    v = to_number(value)
    if v is None:
        return None
    return f"{v}{unit}" if unit else str(v)


def is_sticky(category, thc_value, thc_unit):
    """Does this product earn a STICKY badge?"""
    threshold = STICKY_THRESHOLDS.get(category)
    if not threshold or thc_value is None:
        return False
    if thc_unit != threshold["thcUnit"]:
        return False
    v = to_number(thc_value)
    return v is not None and v >= threshold["thcValue"]


def normalize_brand(brand):
    """'Raindrop's Greenery' (Dutchie spelling) → 'Raindrops Greenery' (site brand)."""
    if not brand:
        return "Raindrops Greenery"
    return brand.replace("Raindrop's Greenery", "Raindrops Greenery")


def transform_product(p):
    """Convert one Dutchie product → site product."""
    variants = []
    for v in p.get("variants", []):
        price = to_number(v.get("price"))
        if price is None:
            continue
        variants.append({
            "label": v.get("label", "Default"),
            "price": price,
        })

    # Fallback: if no variants parsed, use basePrice
    if not variants and p.get("basePrice"):
        variants.append({
            "label": p.get("priceLabel", "Default"),
            "price": to_number(p["basePrice"]),
        })

    base_price = variants[0]["price"] if variants else None

    thc_val = p.get("thcValue", "")
    thc_unit = p.get("thcUnit", "")

    return {
        "id": p["id"],
        "slug": p["slug"],
        "name": p["name"],
        "category": p["category"],
        "strainType": STRAIN_MAP.get(p.get("strainType", ""), p.get("strainType") or None),
        "brand": normalize_brand(p.get("brand", "")),
        "description": (p.get("description") or "").strip(),
        "image": p.get("image", ""),
        "orderUrl": p.get("productUrl", ""),
        "basePrice": base_price,
        "variants": variants,
        "thc": {
            "value": to_number(thc_val),
            "unit": thc_unit or None,
            "display": thc_display(thc_val, thc_unit),
        },
        "cbd": {
            "value": to_number(p.get("cbdValue")),
            "unit": p.get("cbdUnit") or None,
        },
        "isSticky": is_sticky(p["category"], thc_val, thc_unit),
        "tags": p.get("tags", []),
    }


def main():
    with SOURCE.open() as f:
        raw = json.load(f)

    products = [transform_product(p) for p in raw["products"]]

    # Sort: Flower first, then Pre-Rolls, then Edibles, alphabetically within
    category_order = {"Flower": 0, "Pre-Rolls": 1, "Edibles": 2}
    products.sort(key=lambda p: (category_order.get(p["category"], 99), p["name"]))

    # Write JSON
    output_json = {
        "meta": {
            "source": "Dutchie public storefront",
            "exportedAt": raw["meta"]["scrapedAt"],
            "totalProducts": len(products),
            "categories": {
                cat: sum(1 for p in products if p["category"] == cat)
                for cat in ("Flower", "Pre-Rolls", "Edibles")
            },
        },
        "products": products,
    }

    Path("products.json").write_text(json.dumps(output_json, indent=2))

    # Write TypeScript module
    ts_content = f"""// /lib/products.ts
// Auto-generated from Dutchie storefront. To regenerate:
//   python3 scripts/migrate-products.py
// Source: {raw["meta"]["sourceUrl"]}
// Exported: {raw["meta"]["scrapedAt"]}

export type Category = 'Flower' | 'Pre-Rolls' | 'Edibles';
export type StrainType =
  | 'Indica'
  | 'Sativa'
  | 'Hybrid'
  | 'Indica-Hybrid'
  | 'Sativa-Hybrid'
  | null;

export interface Variant {{
  label: string;   // '3.5g', '7g', 'Default'
  price: number;
}}

export interface Product {{
  id: string;
  slug: string;
  name: string;
  category: Category;
  strainType: StrainType;
  brand: string;
  description: string;
  image: string;
  orderUrl: string;       // direct Dutchie product URL
  basePrice: number | null;
  variants: Variant[];
  thc: {{
    value: number | null;
    unit: '%' | 'mg' | null;
    display: string | null;
  }};
  cbd: {{
    value: number | null;
    unit: string | null;
  }};
  isSticky: boolean;      // 30%+ Flower, 32%+ Pre-Rolls, 500mg+ Edibles
  tags: string[];
}}

import productsJson from '@/data/products.json';

export const PRODUCTS: Product[] = productsJson.products as Product[];

export const PRODUCT_META = productsJson.meta;

// Lookup helpers
export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
export const PRODUCTS_BY_CATEGORY = {{
  Flower:      PRODUCTS.filter(p => p.category === 'Flower'),
  'Pre-Rolls': PRODUCTS.filter(p => p.category === 'Pre-Rolls'),
  Edibles:     PRODUCTS.filter(p => p.category === 'Edibles'),
}} as const;

// Featured selections — use these for the homepage carousel
export const FEATURED_PRODUCTS = [
  ...PRODUCTS.filter(p => p.isSticky).slice(0, 2),                    // 2 sticky
  ...PRODUCTS.filter(p => p.category === 'Edibles').slice(0, 1),      // 1 edible
].slice(0, 3);
"""
    Path("products.ts").write_text(ts_content)

    print(f"✓ Transformed {len(products)} products")
    print(f"  Flower:    {output_json['meta']['categories']['Flower']}")
    print(f"  Pre-Rolls: {output_json['meta']['categories']['Pre-Rolls']}")
    print(f"  Edibles:   {output_json['meta']['categories']['Edibles']}")
    print(f"\nSTICKY products ({sum(1 for p in products if p['isSticky'])}):")
    for p in products:
        if p["isSticky"]:
            print(f"  · {p['name']:40s} | {p['category']:10s} | THC {p['thc']['display']}")
    print(f"\nOutput:")
    print(f"  products.json  ({Path('products.json').stat().st_size:,} bytes)")
    print(f"  products.ts    ({Path('products.ts').stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
