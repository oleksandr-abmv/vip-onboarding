/**
 * Build a list of every category/subcategory tile image URL the user might
 * encounter during onboarding. Used to warm the browser cache on Welcome so
 * subsequent screens render images instantly.
 */
import { categoryConfigs, getSubcategoryImagePath } from '../data/categoryConfig';

const TOP_LEVEL_FILENAMES = [
  'accessories.webp',
  'bags.webp',
  'cars.webp',
  'cigars.png',
  'clothing.webp',
  'collectibles.png',
  'fineart.webp',
  'furniture.webp',
  'jewelry.png',
  'shoes.webp',
  'watches.webp',
  'wine-spirits.png',
  'yachts.png',
];

export function getAllOnboardingImageUrls(gender: string | null): string[] {
  const urls: string[] = [];

  // Top-level category tiles for both gender folders (cheap to over-prefetch)
  for (const folder of ['men', 'women']) {
    for (const f of TOP_LEVEL_FILENAMES) {
      urls.push(`/images/categories/${folder}/${f}`);
    }
  }

  // Subcategory tiles, scoped to the current gender for gendered categories
  for (const config of Object.values(categoryConfigs)) {
    const lists = [config.subcategories];
    if (config.subcategoriesWomen) lists.push(config.subcategoriesWomen);
    for (const list of lists) {
      for (const sub of list) {
        if (sub.image) {
          urls.push(getSubcategoryImagePath(config, sub.image, gender));
        }
      }
    }
  }

  return urls;
}
