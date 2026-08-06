import type { Product } from './products';

// ─── Specs ───────────────────────────────────────────────────────────────────
//
// What goes in the product page's **Details sheet**: the reference table a piece
// at this price is expected to have. A prototype stand-in for a real product
// feed, built the way `priceHistory` and `edits` are - deterministic from the
// piece's own name, so a product always reads the same and never contradicts
// itself between visits.
//
// **The fields follow the category**, because that is the whole point of a spec
// table: a watch has a movement and a water resistance, a bottle has a vintage
// and an ABV, a car has an engine. A shared list of generic rows would just be
// the meta line again, which is what this sheet replaced.
//
// Values are plausible rather than researched. They are here to show the shape
// of the page; swap `FIELDS` for a real feed and nothing else changes.

export interface Spec {
  label: string;
  value: string;
}

type Field = [label: string, values: string[]];

const FIELDS: Record<string, Field[]> = {
  'Fashion and Apparel': [
    ['Composition', ['100% cashmere', '100% virgin wool', 'Silk and cotton poplin', '90% wool, 10% cashmere']],
    ['Fit', ['Regular', 'Relaxed', 'Tailored', 'Boxy']],
    ['Lining', ['Unlined', 'Cupro', 'Silk']],
    ['Made in', ['Italy', 'Scotland', 'France', 'Portugal']],
    ['Care', ['Dry clean only', 'Hand wash cold, dry flat']],
  ],
  Footwear: [
    ['Upper', ['Box calf', 'Suede calfskin', 'Grained calf', 'Patent calf']],
    ['Sole', ['Leather, Goodyear welted', 'Leather with rubber insert', 'Blake stitched leather']],
    ['Last', ['Rounded', 'Almond', 'Chiselled']],
    ['Made in', ['England', 'Italy', 'France']],
    ['Care', ['Cedar trees recommended', 'Condition every 10 wears']],
  ],
  'Handbags and Leather Goods': [
    ['Material', ['Grained calfskin', 'Box calf', 'Intrecciato nappa', 'Saffiano leather']],
    ['Dimensions', ['38 x 28 x 12 cm', '30 x 22 x 10 cm', '42 x 30 x 14 cm', '25 x 18 x 8 cm']],
    ['Hardware', ['Palladium', 'Gold-plated brass', 'Ruthenium']],
    ['Interior', ['Two flat pockets, one zipped', 'One zipped pocket', 'Suede-lined, three compartments']],
    ['Made in', ['France', 'Italy']],
  ],
  Accessories: [
    ['Material', ['Grained calfskin, reversible', 'Box calf', 'Silk twill', 'Cashmere and silk']],
    ['Hardware', ['Palladium-plated', 'Gold-plated brass', 'Brushed steel']],
    ['Width', ['32 mm', '38 mm', '25 mm']],
    ['Made in', ['France', 'Italy']],
  ],
  Jewellery: [
    ['Metal', ['18k yellow gold', '18k white gold', '950 platinum', '18k rose gold']],
    ['Stones', ['Brilliant-cut diamonds, 0.42 ct', 'None', 'Pavé diamonds, 1.10 ct total']],
    ['Weight', ['14 g', '22 g', '31 g']],
    ['Hallmark', ['Struck at the Paris assay office', 'Struck at the London assay office']],
  ],
  Watches: [
    ['Movement', ['Automatic, in-house calibre', 'Manual winding', 'Automatic chronograph']],
    ['Power reserve', ['42 hours', '70 hours', '55 hours']],
    ['Case', ['Stainless steel', '18k yellow gold', 'Platinum', 'Titanium']],
    ['Case size', ['36 mm', '39 mm', '41 mm', '44 mm']],
    ['Crystal', ['Sapphire, anti-reflective', 'Box sapphire']],
    ['Water resistance', ['30 m', '50 m', '100 m']],
  ],
  Furniture: [
    ['Materials', ['Moulded plywood and leather', 'Powder-coated steel and glass', 'Solid walnut', 'Cast aluminium and cotton']],
    ['Dimensions', ['84 x 84 x 82 cm', '210 x 95 x 68 cm', '150 x 75 x 74 cm']],
    ['Designer', ['Charles and Ray Eames', 'Fritz Haller', 'Pierre Jeanneret', 'Studio archive']],
    ['First produced', ['1956', '1963', '1971', '1984']],
    ['Made in', ['Switzerland', 'Italy', 'United States']],
  ],
  'Fine Art': [
    ['Medium', ['Oil on canvas', 'Oil on poplar panel', 'Acrylic and enamel on canvas', 'Gouache on paper']],
    ['Dimensions', ['92 x 73 cm', '146 x 114 cm', '54 x 41 cm']],
    ['Signed', ['Lower right', 'Lower left', 'Verso']],
    ['Provenance', ['Private collection, Geneva', 'Acquired from the artist', "Estate of the artist"]],
    ['Framed', ['Yes, museum glass', 'Unframed']],
  ],
  Collectibles: [
    ['Year', ['1963', '1978', '1991', '2004']],
    ['Edition', ['1 of 250', '1 of 50', 'Unique', 'Open edition']],
    ['Condition', ['Mint', 'Near mint', 'Excellent']],
    ['Certification', ['Graded and encapsulated', 'Certificate of authenticity included']],
  ],
  'Wine & Spirits': [
    ['Region', ['Champagne, France', 'Pauillac, Bordeaux', 'Cognac, France', 'Islay, Scotland']],
    ['Vintage', ['2008', '2012', '1996', 'Non-vintage']],
    ['Volume', ['750 ml', '1.5 l magnum', '700 ml']],
    ['Strength', ['12.5% ABV', '40% ABV', '46% ABV']],
    ['Serve', ['8 to 10 °C', 'Decant one hour before', 'Neat, at room temperature']],
  ],
  Cigars: [
    ['Wrapper', ['Connecticut shade', 'Maduro', 'Corojo', 'Cameroon']],
    ['Length', ['124 mm', '152 mm', '178 mm']],
    ['Ring gauge', ['42', '50', '52', '58']],
    ['Origin', ['Cuba', 'Dominican Republic', 'Nicaragua']],
    ['Strength', ['Mild to medium', 'Medium', 'Medium to full']],
  ],
  'Fragrance & Oud': [
    ['Concentration', ['Eau de parfum', 'Parfum', 'Extrait de parfum']],
    ['Notes', ['Oud, rose, saffron', 'Bergamot, iris, vetiver', 'Amber, sandalwood, vanilla']],
    ['Volume', ['50 ml', '100 ml', '75 ml']],
    ['Made in', ['France', 'United Arab Emirates']],
  ],
  Vehicles: [
    ['Engine', ['3.7 l flat six, twin turbo', '6.5 l V12, naturally aspirated', '4.0 l V8, twin turbo']],
    ['Power', ['640 hp', '540 hp', '789 hp']],
    ['0 to 100 km/h', ['2.7 s', '3.2 s', '3.9 s']],
    ['Transmission', ['8-speed dual clutch', '7-speed dual clutch', '6-speed manual']],
    ['Year', ['2021', '2023', '2019']],
  ],
  'Yachts & Boats': [
    ['Length overall', ['18.6 m', '24.2 m', '32.0 m']],
    ['Beam', ['5.1 m', '6.4 m', '7.2 m']],
    ['Engines', ['Twin MAN V12, 1400 hp', 'Twin Volvo IPS 950', 'Single Yanmar 370 hp']],
    ['Berths', ['4 in two cabins', '6 in three cabins', '8 in four cabins']],
    ['Built', ['2018', '2021', '2023']],
  ],
};

/** For anything without a table of its own. */
const GENERIC: Field[] = [
  ['Materials', ['As described by the maker']],
  ['Origin', ['Italy', 'France', 'Switzerland']],
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** "HRM-4821": the maker's initials and a stable number. */
function reference(product: Product): string {
  const letters = product.brand.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const prefix = (letters.slice(0, 3) || 'VIP').padEnd(3, 'X');
  return `${prefix}-${(hash(product.name) % 9000) + 1000}`;
}

/**
 * The spec table for a piece. Category-appropriate rows, then the reference
 * every piece carries. A product with real `details` keeps them: those are
 * authored, and authored beats generated.
 */
export function getSpecs(product: Product): Spec[] {
  const fields = FIELDS[product.category] ?? GENERIC;
  const seed = hash(`${product.brand} ${product.name}`);

  const rows = fields.map(([label, values], i) => ({
    label,
    value: values[(seed + i * 131) % values.length],
  }));

  return [
    ...rows,
    { label: 'Brand', value: product.brand },
    { label: 'Reference', value: reference(product) },
  ];
}
