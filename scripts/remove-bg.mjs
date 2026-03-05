/**
 * Preprocesses product images through remove.bg API.
 * Run once: node scripts/remove-bg.mjs
 * Output: public/images/*.png (transparent PNGs)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY   = process.env.REMOVEBG_API_KEY ?? 'aCJ2fM8H7WYiUicYNEymAQdF';
const OUT_DIR   = path.join(__dirname, '..', 'public', 'images');

// One entry per product — must match the order in src/data/products.ts
const IMAGES = [
  // Vehicles
  { file: 'vehicles-911-gt3-rs',        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=800&fit=crop' },
  { file: 'vehicles-sf90-stradale',      url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=800&fit=crop' },
  // Jewelry
  { file: 'jewelry-serpenti-viper',      url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop' },
  { file: 'jewelry-love-bracelet',       url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop' },
  // Watches
  { file: 'watches-royal-oak',           url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=800&fit=crop' },
  { file: 'watches-submariner',          url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=800&fit=crop' },
  // Sunglasses
  { file: 'sunglasses-aviator',          url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop' },
  { file: 'sunglasses-dior',             url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop' },
  // Fashion
  { file: 'fashion-cashmere-overcoat',   url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop' },
  { file: 'fashion-motorcycle-jacket',   url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop' },
  // Fine Art
  { file: 'art-abstract-composition',    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=800&fit=crop' },
  { file: 'art-bronze-figure',           url: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&h=800&fit=crop' },
  // Cigars
  { file: 'cigars-behike-bhk56',         url: 'https://images.unsplash.com/photo-1589994160839-163cd867cfe8?w=800&h=800&fit=crop' },
  { file: 'cigars-no2-torpedo',          url: 'https://images.unsplash.com/photo-1574279606130-09958dc756f7?w=800&h=800&fit=crop' },
  // Handbags
  { file: 'handbags-kelly-28',           url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=800&fit=crop' },
  { file: 'handbags-neverfull',          url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop' },
  // Fine Wine
  { file: 'wine-chateau-margaux',        url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=800&fit=crop' },
  { file: 'wine-dom-perignon',           url: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800&h=800&fit=crop' },
  // Yachts
  { file: 'yachts-grande-27',            url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=800&fit=crop' },
  { file: 'yachts-88-florida',           url: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&h=800&fit=crop' },
  // Private Aviation
  { file: 'aviation-citation-longitude', url: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&h=800&fit=crop' },
  { file: 'aviation-g700',               url: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&h=800&fit=crop' },
  // Collectibles
  { file: 'collectibles-patek-5320g',    url: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&h=800&fit=crop' },
  { file: 'collectibles-shakespeare',    url: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=800&h=800&fit=crop' },
];

async function processImage(file, url) {
  const res = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: url,
      size: 'regular', // up to ~2000×2000 — sufficient for mobile
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.errors?.[0]?.title ?? `HTTP ${res.status}`);
  }

  const outPath = path.join(OUT_DIR, `${file}.png`);
  fs.writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
  return outPath;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let ok = 0, skipped = 0, failed = 0;

  for (const { file, url } of IMAGES) {
    const outPath = path.join(OUT_DIR, `${file}.png`);

    if (fs.existsSync(outPath)) {
      console.log(`⏭  ${file} (already exists, skipping)`);
      skipped++;
      continue;
    }

    process.stdout.write(`🔄 ${file}...`);
    try {
      await processImage(file, url);
      process.stdout.write(' ✓\n');
      ok++;
    } catch (e) {
      process.stdout.write(` ✗ ${e.message}\n`);
      failed++;
    }

    // Respectful delay between API calls
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\n✅ Done — ${ok} processed, ${skipped} skipped, ${failed} failed`);
  if (failed > 0) console.log('Re-run to retry failed images (already processed ones are skipped).');
}

main();
