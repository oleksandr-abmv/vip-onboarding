export interface Product {
  name: string;
  brand: string;
  price: string;
  image: string;
  description: string;
  category: string;
  subcategory?: string;
  gender?: 'male' | 'female' | 'unisex';
}

// All products are auto-discovered from image files in /products/
import { discoverProducts } from './productImages';
// Seed products for the new categories that don't have imagery yet.
// Uses the VIP logo placeholder. See CLAUDE.md → "Image / placeholder convention".
import PLACEHOLDER_PRODUCTS from './placeholderProducts';

const ALL_PRODUCTS: Product[] = [...discoverProducts(), ...PLACEHOLDER_PRODUCTS];

export default ALL_PRODUCTS;
