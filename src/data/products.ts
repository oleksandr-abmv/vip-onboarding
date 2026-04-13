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

const ALL_PRODUCTS: Product[] = discoverProducts();

export default ALL_PRODUCTS;
