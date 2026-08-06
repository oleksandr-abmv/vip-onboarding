export interface Product {
  name: string;
  brand: string;
  price: string;
  /** The primary shot. Always present, and always `images[0]`. */
  image: string;
  /**
   * Every view of the piece, primary first. Absent or single-entry means there
   * is only the one shot, which is most of the catalog today - the Product Page
   * gallery degrades to a plain static image in that case. See
   * `EXTRA_VIEWS` in productImages.ts for how extra shots are attached.
   */
  images?: string[];
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

/**
 * Every view of a piece, primary first, with no empty entries. The one place
 * that answers "how many images does this have", so the gallery, its counter
 * and anything else that needs the count can never disagree.
 */
export function viewsOf(product: Product): string[] {
  const views = product.images?.length ? product.images : [product.image];
  return views.filter(Boolean);
}

export default ALL_PRODUCTS;
