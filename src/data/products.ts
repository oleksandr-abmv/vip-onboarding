export interface Product {
  name: string;
  brand: string;
  price: string;
  image: string;
  description: string;
  category: string;
}

const PRODUCTS: Product[] = [
  // Vehicles
  {
    name: '911 GT3 RS',
    brand: 'Porsche',
    price: '$223,800',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=600&fit=crop',
    description: 'Track-focused sports car with 4.0L naturally aspirated flat-six producing 518 hp and rear-axle steering.',
    category: 'Vehicles',
  },
  {
    name: 'SF90 Stradale',
    brand: 'Ferrari',
    price: '$524,000',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=600&fit=crop',
    description: 'Plug-in hybrid supercar with 986 combined horsepower from a twin-turbo V8 and three electric motors.',
    category: 'Vehicles',
  },

  // Jewelry
  {
    name: 'Serpenti Viper Necklace',
    brand: 'Bulgari',
    price: '$22,500',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop',
    description: 'Iconic serpentine necklace in 18kt white gold with full pav\u00e9 diamonds totaling 5.26 carats.',
    category: 'Jewelry',
  },
  {
    name: 'Love Bracelet',
    brand: 'Cartier',
    price: '$7,600',
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=600&fit=crop',
    description: 'Signature oval bracelet in 18K yellow gold featuring the iconic screw motif design since 1969.',
    category: 'Jewelry',
  },

  // Watches
  {
    name: 'Royal Oak 15500ST',
    brand: 'Audemars Piguet',
    price: '$29,900',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=600&fit=crop',
    description: 'Iconic 41mm luxury sports watch with octagonal bezel, integrated bracelet, and calibre 4302 movement.',
    category: 'Watches',
  },
  {
    name: 'Submariner Date 126610LN',
    brand: 'Rolex',
    price: '$10,250',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop',
    description: 'Professional dive watch in Oystersteel with Cerachrom bezel insert and calibre 3235 movement.',
    category: 'Watches',
  },

  // Sunglasses
  {
    name: 'Aviator Classic RB3025',
    brand: 'Ray-Ban',
    price: '$163',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
    description: 'Timeless pilot-shape sunglasses with G-15 crystal green lenses and polished gold-tone metal frame.',
    category: 'Sunglasses',
  },
  {
    name: 'DiorSignature B3U',
    brand: 'Dior',
    price: '$490',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop',
    description: 'Butterfly silhouette in gold-finish metal with gradient lenses and signature CD motif on temples.',
    category: 'Sunglasses',
  },

  // Fashion
  {
    name: 'Baby Cashmere Overcoat',
    brand: 'Loro Piana',
    price: '$7,450',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop',
    description: 'Double-breasted overcoat in pure baby cashmere with horn buttons and full silk lining.',
    category: 'Fashion',
  },
  {
    name: 'Classic Motorcycle Jacket',
    brand: 'Saint Laurent',
    price: '$5,490',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop',
    description: 'Iconic biker jacket in supple lambskin leather with asymmetric zip, epaulets, and belted hem.',
    category: 'Fashion',
  },

  // Fine Art
  {
    name: 'Abstract Composition',
    brand: 'Contemporary Gallery',
    price: '$15,000',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop',
    description: 'Large-format abstract expressionist painting with vibrant color fields and gestural brushwork on canvas.',
    category: 'Fine Art',
  },
  {
    name: 'Bronze Figure in Motion',
    brand: 'Modern Atelier',
    price: '$9,200',
    image: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600&h=600&fit=crop',
    description: 'Hand-cast lost-wax bronze sculpture with natural patina finish, exploring the human form in movement.',
    category: 'Fine Art',
  },

  // Cigars
  {
    name: 'Behike BHK 56',
    brand: 'Cohiba',
    price: '$480',
    image: 'https://images.unsplash.com/photo-1589994160839-163cd867cfe8?w=600&h=600&fit=crop',
    description: 'Ultra-premium Cuban cigar with rare medio tiempo leaf, box-pressed robusto gordo format.',
    category: 'Cigars',
  },
  {
    name: 'No. 2 Torpedo',
    brand: 'Montecristo',
    price: '$38',
    image: 'https://images.unsplash.com/photo-1574279606130-09958dc756f7?w=600&h=600&fit=crop',
    description: 'Classic Cuban torpedo vitola with rich notes of cedar, cocoa, espresso, and aged leather.',
    category: 'Cigars',
  },

  // Handbags
  {
    name: 'Kelly 28 Sellier',
    brand: 'Herm\u00e8s',
    price: '$11,400',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop',
    description: 'Structured handbag in Epsom calfskin with palladium hardware, signature tournant clasp, and top handle.',
    category: 'Handbags',
  },
  {
    name: 'Neverfull MM',
    brand: 'Louis Vuitton',
    price: '$2,030',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop',
    description: 'Versatile tote in signature monogram canvas with natural cowhide leather trim and textile lining.',
    category: 'Handbags',
  },

  // Fine Wine
  {
    name: 'Ch\u00e2teau Margaux 2015',
    brand: 'Ch\u00e2teau Margaux',
    price: '$850',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=600&fit=crop',
    description: 'First Growth Bordeaux with silky tannins, black cassis, and violet aromatics. James Suckling 99 pts.',
    category: 'Fine Wine',
  },
  {
    name: 'Dom P\u00e9rignon Vintage 2013',
    brand: 'Dom P\u00e9rignon',
    price: '$265',
    image: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=600&h=600&fit=crop',
    description: 'Prestige cuv\u00e9e champagne with complex notes of citrus, toasted almond, and fresh brioche.',
    category: 'Fine Wine',
  },

  // Yachts
  {
    name: 'Grande 27 Metri',
    brand: 'Azimut',
    price: '$4,500,000',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600&h=600&fit=crop',
    description: 'Luxury motor yacht with carbon-fiber hard top, four ensuite cabins, and D2P Volvo IPS propulsion.',
    category: 'Yachts',
  },
  {
    name: '88 Florida',
    brand: 'Riva',
    price: '$6,200,000',
    image: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=600&h=600&fit=crop',
    description: 'Open-style 88-foot superyacht combining Italian craftsmanship with cutting-edge naval architecture.',
    category: 'Yachts',
  },

  // Private Aviation
  {
    name: 'Citation Longitude',
    brand: 'Textron Aviation',
    price: '$28,000,000',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600&h=600&fit=crop',
    description: 'Super-midsize business jet with stand-up flat-floor cabin, 3,500 nm range, and Garmin G5000 avionics.',
    category: 'Private Aviation',
  },
  {
    name: 'G700',
    brand: 'Gulfstream',
    price: '$75,000,000',
    image: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=600&h=600&fit=crop',
    description: 'Flagship ultra-long-range jet with 7,500 nm range, five living areas, and handcrafted cabin for 19 guests.',
    category: 'Private Aviation',
  },

  // Collectibles
  {
    name: 'Perpetual Calendar 5320G',
    brand: 'Patek Philippe',
    price: '$95,000',
    image: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=600&h=600&fit=crop',
    description: 'Grand complication perpetual calendar in 18K white gold with moon phases and leap-year indicator.',
    category: 'Collectibles',
  },
  {
    name: 'Shakespeare First Folio Page',
    brand: 'Christie\u2019s',
    price: '$45,000',
    image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=600&h=600&fit=crop',
    description: 'Authenticated leaf from the 1623 First Folio with provenance certificate and archival preservation.',
    category: 'Collectibles',
  },
];

export function getProductsForInterests(interests: Set<string>): Product[] {
  if (interests.size === 0) return PRODUCTS;
  return PRODUCTS.filter((p) => interests.has(p.category));
}

export default PRODUCTS;
