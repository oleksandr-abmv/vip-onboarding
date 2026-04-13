/**
 * Auto-generates product data from image filenames in /products/.
 *
 * Filename conventions:
 *   Gendered:  {gender}-{category}-{subcategory}-{number}-{product-name}-{brand}.png
 *   Unisex:    {category}-{subcategory}-{number}-{product-name}-{brand}.png
 */

import type { Product } from './products';
import DESCRIPTIONS from './productDescriptions';

// All product image paths (generated from filesystem)
const IMAGE_PATHS: string[] = [
  // Accessories - Men
  '/products/accessories/men/men-accessories-casual-1-cashmere-baseball-cap-brunello-cucinelli.webp',
  '/products/accessories/men/men-accessories-casual-2-grande-unita-cashmere-scarf-loro-piana.webp',
  '/products/accessories/men/men-accessories-classic-1-h-buckle-belt-hermes.webp',
  '/products/accessories/men/men-accessories-classic-2-gancini-belt-salvatore-ferragamo.webp',
  '/products/accessories/men/men-accessories-elegant-1-silk-bow-tie-tom-ford.webp',
  '/products/accessories/men/men-accessories-elegant-2-onyx-cufflinks-montblanc.webp',
  '/products/accessories/men/men-accessories-minimalist-1-intrecciato-card-holder-bottega-veneta.webp',
  '/products/accessories/men/men-accessories-minimalist-2-triomphe-sunglasses-celine.webp',
  '/products/accessories/men/men-accessories-sporty-1-linea-rossa-sunglasses-prada.webp',
  '/products/accessories/men/men-accessories-sporty-2-shield-sunglasses-moncler.webp',
  '/products/accessories/men/men-accessories-streetwear-1-lv-crush-monogram-beanie-louis-vuitton.webp',
  '/products/accessories/men/men-accessories-streetwear-2-industrial-belt-off-white.webp',
  '/products/accessories/men/men-accessories-vintage-1-714-folding-sunglasses-persol.webp',
  '/products/accessories/men/men-accessories-vintage-2-aviator-sunglasses-ray-ban.webp',
  // Accessories - Women
  '/products/accessories/women/women-accessories-casual-1-cashmere-scarf-loro-piana.webp',
  '/products/accessories/women/women-accessories-casual-2-cashmere-beanie-brunello-cucinelli.webp',
  '/products/accessories/women/women-accessories-classic-1-silk-scarf-hermes.webp',
  '/products/accessories/women/women-accessories-classic-2-pearl-sunglasses-chanel.webp',
  '/products/accessories/women/women-accessories-elegant-1-trinity-bracelet-cartier.webp',
  '/products/accessories/women/women-accessories-elegant-2-silk-gloves-dior.webp',
  '/products/accessories/women/women-accessories-minimalist-1-leather-belt-bottega-veneta.webp',
  '/products/accessories/women/women-accessories-minimalist-2-triomphe-sunglasses-celine.webp',
  '/products/accessories/women/women-accessories-sporty-1-linea-rossa-sunglasses-prada.webp',
  '/products/accessories/women/women-accessories-sporty-2-logo-headband-moncler.webp',
  '/products/accessories/women/women-accessories-streetwear-1-logo-baseball-cap-balenciaga.webp',
  '/products/accessories/women/women-accessories-streetwear-2-monogram-bandeau-louis-vuitton.webp',
  '/products/accessories/women/women-accessories-vintage-1-brooch-chanel.webp',
  '/products/accessories/women/women-accessories-vintage-2-silk-scarf-pucci.webp',
  // Bags - Men
  '/products/bags/men/men-bags-backpacks-1-christopher-backpack-louis-vuitton.webp',
  '/products/bags/men/men-bags-backpacks-2-re-nylon-backpack-prada.webp',
  '/products/bags/men/men-bags-briefcases-1-un-jour-briefcase-berluti.webp',
  '/products/bags/men/men-bags-briefcases-2-saffiano-briefcase-prada.webp',
  '/products/bags/men/men-bags-crossbody-1-saffiano-crossbody-prada.webp',
  '/products/bags/men/men-bags-crossbody-2-gg-supreme-messenger-gucci.webp',
  '/products/bags/men/men-bags-duffel-1-leather-duffel-tom-ford.webp',
  '/products/bags/men/men-bags-duffel-2-keepall-50-louis-vuitton.webp',
  '/products/bags/men/men-bags-messenger-1-intrecciato-messenger-bottega-veneta.webp',
  '/products/bags/men/men-bags-messenger-2-soft-trunk-messenger-louis-vuitton.webp',
  '/products/bags/men/men-bags-totes-1-saint-louis-tote-goyard.webp',
  '/products/bags/men/men-bags-totes-2-cabas-tote-saint-laurent.webp',
  // Bags - Women
  '/products/bags/women/women-bags-clutches-1-knot-clutch-bottega-veneta.webp',
  '/products/bags/women/women-bags-clutches-2-4g-clutch-givenchy.webp',
  '/products/bags/women/women-bags-crossbody-1-gg-marmont-crossbody-gucci.webp',
  '/products/bags/women/women-bags-crossbody-2-saddle-bag-dior.webp',
  '/products/bags/women/women-bags-mini-1-le-chiquito-jacquemus.webp',
  '/products/bags/women/women-bags-mini-2-nano-speedy-louis-vuitton.webp',
  '/products/bags/women/women-bags-shoulder-1-classic-flap-chanel.webp',
  '/products/bags/women/women-bags-shoulder-2-loulou-saint-laurent.webp',
  '/products/bags/women/women-bags-tophandle-1-lady-dior-dior.webp',
  '/products/bags/women/women-bags-tophandle-2-kelly-hermes.webp',
  '/products/bags/women/women-bags-totes-1-birkin-hermes.webp',
  '/products/bags/women/women-bags-totes-2-cabat-bottega-veneta.webp',
  // Cars (unisex)
  '/products/cars/cars-classic-1-1955-300sl-gullwing-mercedes-benz.webp',
  '/products/cars/cars-classic-2-1962-db5-aston-martin.webp',
  '/products/cars/cars-coupes-1-db12-aston-martin.webp',
  '/products/cars/cars-coupes-2-continental-gt-bentley.webp',
  '/products/cars/cars-electric-1-spectre-rolls-royce.webp',
  '/products/cars/cars-electric-2-taycan-turbo-s-porsche.webp',
  '/products/cars/cars-hypercars-1-chiron-super-sport-bugatti.webp',
  '/products/cars/cars-hypercars-2-huayra-pagani.webp',
  '/products/cars/cars-sedans-1-phantom-rolls-royce.webp',
  '/products/cars/cars-sedans-2-flying-spur-bentley.webp',
  '/products/cars/cars-sports-1-sf90-stradale-ferrari.webp',
  '/products/cars/cars-sports-2-911-turbo-s-porsche.webp',
  '/products/cars/cars-suvs-1-cullinan-rolls-royce.webp',
  '/products/cars/cars-suvs-2-urus-lamborghini.webp',
  // Clothing - Men
  '/products/clothing/men/men-clothing-casual-1-cashmere-polo-shirt-loro-piana.webp',
  '/products/clothing/men/men-clothing-casual-2-cashmere-joggers-brunello-cucinelli.webp',
  '/products/clothing/men/men-clothing-classic-1-shelton-suit-tom-ford.webp',
  '/products/clothing/men/men-clothing-classic-2-double-breasted-blazer-ralph-lauren.webp',
  '/products/clothing/men/men-clothing-elegant-1-silk-tuxedo-brioni.webp',
  '/products/clothing/men/men-clothing-elegant-2-evening-shirt-giorgio-armani.webp',
  '/products/clothing/men/men-clothing-minimalist-1-cotton-poplin-shirt-jil-sander.webp',
  '/products/clothing/men/men-clothing-minimalist-2-cashmere-sweater-the-row.webp',
  '/products/clothing/men/men-clothing-sporty-1-ski-vest-moncler-grenoble.webp',
  '/products/clothing/men/men-clothing-sporty-2-track-jacket-prada-linea-rossa.webp',
  '/products/clothing/men/men-clothing-streetwear-1-monogram-hoodie-louis-vuitton.webp',
  '/products/clothing/men/men-clothing-streetwear-2-oversized-denim-jacket-balenciaga.webp',
  '/products/clothing/men/men-clothing-vintage-1-gg-jacquard-cardigan-gucci.webp',
  '/products/clothing/men/men-clothing-vintage-2-monogram-bomber-jacket-versace.webp',
  // Clothing - Women
  '/products/clothing/women/women-clothing-casual-1-cashmere-joggers-brunello-cucinelli.webp',
  '/products/clothing/women/women-clothing-casual-2-cashmere-sweater-loro-piana.webp',
  '/products/clothing/women/women-clothing-classic-1-101801-icon-coat-max-mara.webp',
  '/products/clothing/women/women-clothing-classic-2-silk-blouse-burberry.webp',
  '/products/clothing/women/women-clothing-elegant-1-silk-evening-gown-valentino.webp',
  '/products/clothing/women/women-clothing-elegant-2-sequin-dress-dolce-gabbana.webp',
  '/products/clothing/women/women-clothing-minimalist-1-dalbero-cashmere-sweater-the-row.webp',
  '/products/clothing/women/women-clothing-minimalist-2-wool-trousers-jil-sander.webp',
  '/products/clothing/women/women-clothing-sporty-1-ski-jacket-prada-linea-rossa.webp',
  '/products/clothing/women/women-clothing-sporty-2-logo-leggings-moncler.webp',
  '/products/clothing/women/women-clothing-streetwear-1-oversized-hoodie-balenciaga.webp',
  '/products/clothing/women/women-clothing-streetwear-2-logo-t-shirt-off-white.webp',
  '/products/clothing/women/women-clothing-vintage-1-classic-tweed-skirt-chanel.webp',
  '/products/clothing/women/women-clothing-vintage-2-flora-print-dress-gucci.webp',
  // Fine Art (unisex)
  '/products/fineart/art-renaissance-1-mona-lisa-leonardo-da-vinci.webp',
  '/products/fineart/art-renaissance-2-birth-of-venus-sandro-botticelli.webp',
  '/products/fineart/art-baroque-1-girl-with-pearl-earring-johannes-vermeer.webp',
  '/products/fineart/art-baroque-2-night-watch-rembrandt.webp',
  '/products/fineart/art-impressionism-1-water-lilies-claude-monet.webp',
  '/products/fineart/art-impressionism-2-dance-at-le-moulin-pierre-auguste-renoir.webp',
  '/products/fineart/art-post-impressionism-1-starry-night-vincent-van-gogh.webp',
  '/products/fineart/art-post-impressionism-2-card-players-paul-cezanne.webp',
  '/products/fineart/art-surrealism-1-persistence-of-memory-salvador-dali.webp',
  '/products/fineart/art-surrealism-2-son-of-man-rene-magritte.webp',
  '/products/fineart/art-abstract-expressionism-1-no-5-jackson-pollock.webp',
  '/products/fineart/art-abstract-expressionism-2-untitled-mark-rothko.webp',
  '/products/fineart/art-contemporary-1-untitled-skull-jean-michel-basquiat.webp',
  '/products/fineart/art-contemporary-2-large-vase-of-flowers-david-hockney.webp',
  '/products/fineart/art-pop-art-1-marilyn-diptych-andy-warhol.webp',
  '/products/fineart/art-pop-art-2-drowning-girl-roy-lichtenstein.webp',
  // Furniture (unisex)
  '/products/furniture/furniture-art-deco-1-medusa-armchair-versace-home.webp',
  '/products/furniture/furniture-art-deco-2-lalique-crystal-vase-lamp-lalique.webp',
  '/products/furniture/furniture-classic-1-brook-street-tufted-sofa-ralph-lauren-home.webp',
  '/products/furniture/furniture-classic-2-chester-sofa-poltrona-frau.webp',
  '/products/furniture/furniture-contemporary-1-charles-sofa-bb-italia.webp',
  '/products/furniture/furniture-contemporary-2-mags-sofa-hay.webp',
  '/products/furniture/furniture-mid-century-1-eames-lounge-chair-herman-miller.webp',
  '/products/furniture/furniture-mid-century-2-noguchi-coffee-table-herman-miller.webp',
  '/products/furniture/furniture-minimalist-1-usm-haller-shelving-usm.webp',
  '/products/furniture/furniture-minimalist-2-pk22-lounge-chair-fritz-hansen.webp',
  '/products/furniture/furniture-rustic-1-timber-reclaimed-oak-dining-table-restoration-hardware.webp',
  '/products/furniture/furniture-rustic-2-farm-table-ralph-lauren-home.webp',
  '/products/furniture/furniture-scandinavian-1-egg-chair-fritz-hansen.webp',
  '/products/furniture/furniture-scandinavian-2-ch24-wishbone-chair-carl-hansen.webp',
  // Jewelry - Men
  '/products/jewelry/men/men-jewelry-bracelets-1-juste-un-clou-bracelet-cartier.webp',
  '/products/jewelry/men/men-jewelry-bracelets-2-cable-bracelet-david-yurman.webp',
  '/products/jewelry/men/men-jewelry-chains-1-curb-chain-necklace-david-yurman.webp',
  '/products/jewelry/men/men-jewelry-chains-2-monogram-chain-louis-vuitton.webp',
  '/products/jewelry/men/men-jewelry-cufflinks-1-juste-un-clou-cufflinks-cartier.webp',
  '/products/jewelry/men/men-jewelry-cufflinks-2-meisterstuck-onyx-cufflinks-montblanc.webp',
  '/products/jewelry/men/men-jewelry-necklaces-1-diamond-pendant-tiffany.webp',
  '/products/jewelry/men/men-jewelry-necklaces-2-dog-tag-pendant-gucci.webp',
  '/products/jewelry/men/men-jewelry-rings-1-love-ring-cartier.webp',
  '/products/jewelry/men/men-jewelry-rings-2-intrecciato-ring-bottega-veneta.webp',
  // Jewelry - Women
  '/products/jewelry/women/women-jewelry-bangles-1-love-bracelet-cartier.webp',
  '/products/jewelry/women/women-jewelry-bangles-2-serpenti-bangle-bulgari.webp',
  '/products/jewelry/women/women-jewelry-bracelets-1-t-wire-bracelet-tiffany.webp',
  '/products/jewelry/women/women-jewelry-bracelets-2-alhambra-bracelet-van-cleef-arpels.webp',
  '/products/jewelry/women/women-jewelry-earrings-1-alhambra-earrings-van-cleef-arpels.webp',
  '/products/jewelry/women/women-jewelry-earrings-2-tribales-earrings-dior.webp',
  '/products/jewelry/women/women-jewelry-necklaces-1-serpenti-necklace-bulgari.webp',
  '/products/jewelry/women/women-jewelry-necklaces-2-move-necklace-messika.webp',
  '/products/jewelry/women/women-jewelry-rings-1-solitaire-diamond-ring-tiffany.webp',
  '/products/jewelry/women/women-jewelry-rings-2-clash-ring-cartier.webp',
  // Shoes - Men
  '/products/shoes/men/men-shoes-boots-1-wyatt-boot-saint-laurent.webp',
  '/products/shoes/men/men-shoes-boots-2-chelsea-boot-bottega-veneta.webp',
  '/products/shoes/men/men-shoes-loafers-1-horsebit-loafer-gucci.webp',
  '/products/shoes/men/men-shoes-loafers-2-city-gommino-tods.webp',
  '/products/shoes/men/men-shoes-oxfords-1-philip-ii-oxford-john-lobb.webp',
  '/products/shoes/men/men-shoes-oxfords-2-whole-cut-oxford-berluti.webp',
  '/products/shoes/men/men-shoes-sandals-1-izmir-sandal-hermes.webp',
  '/products/shoes/men/men-shoes-sandals-2-rubber-slide-givenchy.webp',
  '/products/shoes/men/men-shoes-sneakers-1-b30-sneaker-dior.webp',
  '/products/shoes/men/men-shoes-sneakers-2-triple-s-sneaker-balenciaga.webp',
  // Shoes - Women
  '/products/shoes/women/women-shoes-boots-1-lug-boot-bottega-veneta.webp',
  '/products/shoes/women/women-shoes-boots-2-ankle-boot-saint-laurent.webp',
  '/products/shoes/women/women-shoes-flats-1-ballet-flats-chanel.webp',
  '/products/shoes/women/women-shoes-flats-2-varina-flats-salvatore-ferragamo.webp',
  '/products/shoes/women/women-shoes-heels-1-so-kate-christian-louboutin.webp',
  '/products/shoes/women/women-shoes-heels-2-valentino-garavani-rockstud-pump-valentino.webp',
  '/products/shoes/women/women-shoes-sandals-1-gilda-sandal-amina-muaddi.webp',
  '/products/shoes/women/women-shoes-sandals-2-tribute-sandal-saint-laurent.webp',
  '/products/shoes/women/women-shoes-sneakers-1-super-star-golden-goose.webp',
  '/products/shoes/women/women-shoes-sneakers-2-ace-sneaker-gucci.webp',
  // Watches - Men
  '/products/watches/men/men-watches-chronograph-1-daytona-rolex.webp',
  '/products/watches/men/men-watches-chronograph-2-speedmaster-omega.webp',
  '/products/watches/men/men-watches-classic-1-calatrava-patek-philippe.webp',
  '/products/watches/men/men-watches-classic-2-reverso-jaeger-lecoultre.webp',
  '/products/watches/men/men-watches-diver-1-submariner-rolex.webp',
  '/products/watches/men/men-watches-diver-2-seamaster-300-omega.webp',
  '/products/watches/men/men-watches-pilot-1-big-pilot-iwc.webp',
  '/products/watches/men/men-watches-pilot-2-navitimer-breitling.webp',
  '/products/watches/men/men-watches-skeleton-1-royal-oak-openworked-audemars-piguet.webp',
  '/products/watches/men/men-watches-skeleton-2-excalibur-spider-roger-dubuis.webp',
  // Watches - Women
  '/products/watches/women/women-watches-chronograph-1-speedmaster-38mm-omega.webp',
  '/products/watches/women/women-watches-chronograph-2-happy-sport-chrono-chopard.webp',
  '/products/watches/women/women-watches-classic-1-tank-francaise-cartier.webp',
  '/products/watches/women/women-watches-classic-2-ladymatic-omega.webp',
  '/products/watches/women/women-watches-diver-1-aqua-terra-omega.webp',
  '/products/watches/women/women-watches-diver-2-rolex-yacht-master-37-rolex.webp',
  '/products/watches/women/women-watches-pilot-1-pilot-mark-xx-iwc.webp',
  '/products/watches/women/women-watches-pilot-2-avenger-automatic-35-breitling.webp',
  '/products/watches/women/women-watches-skeleton-1-velvet-ribbon-roger-dubuis.webp',
  '/products/watches/women/women-watches-skeleton-2-millenary-audemars-piguet.webp',
];

// Known brand segments (longest first so multi-word brands match before single-word)
const BRANDS: string[] = [
  'brunello-cucinelli', 'salvatore-ferragamo', 'bottega-veneta',
  'louis-vuitton', 'saint-laurent', 'emilio-pucci', 'loro-piana',
  'tom-ford', 'off-white', 'ray-ban', 'van-cleef', 'patek-philippe',
  'audemars-piguet', 'rolls-royce', 'aston-martin', 'mercedes-benz',
  'ralph-lauren', 'stella-mccartney', 'alexander-mcqueen',
  'dolce-gabbana', 'jimmy-choo', 'john-lobb', 'roger-vivier',
  'de-beers', 'david-yurman', 'harry-winston', 'giorgio-armani',
  'jil-sander', 'the-row', 'moncler-grenoble', 'prada-linea-rossa',
  'max-mara',
  'hermes', 'chanel', 'cartier', 'dior', 'gucci', 'prada',
  'celine', 'moncler', 'balenciaga', 'fendi', 'loewe', 'versace',
  'valentino', 'givenchy', 'balmain', 'montblanc', 'persol',
  'bulgari', 'tiffany', 'chopard', 'rolex', 'omega', 'breitling',
  'iwc', 'tudor', 'hublot', 'zenith', 'ferrari', 'lamborghini',
  'porsche', 'bentley', 'maserati', 'bugatti', 'mclaren', 'pagani',
  'mercedes', 'bmw', 'rimowa', 'berluti', 'goyard', 'moynat',
  'jacquemus', 'pucci', 'burberry', 'brioni',
  'van-cleef-arpels', 'david-yurman', 'messika',
  'christian-louboutin', 'amina-muaddi', 'golden-goose',
  'john-lobb', 'tods',
  'patek-philippe', 'jaeger-lecoultre', 'audemars-piguet',
  'roger-dubuis',
  'versace-home', 'ralph-lauren-home', 'poltrona-frau', 'bb-italia',
  'herman-miller', 'fritz-hansen', 'carl-hansen', 'restoration-hardware',
  'lalique', 'hay', 'usm',
  'leonardo-da-vinci', 'sandro-botticelli', 'johannes-vermeer',
  'pierre-auguste-renoir', 'vincent-van-gogh', 'paul-cezanne',
  'salvador-dali', 'rene-magritte', 'jackson-pollock', 'mark-rothko',
  'jean-michel-basquiat', 'david-hockney', 'andy-warhol',
  'roy-lichtenstein', 'claude-monet', 'rembrandt',
];

// Map folder name → category ID used in the interests screen
const CATEGORY_MAP: Record<string, string> = {
  accessories: 'Accessories',
  bags: 'Handbags and Leather Goods',
  cars: 'Vehicles',
  clothing: 'Fashion and Apparel',
  art: 'Fine Art',
  fineart: 'Fine Art',
  furniture: 'Furniture',
  jewelry: 'Jewellery',
  shoes: 'Footwear',
  watches: 'Watches',
};

// Simple aliases (category-independent)
const SUBCATEGORY_ALIASES: Record<string, string> = {
  'mini': 'mini-bags',
  'shoulder': 'shoulder-bags',
  'tophandle': 'top-handle',
};

// Category-specific aliases (key: "category:subcategory")
const SUBCATEGORY_ALIASES_BY_CAT: Record<string, string> = {
  'cars:classic': 'classic-cars',
  'cars:sports': 'sports-cars',
  'art:pop-art': 'contemporary',
};

function titleCase(s: string): string {
  return s
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function parseBrand(rest: string): { name: string; brand: string } {
  for (const b of BRANDS) {
    if (rest.endsWith(b)) {
      const nameRaw = rest.slice(0, -(b.length + 1)); // remove "-brand"
      return { name: titleCase(nameRaw), brand: titleCase(b) };
    }
  }
  // Fallback: last segment is brand
  const parts = rest.split('-');
  const brand = parts.pop()!;
  return { name: titleCase(parts.join('-')), brand: titleCase(brand) };
}

/**
 * Parses a product filename into its parts.
 * Finds the number segment (e.g. "-1-", "-2-") and splits around it:
 *   prefix = everything before the number
 *   rest   = everything after the number (product name + brand)
 * Then splits the prefix into gender (optional), category, subcategory.
 */
function parseFilename(filename: string): {
  gender: 'male' | 'female' | 'unisex';
  categoryFolder: string;
  subcategoryRaw: string;
  rest: string;
} | null {
  // Find the number segment: "-{digits}-"
  const numMatch = filename.match(/^(.+?)-(\d+)-(.+)$/);
  if (!numMatch) return null;

  const prefix = numMatch[1]; // e.g. "men-bags-crossbody" or "art-post-impressionism"
  const rest = numMatch[3];   // e.g. "saffiano-crossbody-prada"

  const parts = prefix.split('-');
  let gender: 'male' | 'female' | 'unisex';
  let catStart: number;

  if (parts[0] === 'men' || parts[0] === 'women') {
    gender = parts[0] === 'men' ? 'male' : 'female';
    catStart = 1;
  } else {
    gender = 'unisex';
    catStart = 0;
  }

  // Category is the next segment after gender
  const categoryFolder = parts[catStart];
  // Subcategory is everything after category (supports multi-word like "post-impressionism")
  const subcategoryRaw = parts.slice(catStart + 1).join('-');

  if (!categoryFolder || !subcategoryRaw) return null;

  return { gender, categoryFolder, subcategoryRaw, rest };
}

export function discoverProducts(): Product[] {
  const products: Product[] = [];

  for (const path of IMAGE_PATHS) {
    const filename = path.split('/').pop()!.replace(/\.[^.]+$/, '');
    const parsed = parseFilename(filename);
    if (!parsed) continue;

    const { gender, categoryFolder, subcategoryRaw, rest } = parsed;

    const category = CATEGORY_MAP[categoryFolder];
    if (!category) continue;

    const subcategory = SUBCATEGORY_ALIASES_BY_CAT[`${categoryFolder}:${subcategoryRaw}`]
      || SUBCATEGORY_ALIASES[subcategoryRaw]
      || subcategoryRaw;
    const { name, brand } = parseBrand(rest);

    products.push({
      name,
      brand,
      price: '',
      image: path,
      description: DESCRIPTIONS[path] || '',
      category,
      subcategory,
      gender,
    });
  }

  return products;
}
