#!/usr/bin/env python3
"""
One-shot batch processor: sends raw reference images in public/row/ to the VIP
image-processing API and drops the results at their correct target paths in
public/images/. Only processes the 'missing' images that don't already exist on
disk. Art and card images are preserved in full (no crop, no bg removal). All
other products get background removal and masked-object fit.
"""
import base64
import os
import sys
import urllib.request
import urllib.error
import mimetypes
import json
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed

API_KEY = os.environ.get("VIP_API_KEY")
if not API_KEY:
    sys.stderr.write(
        "ERROR: VIP_API_KEY env var is not set.\n"
        "Run: VIP_API_KEY=<your-key> python3 scripts/process_raw.py\n"
    )
    sys.exit(2)
API_URL = "https://ai.vip.ai/api/improc/process"

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(REPO, "public", "row")
IMG = os.path.join(REPO, "public", "images")

# Each entry: (raw_relative_path, mode, [target_relative_paths])
# mode: "art"  -> preserve full, no crop, no bg removal, dark padding
#       "prod" -> fit masked object, remove bg, transparent canvas
JOBS = [
    # Bags
    ("bags/women-bags-backpacks-1-prada-re-nylon-saffiano-backpack.webp", "prod",
     ["subcategories/bags/women/backpacks.webp"]),

    # Cars (preserve scene)
    ("cars/cars-convertibles-1-ferrari-812-gts-spider.jpg", "art",
     ["subcategories/cars/convertibles.webp"]),
    ("cars/cars-grand-tourers-1-bentley-continental-gt-speed.jpg", "art",
     ["subcategories/cars/grand-tourers.webp"]),

    # Collectibles (all preserve — cards, comics, stamps, coins, album art, figurines, jerseys, sneakers as display items)
    ("collectibles/cat-collectibles-1-action-comics-1-graded-slab.jpg", "art",
     ["categories/men/collectibles.webp", "categories/women/collectibles.webp"]),
    ("collectibles/collectibles-sneakers-1-air-jordan-1-chicago-1985-og.jpg", "art",
     ["subcategories/collectibles/sneakers.webp"]),
    ("collectibles/collectibles-trading-cards-1-first-edition-charizard-holo-psa-10.webp", "art",
     ["subcategories/collectibles/trading-cards.webp"]),
    ("collectibles/collectibles-coins-1-saint-gaudens-double-eagle-1933.webp", "art",
     ["subcategories/collectibles/coins.webp"]),
    ("collectibles/collectibles-stamps-1-british-penny-black-1840.jpg", "art",
     ["subcategories/collectibles/stamps.webp"]),
    ("collectibles/collectibles-memorabilia-1-michael-jordan-game-worn-jersey-signed.jpg", "art",
     ["subcategories/collectibles/memorabilia.webp"]),
    ("collectibles/collectibles-toys-figures-1-medicom-bearbrick-1000-kaws.webp", "art",
     ["subcategories/collectibles/toys-figures.webp"]),
    ("collectibles/collectibles-comics-1-action-comics-1-superman-first-appearance.jpg", "art",
     ["subcategories/collectibles/comics.webp"]),
    ("collectibles/collectibles-vinyl-1-beatles-butcher-cover-yesterday-and-today", "art",
     ["subcategories/collectibles/vinyl.webp"]),

    # Fine Art
    ("fine art/fineart-pop-art-1-warhol-marilyn-screenprint-1967.jpeg", "art",
     ["subcategories/fineart/pop-art.webp"]),
    ("fine art/fineart-contemporary-1-basquiat-untitled-1982-skull.avif", "art",
     ["subcategories/fineart/contemporary.webp"]),

    # Furniture
    ("furniture/furniture-industrial-1-jean-prouve-standard-chair.webp", "prod",
     ["subcategories/furniture/industrial.webp"]),

    # Jewelry
    ("jewelry/men-jewelry-earrings-1-cartier-juste-un-clou-stud.avif", "prod",
     ["subcategories/jewelry/men/earrings.webp"]),
    ("jewelry/women-jewelry-brooches-1-van-cleef-arpels-mystery-set-zip.webp", "prod",
     ["subcategories/jewelry/women/brooches.webp"]),
    ("jewelry/women-jewelry-chains-1-tiffany-hardwear-graduated-link.jpg", "prod",
     ["subcategories/jewelry/women/chains.webp"]),

    # Shoes
    ("shoes/men-shoes-derbies-1-john-lobb-lopez-brown-calf.webp", "prod",
     ["subcategories/shoes/men/derbies.webp"]),
    ("shoes/ women-shoes-mules-1-manolo-blahnik-maysale-satin.webp", "prod",
     ["subcategories/shoes/women/mules.webp"]),
    ("shoes/women-shoes-wedges-1-saint-laurent-tribute-platform.webp", "prod",
     ["subcategories/shoes/women/wedges.webp"]),

    # Watches
    ("watches/men-watches-complications-1-patek-philippe-5270-perpetual-chronograph.png", "prod",
     ["subcategories/watches/men/complications.webp"]),
    ("watches/women-watches-complications-1-audemars-piguet-royal-oak-perpetual-calendar", "prod",
     ["subcategories/watches/women/complications.webp"]),
    ("watches/men-watches-gmt-1-rolex-gmt-master-ii-126710blro-pepsi.png", "prod",
     ["subcategories/watches/men/gmt.webp"]),
    ("watches/women-watches-gmt-1-patek-philippe-aquanaut-travel-time-5164.avif", "prod",
     ["subcategories/watches/women/gmt.webp"]),

    # Wine & Spirits
    ("wine-and-spirits/cat-wine-spirits-1-macallan-25-sherry-oak.jpg", "prod",
     ["categories/men/wine-spirits.webp", "categories/women/wine-spirits.webp"]),
    ("wine-and-spirits/wine-spirits-red-wine-1-chateau-latour-pauillac-grand-cru.webp", "prod",
     ["subcategories/wine-spirits/red-wine.webp"]),
    ("wine-and-spirits/wine-spirits-white-wine-1-domaine-leflaive-montrachet-grand-cru.jpeg", "prod",
     ["subcategories/wine-spirits/white-wine.webp"]),
    ("wine-and-spirits/wine-spirits-champagne-1-krug-grande-cuvee-170eme-edition", "prod",
     ["subcategories/wine-spirits/champagne.webp"]),
    ("wine-and-spirits/wine-spirits-whisky-1-macallan-25-sherry-oak-highland.jpeg", "prod",
     ["subcategories/wine-spirits/whisky.webp"]),
    ("wine-and-spirits/wine-spirits-cognac-1-louis-xiii-remy-martin-baccarat-decanter.webp", "prod",
     ["subcategories/wine-spirits/cognac.webp"]),
    ("wine-and-spirits/ wine-spirits-tequila-1-clase-azul-ultra-extra-anejo.jpeg", "prod",
     ["subcategories/wine-spirits/tequila.webp"]),
    ("wine-and-spirits/wine-spirits-rum-1-appleton-estate-50-year-jamaica-independence.jpeg", "prod",
     ["subcategories/wine-spirits/rum.webp"]),

    # Yachts (preserve scene — boats are photographed at sea)
    ("yachts-and-boats/cat-yachts-1-riva-aquarama-1962-restored", "art",
     ["categories/men/yachts.webp", "categories/women/yachts.webp"]),
    ("yachts-and-boats/yachts-motor-yachts-1-sunseeker-95-aft-cabin.jpg", "art",
     ["subcategories/yachts/motor-yachts.webp"]),
    ("yachts-and-boats/yachts-sailing-yachts-1-oyster-885-under-sail.jpeg", "art",
     ["subcategories/yachts/sailing-yachts.webp"]),
    ("yachts-and-boats/yachts-superyachts-1-feadship-80m-profile", "art",
     ["subcategories/yachts/superyachts.webp"]),
    ("yachts-and-boats/yachts-catamarans-1-sunreef-80-power-eco.webp", "art",
     ["subcategories/yachts/catamarans.webp"]),
    ("yachts-and-boats/ yachts-tenders-1-riva-aquariva-super-chrome.webp", "art",
     ["subcategories/yachts/tenders.webp"]),
    ("yachts-and-boats/a yachts-classic-boats-1-riva-aquarama-1962-mahogany.jpeg", "art",
     ["subcategories/yachts/classic-boats.webp"]),
    ("yachts-and-boats/yachts-sportfishing-1-viking-92-enclosed-bridge.webp", "art",
     ["subcategories/yachts/sportfishing.webp"]),
    ("yachts-and-boats/yachts-explorer-1-damen-seaxplorer-77.jpg", "art",
     ["subcategories/yachts/explorer.webp"]),
]


def build_multipart(fields, file_field, file_path):
    """Assemble multipart/form-data by hand so we don't need requests."""
    boundary = f"----vipbatch{uuid.uuid4().hex}"
    crlf = b"\r\n"
    body = b""
    for name, value in fields.items():
        body += f"--{boundary}\r\n".encode()
        body += f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode()
        body += str(value).encode() + crlf
    # file part
    filename = os.path.basename(file_path)
    # strip leading spaces/weird chars in filename for a clean Content-Disposition
    filename_clean = filename.strip().lstrip("a ").strip() or "image"
    content_type = mimetypes.guess_type(filename_clean)[0] or "application/octet-stream"
    body += f"--{boundary}\r\n".encode()
    body += f'Content-Disposition: form-data; name="{file_field}"; filename="{filename_clean}"\r\n'.encode()
    body += f"Content-Type: {content_type}\r\n\r\n".encode()
    with open(file_path, "rb") as f:
        body += f.read()
    body += crlf
    body += f"--{boundary}--\r\n".encode()
    return body, boundary


def process_one(job):
    raw_rel, mode, targets = job
    raw_path = os.path.join(RAW, raw_rel)
    if not os.path.exists(raw_path):
        return (raw_rel, False, f"RAW NOT FOUND: {raw_path}")

    # All targets must not exist yet — skip if any already does (per user: "only missing")
    missing_targets = [t for t in targets if not os.path.exists(os.path.join(IMG, t))]
    if not missing_targets:
        return (raw_rel, True, "SKIP (already exists)")

    if mode == "art":
        fields = {
            "output_image_format": "WEBP",
            "quality": 100,
            "remove_background": "false",
            "resize_mode": "fit",
            "background_color": "10,10,10,255",
            "image_variants": '{"tile":[800,800]}',
        }
    else:
        fields = {
            "output_image_format": "WEBP",
            "quality": 100,
            "remove_background": "true",
            "resize_mode": "fit_masked_object",
            "background_color": "0,0,0,0",
            "image_variants": '{"tile":[401,377]}',
        }

    body, boundary = build_multipart(fields, "file", raw_path)
    req = urllib.request.Request(
        API_URL,
        data=body,
        headers={
            "x-api-key": API_KEY,
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            # Cloudflare in front of this API blocks Python's default UA (HTTP 1010).
            "User-Agent": "curl/8.4.0",
            "Accept": "*/*",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            payload = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")[:200]
        return (raw_rel, False, f"HTTP {e.code}: {detail}")
    except Exception as e:
        return (raw_rel, False, f"ERR: {type(e).__name__}: {e}")

    images = payload.get("images") or {}
    # variant key is "<name>.<ext>" like "tile.webp"
    b64 = None
    for k, v in images.items():
        if k.startswith("tile"):
            b64 = v
            break
    if not b64:
        return (raw_rel, False, f"no tile in response: keys={list(images.keys())}")
    img_bytes = base64.b64decode(b64)

    for t in missing_targets:
        out = os.path.join(IMG, t)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "wb") as f:
            f.write(img_bytes)
    return (raw_rel, True, f"OK → {missing_targets}")


def main():
    ok, fail, skipped = 0, 0, 0
    with ThreadPoolExecutor(max_workers=6) as ex:
        futures = {ex.submit(process_one, job): job for job in JOBS}
        for fut in as_completed(futures):
            raw, success, msg = fut.result()
            if success and "SKIP" in msg:
                skipped += 1
            elif success:
                ok += 1
            else:
                fail += 1
            status = "✓" if success else "✗"
            print(f"{status} {raw}: {msg}", flush=True)
    print(f"\nDone. OK={ok} SKIP={skipped} FAIL={fail}  (total jobs={len(JOBS)})")
    sys.exit(0 if fail == 0 else 1)


if __name__ == "__main__":
    main()
