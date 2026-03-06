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

  // Watches (3rd)
  {
    name: 'Speedmaster Professional',
    brand: 'Omega',
    price: '$6,350',
    image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&h=600&fit=crop',
    description: 'The legendary Moonwatch with manual-wind calibre 1861 chronograph and hesalite crystal.',
    category: 'Watches',
  },

  // Jewelry (3rd)
  {
    name: 'Juste un Clou Bracelet',
    brand: 'Cartier',
    price: '$3,950',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop',
    description: 'Bold nail-inspired bracelet in 18K rose gold, a modern icon of subversive elegance.',
    category: 'Jewelry',
  },

  // Vehicles (3rd)
  {
    name: 'Continental GT Speed',
    brand: 'Bentley',
    price: '$274,900',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&h=600&fit=crop',
    description: 'Grand touring coupe with handcrafted interior, W12 engine producing 650 hp.',
    category: 'Vehicles',
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

  // Sunglasses (3rd)
  {
    name: 'Serpenti Viper',
    brand: 'Bulgari',
    price: '$680',
    image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&h=600&fit=crop',
    description: 'Cat-eye sunglasses with serpenti detailing on temples and gradient brown lenses.',
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

  // Fashion (3rd)
  {
    name: 'Monogram Sneaker',
    brand: 'Louis Vuitton',
    price: '$1,210',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop',
    description: 'Luxury sneaker with signature monogram canvas, calf leather trim, and rubber outsole.',
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

  // Fine Art (3rd)
  {
    name: 'Limited Edition Print',
    brand: 'Gagosian Gallery',
    price: '$4,800',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=600&fit=crop',
    description: 'Signed and numbered archival pigment print from an acclaimed contemporary artist, edition of 50.',
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

  // Cigars (3rd)
  {
    name: 'Serie V Melanio',
    brand: 'Oliva',
    price: '$22',
    image: 'https://images.unsplash.com/photo-1528459105426-b9548367069b?w=600&h=600&fit=crop',
    description: 'Award-winning Nicaraguan cigar with sun-grown Sumatra wrapper and rich, creamy smoke profile.',
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

  // Handbags (3rd)
  {
    name: 'Classic Flap Medium',
    brand: 'Chanel',
    price: '$10,800',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=600&fit=crop',
    description: 'Quilted lambskin flap bag with signature CC turn-lock, interwoven chain strap, and burgundy lining.',
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

  // Fine Wine (3rd)
  {
    name: 'Sassicaia 2019',
    brand: 'Tenuta San Guido',
    price: '$320',
    image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&h=600&fit=crop',
    description: 'Super Tuscan icon with Cabernet Sauvignon and Franc, notes of blackberry, cedar, and Mediterranean herbs.',
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

  // Yachts (3rd)
  {
    name: 'Explorer 62',
    brand: 'Sunseeker',
    price: '$2,800,000',
    image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=600&h=600&fit=crop',
    description: 'Seaworthy explorer yacht with flybridge, beach club, and twin Caterpillar diesel propulsion.',
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

  // Private Aviation (3rd)
  {
    name: 'Phenom 300E',
    brand: 'Embraer',
    price: '$10,200,000',
    image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&h=600&fit=crop',
    description: 'Best-selling light jet with Bossa Nova interior, 2,010 nm range, and single-pilot certification.',
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
  // Collectibles (3rd)
  {
    name: '1957 Mickey Mantle Card',
    brand: 'Topps',
    price: '$28,000',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
    description: 'PSA-graded vintage baseball card of the Yankees legend in near-mint condition.',
    category: 'Collectibles',
  },

  // Additional Watches
  {
    name: 'Nautilus 5711/1A',
    brand: 'Patek Philippe',
    price: '$35,000',
    image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&h=600&fit=crop',
    description: 'Legendary luxury sports watch with olive-green dial, self-winding calibre 26-330 SC movement.',
    category: 'Watches',
  },
  {
    name: 'Tank Française',
    brand: 'Cartier',
    price: '$4,150',
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=600&fit=crop',
    description: 'Elegant rectangular watch in stainless steel with chain-link bracelet and silvered dial.',
    category: 'Watches',
  },

  // Additional Jewelry
  {
    name: 'Tiffany T Wire Bracelet',
    brand: 'Tiffany & Co.',
    price: '$1,350',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop',
    description: 'Modern wire bracelet in 18k rose gold with clean geometric T motif at both ends.',
    category: 'Jewelry',
  },
  {
    name: 'B.zero1 Ring',
    brand: 'Bulgari',
    price: '$1,080',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop',
    description: 'Signature spiral ring in 18kt white gold inspired by the Colosseum architecture.',
    category: 'Jewelry',
  },

  // Additional Vehicles
  {
    name: 'Cayenne Turbo GT',
    brand: 'Porsche',
    price: '$185,000',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=600&fit=crop',
    description: 'Performance SUV with twin-turbo V8 producing 631 hp and active roll stabilization.',
    category: 'Vehicles',
  },
  {
    name: 'DBX707',
    brand: 'Aston Martin',
    price: '$239,000',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&h=600&fit=crop',
    description: 'Ultra-luxury SUV with 697 hp twin-turbo V8 and bespoke hand-stitched leather interior.',
    category: 'Vehicles',
  },

  // Additional Handbags
  {
    name: 'Peekaboo ISeeU Medium',
    brand: 'Fendi',
    price: '$5,200',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop',
    description: 'Structured leather handbag with iconic twist-lock closure and dual-compartment interior.',
    category: 'Handbags',
  },
  {
    name: 'Puzzle Bag',
    brand: 'Loewe',
    price: '$3,650',
    image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600&h=600&fit=crop',
    description: 'Geometric paneled calfskin bag that can be worn multiple ways, crafted in Spain.',
    category: 'Handbags',
  },

  // Additional Fine Wine
  {
    name: 'Opus One 2019',
    brand: 'Opus One',
    price: '$450',
    image: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6?w=600&h=600&fit=crop',
    description: 'Napa Valley Bordeaux blend with cassis, dark chocolate, and violet. A joint Mondavi-Rothschild venture.',
    category: 'Fine Wine',
  },
  {
    name: 'Cristal 2014',
    brand: 'Louis Roederer',
    price: '$310',
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=600&fit=crop',
    description: 'Prestige champagne in crystal-clear bottle with chalky minerality and white fruit complexity.',
    category: 'Fine Wine',
  },

  // Additional Fashion
  {
    name: 'Silk Pajama Set',
    brand: 'Tom Ford',
    price: '$3,290',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop',
    description: 'Pure silk lounge set with contrast piping and signature TF monogram on breast pocket.',
    category: 'Fashion',
  },
  {
    name: 'Reversible Belt',
    brand: 'Hermès',
    price: '$1,075',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
    description: 'Reversible leather belt in Togo and Swift calfskin with iconic H buckle in brushed palladium.',
    category: 'Fashion',
  },

  // Additional Sunglasses
  {
    name: 'Wayfarer Classic',
    brand: 'Ray-Ban',
    price: '$178',
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=600&h=600&fit=crop',
    description: 'Iconic trapezoidal sunglasses with acetate frame and crystal green G-15 lenses.',
    category: 'Sunglasses',
  },

  // Additional Fine Art
  {
    name: 'Neon Light Installation',
    brand: 'Pace Gallery',
    price: '$22,000',
    image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&h=600&fit=crop',
    description: 'Contemporary neon artwork exploring color and form, hand-bent glass tubes with argon gas.',
    category: 'Fine Art',
  },

  // Additional Cigars
  {
    name: 'Lusitania Gran Reserva',
    brand: 'Partagás',
    price: '$65',
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=600&fit=crop',
    description: 'Full-bodied double corona with earthy notes of leather, dark chocolate, and roasted coffee.',
    category: 'Cigars',
  },
];

export function getProductsForInterests(interests: Set<string>): Product[] {
  if (interests.size === 0) return PRODUCTS;
  return PRODUCTS.filter((p) => interests.has(p.category));
}

export default PRODUCTS;
