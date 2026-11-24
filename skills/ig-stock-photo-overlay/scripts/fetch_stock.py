#!/usr/bin/env python3
"""Fetch free, commercially usable stock photos (Pexels, Pixabay, Openverse CC0, Wikimedia)
and analyze tonal/clutter zones to recommend frosted-glass card placement for 1080x1350 slides.
"""
import argparse
import json
import os
import statistics
import sys
import urllib.parse
import urllib.request
from typing import Dict, List, Optional
from PIL import Image

USER_AGENT = "Mozilla/5.0 (compatible; IGStockOverlaySkill/1.0)"


def http_get_json(url: str, headers: Optional[Dict[str, str]] = None) -> dict:
    req_headers = {"User-Agent": USER_AGENT}
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, headers=req_headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def download_file(url: str, dest: str) -> None:
    os.makedirs(os.path.dirname(os.path.abspath(dest)), exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as resp, open(dest, "wb") as f:
        f.write(resp.read())


def search_pexels(query: str, count: int) -> List[dict]:
    key = os.environ.get("PEXELS_API_KEY", "").strip()
    if not key:
        return []
    q = urllib.parse.quote(query)
    url = f"https://api.pexels.com/v1/search?query={q}&per_page={count}&orientation=portrait"
    data = http_get_json(url, headers={"Authorization": key})
    out = []
    for p in data.get("photos", []):
        src = p.get("src", {})
        img_url = src.get("large2x") or src.get("original") or src.get("large")
        if not img_url:
            continue
        out.append({
            "source": "pexels",
            "title": p.get("alt") or query,
            "author": p.get("photographer") or "Pexels",
            "license": "Pexels License (Free)",
            "width": p.get("width", 0),
            "height": p.get("height", 0),
            "url": img_url,
            "page_url": p.get("url", ""),
        })
    return out


def search_pixabay(query: str, count: int) -> List[dict]:
    key = os.environ.get("PIXABAY_API_KEY", "").strip()
    if not key:
        return []
    q = urllib.parse.quote(query)
    url = f"https://pixabay.com/api/?key={key}&q={q}&image_type=photo&per_page={count}&safesearch=true"
    data = http_get_json(url)
    out = []
    for h in data.get("hits", []):
        img_url = h.get("largeImageURL") or h.get("fullHDURL")
        if not img_url:
            continue
        out.append({
            "source": "pixabay",
            "title": h.get("tags") or query,
            "author": h.get("user") or "Pixabay",
            "license": "Pixabay Content License (Free)",
            "width": h.get("imageWidth", 0),
            "height": h.get("imageHeight", 0),
            "url": img_url,
            "page_url": h.get("pageURL", ""),
        })
    return out


def search_openverse(query: str, count: int) -> List[dict]:
    q = urllib.parse.quote(query)
    url = f"https://api.openverse.org/v1/images/?q={q}&license=cc0,pdm&page_size={max(count * 2, 10)}"
    data = http_get_json(url)
    out = []
    for item in data.get("results", []):
        w = item.get("width") or 0
        h = item.get("height") or 0
        img_url = item.get("url")
        if not img_url or w < 900:
            continue
        out.append({
            "source": f"openverse:{item.get('provider', 'web')}",
            "title": item.get("title") or query,
            "author": item.get("creator") or "Public Domain / CC0",
            "license": item.get("license", "cc0").upper(),
            "width": w,
            "height": h,
            "url": img_url,
            "page_url": item.get("foreign_landing_url", ""),
        })
        if len(out) >= count:
            break
    return out


def search_wikimedia(query: str, count: int) -> List[dict]:
    q = urllib.parse.quote(query)
    url = (
        "https://commons.wikimedia.org/w/api.php?action=query&generator=search"
        f"&gsrnamespace=6&gsrsearch={q}&gsrlimit={max(count * 2, 8)}"
        "&prop=imageinfo&iiprop=url|mime|size|extmetadata&format=json"
    )
    data = http_get_json(url)
    pages = data.get("query", {}).get("pages", {})
    out = []
    for page in pages.values():
        infos = page.get("imageinfo") or []
        if not infos:
            continue
        info = infos[0]
        mime = info.get("mime", "")
        if mime not in ("image/jpeg", "image/png", "image/webp"):
            continue
        if info.get("width", 0) < 900:
            continue
        out.append({
            "source": "wikimedia",
            "title": page.get("title", "").replace("File:", ""),
            "author": "Wikimedia Commons",
            "license": "CC / Public Domain",
            "width": info.get("width", 0),
            "height": info.get("height", 0),
            "url": info.get("url"),
            "page_url": info.get("descriptionurl", ""),
        })
        if len(out) >= count:
            break
    return out


def analyze_zones(img_path: str) -> dict:
    """Measure luminance and texture variance on top vs bottom halves to guide text placement."""
    with Image.open(img_path) as im:
        w, h = im.size
        gray = im.convert("L")
        gray.thumbnail((240, 300))
        gw, gh = gray.size
        top_box = gray.crop((0, 0, gw, gh // 2))
        bot_box = gray.crop((0, gh // 2, gw, gh))
        top_px = list(top_box.getdata())
        bot_px = list(bot_box.getdata())

        top_luma = round(sum(top_px) / len(top_px), 1)
        bot_luma = round(sum(bot_px) / len(bot_px), 1)
        top_std = round(statistics.pstdev(top_px), 1)
        bot_std = round(statistics.pstdev(bot_px), 1)

        # Lower standard deviation = calmer surface for placing the text card
        rec_pos = "bottom" if bot_std <= top_std else "top"
        # Light glass works cleanly on mid/dark photos; if background is bright, editorial-scrim adds crisp separation
        zone_luma = bot_luma if rec_pos == "bottom" else top_luma
        rec_theme = "light-glass" if zone_luma < 175 else "editorial-scrim"

        return {
            "width": w,
            "height": h,
            "top_luma": top_luma,
            "bottom_luma": bot_luma,
            "top_clutter_std": top_std,
            "bottom_clutter_std": bot_std,
            "recommended_card_position": rec_pos,
            "recommended_theme": rec_theme,
        }


def main() -> None:
    parser = argparse.ArgumentParser(description="Search & download free stock images for IG carousels")
    parser.add_argument("--query", required=True, help="Search keywords (English gives best results)")
    parser.add_argument("--out-dir", default="./stock_images", help="Output directory")
    parser.add_argument("--count", type=int, default=3, help="Max images to download")
    parser.add_argument(
        "--source",
        default="auto",
        choices=["auto", "pexels", "pixabay", "openverse", "wikimedia"],
        help="Stock provider",
    )
    args = parser.parse_args()

    results: List[dict] = []
    if args.source == "auto":
        for fn in (search_pexels, search_pixabay, search_openverse, search_wikimedia):
            try:
                results = fn(args.query, args.count)
            except Exception as exc:
                print(f"Provider fallback ({fn.__name__}): {exc}", file=sys.stderr)
            if results:
                break
    else:
        fn_map = {
            "pexels": search_pexels,
            "pixabay": search_pixabay,
            "openverse": search_openverse,
            "wikimedia": search_wikimedia,
        }
        results = fn_map[args.source](args.query, args.count)

    if not results:
        print(json.dumps({"error": "No stock images found for query", "query": args.query}, indent=2))
        sys.exit(1)

    os.makedirs(args.out_dir, exist_ok=True)
    downloaded = []
    for idx, item in enumerate(results[: args.count], 1):
        ext = ".jpg"
        lower_u = item["url"].lower().split("?")[0]
        if lower_u.endswith(".png"):
            ext = ".png"
        elif lower_u.endswith(".webp"):
            ext = ".webp"
        dest = os.path.abspath(os.path.join(args.out_dir, f"stock_{idx:02d}{ext}"))
        try:
            download_file(item["url"], dest)
            analysis = analyze_zones(dest)
            downloaded.append({**item, "local_path": dest, "analysis": analysis})
        except Exception as exc:
            print(f"Failed downloading {item['url']}: {exc}", file=sys.stderr)

    print(json.dumps({"query": args.query, "downloaded": downloaded}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
