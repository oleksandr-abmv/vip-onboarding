export interface Product {
  name: string;
  brand: string;
  price: string;
  image: string;
  description: string;
  category: string;
  subcategory?: string;
  gender?: 'male' | 'female' | 'unisex';
  /** Optional spec bullets shown on the Product Page. Derived when absent. */
  details?: string[];
}

// All products are auto-discovered from image files in /products/
import { discoverProducts } from './productImages';
// Seed products for the new categories that don't have imagery yet.
// Uses the VIP logo placeholder. See CLAUDE.md → "Image / placeholder convention".
import PLACEHOLDER_PRODUCTS from './placeholderProducts';

const ALL_PRODUCTS: Product[] = [...discoverProducts(), ...PLACEHOLDER_PRODUCTS];

export default ALL_PRODUCTS;

import { categoryConfigs } from './categoryConfig';

/**
 * Does a piece match a free-text search? Every search field in the app runs
 * through this so they all agree on what "piece, brand, or category" means.
 *
 * Matching the category **display name** as well as the id is load-bearing, not
 * belt-and-braces: several ids are internal and differ from the only label the
 * user ever sees (`Footwear` is shown as "Shoes", `Vehicles` as "Cars",
 * `Fashion and Apparel` as "Clothing", `Jewellery` as "Jewelry"). Matching the
 * id alone means typing "shoes" into the field directly above a tile labelled
 * "Shoes" returns nothing.
 *
 * Returns false for a blank query; callers decide what an empty field shows.
 */
export function matchesQuery(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  const categoryName = categoryConfigs[product.category]?.name ?? '';
  return (
    product.name.toLowerCase().includes(q) ||
    product.brand.toLowerCase().includes(q) ||
    product.category.toLowerCase().includes(q) ||
    categoryName.toLowerCase().includes(q)
  );
}
