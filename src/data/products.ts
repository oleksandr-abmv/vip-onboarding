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
    image: 'https://images.pexels.com/photos/1637114/pexels-photo-1637114.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Ultra-premium Cuban cigar with rare medio tiempo leaf, box-pressed robusto gordo format.',
    category: 'Cigars',
  },
  {
    name: 'No. 2 Torpedo',
    brand: 'Montecristo',
    price: '$38',
    image: 'https://images.pexels.com/photos/2523812/pexels-photo-2523812.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Classic Cuban torpedo vitola with rich notes of cedar, cocoa, espresso, and aged leather.',
    category: 'Cigars',
  },

  // Cigars (3rd)
  {
    name: 'Serie V Melanio',
    brand: 'Oliva',
    price: '$22',
    image: 'https://images.pexels.com/photos/14941728/pexels-photo-14941728.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
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
    image: 'https://images.pexels.com/photos/66636/pexels-photo-66636.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
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
    image: 'https://images.pexels.com/photos/2224832/pexels-photo-2224832.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Full-bodied double corona with earthy notes of leather, dark chocolate, and roasted coffee.',
    category: 'Cigars',
  },
  {
    name: 'Siglo VI',
    brand: 'Cohiba',
    price: '$55',
    image: 'https://images.pexels.com/photos/4975635/pexels-photo-4975635.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Premium Cuban cigar with creamy, complex flavors of cedar, honey, and toasted nuts.',
    category: 'Cigars',
  },
  {
    name: 'Padrón 1964 Anniversary',
    brand: 'Padrón',
    price: '$28',
    image: 'https://images.pexels.com/photos/9419387/pexels-photo-9419387.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Box-pressed Nicaraguan masterpiece with rich notes of mocha, pepper, and aged tobacco.',
    category: 'Cigars',
  },
  {
    name: 'Davidoff Winston Churchill',
    brand: 'Davidoff',
    price: '$32',
    image: 'https://images.pexels.com/photos/13804794/pexels-photo-13804794.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Medium-bodied cigar with Dominican and Nicaraguan fillers, notes of cream, wood, and white pepper.',
    category: 'Cigars',
  },
  {
    name: 'Arturo Fuente OpusX',
    brand: 'Arturo Fuente',
    price: '$45',
    image: 'https://images.pexels.com/photos/47296/pexels-photo-47296.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Legendary Dominican puro with rare rosado wrapper, complex spice and sweet cedar character.',
    category: 'Cigars',
  },

  // Additional Sunglasses
  {
    name: 'Shield Sunglasses',
    brand: 'Versace',
    price: '$345',
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&h=600&fit=crop',
    description: 'Bold shield-style frames with gold Medusa logo and gradient grey lenses.',
    category: 'Sunglasses',
  },
  {
    name: 'Millionaires',
    brand: 'Louis Vuitton',
    price: '$685',
    image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&h=600&fit=crop',
    description: 'Iconic square sunglasses with monogram engraved lenses and gold-tone metal hardware.',
    category: 'Sunglasses',
  },
  {
    name: 'Panthère de Cartier',
    brand: 'Cartier',
    price: '$890',
    image: 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?w=600&h=600&fit=crop',
    description: 'Refined round frames with panther head temple tips and polarized blue lenses.',
    category: 'Sunglasses',
  },
  {
    name: 'GG Square',
    brand: 'Gucci',
    price: '$420',
    image: 'https://images.pexels.com/photos/1485031/pexels-photo-1485031.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Oversized square acetate frames with interlocking G logo and gradient brown lenses.',
    category: 'Sunglasses',
  },

  // Additional Fine Art
  {
    name: 'Ceramic Sculpture Series',
    brand: 'White Cube Gallery',
    price: '$18,000',
    image: 'https://images.unsplash.com/photo-1561214078-f3247647fc5e?w=600&h=600&fit=crop',
    description: 'Hand-formed glazed ceramic sculpture exploring organic forms and material tension.',
    category: 'Fine Art',
  },
  {
    name: 'Photographic Diptych',
    brand: 'Hauser & Wirth',
    price: '$12,500',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop',
    description: 'Large-scale archival photograph diptych capturing light and landscape in sublime detail.',
    category: 'Fine Art',
  },
  {
    name: 'Mixed Media Collage',
    brand: 'David Zwirner',
    price: '$8,600',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=600&fit=crop',
    description: 'Multi-layered collage combining found materials, paint, and photography on panel.',
    category: 'Fine Art',
  },
  {
    name: 'Kinetic Wall Piece',
    brand: 'Lisson Gallery',
    price: '$35,000',
    image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=600&h=600&fit=crop',
    description: 'Motorized wall-mounted sculpture with rotating elements creating ever-changing light patterns.',
    category: 'Fine Art',
  },

  // Additional Yachts
  {
    name: 'Flybridge 50',
    brand: 'Princess',
    price: '$1,900,000',
    image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=600&h=600&fit=crop',
    description: 'Elegant flybridge yacht with three cabins, teak cockpit, and Volvo IPS propulsion.',
    category: 'Yachts',
  },
  {
    name: 'S78',
    brand: 'Princess',
    price: '$3,400,000',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=600&fit=crop',
    description: 'Sporty 78-foot motor yacht with hydraulic swim platform and four luxury staterooms.',
    category: 'Yachts',
  },
  {
    name: 'Targa 43 Open',
    brand: 'Fairline',
    price: '$850,000',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=600&fit=crop',
    description: 'Open cruiser with twin helm seats, wet bar, and retractable sunroof over salon.',
    category: 'Yachts',
  },
  {
    name: 'Manhattan 68',
    brand: 'Sunseeker',
    price: '$2,600,000',
    image: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=600&h=600&fit=crop',
    description: 'Luxury flybridge yacht with full-beam master suite, garage for tender, and carbon hardtop.',
    category: 'Yachts',
  },
  {
    name: 'Aquariva Super',
    brand: 'Riva',
    price: '$750,000',
    image: 'https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=600&h=600&fit=crop',
    description: 'Iconic Italian runabout with mahogany decking, twin Yanmar engines, and open cockpit.',
    category: 'Yachts',
  },

  // Additional Private Aviation
  {
    name: 'Challenger 650',
    brand: 'Bombardier',
    price: '$35,000,000',
    image: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=600&h=600&fit=crop',
    description: 'Super-large cabin business jet with 4,000 nm range and advanced Vision flight deck.',
    category: 'Private Aviation',
  },
  {
    name: 'PC-24',
    brand: 'Pilatus',
    price: '$12,000,000',
    image: 'https://images.pexels.com/photos/14983522/pexels-photo-14983522.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Versatile light jet capable of short and unpaved runway operations with spacious cabin.',
    category: 'Private Aviation',
  },
  {
    name: 'Falcon 8X',
    brand: 'Dassault',
    price: '$58,000,000',
    image: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=600&h=600&fit=crop',
    description: 'Ultra-long-range trijet with 6,450 nm range, FalconEye HUD, and whisper-quiet cabin.',
    category: 'Private Aviation',
  },
  {
    name: 'Global 7500',
    brand: 'Bombardier',
    price: '$73,000,000',
    image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&h=600&fit=crop',
    description: 'Flagship business jet with four living spaces, full kitchen, and 7,700 nm range.',
    category: 'Private Aviation',
  },
  {
    name: 'HondaJet Elite S',
    brand: 'Honda Aircraft',
    price: '$5,800,000',
    image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&h=600&fit=crop',
    description: 'Over-the-wing engine mount design with class-leading fuel efficiency and cabin space.',
    category: 'Private Aviation',
  },

  // Additional Collectibles
  {
    name: 'Vintage Leica M3',
    brand: 'Leica',
    price: '$8,500',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop',
    description: 'Pristine 1954 rangefinder camera with original Summicron 50mm lens and leather case.',
    category: 'Collectibles',
  },
  {
    name: 'First Edition Gatsby',
    brand: 'Sotheby\'s',
    price: '$150,000',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop',
    description: 'First edition The Great Gatsby (1925) with original dust jacket in fine condition.',
    category: 'Collectibles',
  },
  {
    name: 'Vintage Rolex Daytona',
    brand: 'Rolex',
    price: '$250,000',
    image: 'https://images.pexels.com/photos/1910225/pexels-photo-1910225.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Ref. 6239 "Paul Newman" dial Cosmograph Daytona circa 1968 with full provenance.',
    category: 'Collectibles',
  },
  {
    name: 'Art Deco Cartier Clock',
    brand: 'Cartier',
    price: '$42,000',
    image: 'https://images.unsplash.com/photo-1415604934674-561df9abf539?w=600&h=600&fit=crop',
    description: 'Mystery clock from the 1930s with rock crystal, onyx, and diamond-set hands.',
    category: 'Collectibles',
  },
  {
    name: 'Signed Jordan Jersey',
    brand: 'Upper Deck',
    price: '$12,000',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=600&fit=crop',
    description: 'UDA-authenticated Michael Jordan #23 Bulls jersey with hologram and display case.',
    category: 'Collectibles',
  },

  // Additional Watches
  {
    name: 'Reverso Classic',
    brand: 'Jaeger-LeCoultre',
    price: '$8,200',
    image: 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=600&h=600&fit=crop',
    description: 'Art Deco reversible case watch with guilloché dial and hand-wound calibre 822/2.',
    category: 'Watches',
  },
  {
    name: 'Portugieser Chronograph',
    brand: 'IWC',
    price: '$9,150',
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&h=600&fit=crop',
    description: '41mm chronograph with 69355 calibre, 46-hour power reserve, and domed sapphire crystal.',
    category: 'Watches',
  },
  {
    name: 'Overseas Automatic',
    brand: 'Vacheron Constantin',
    price: '$24,500',
    image: 'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=600&h=600&fit=crop',
    description: 'Luxury sports watch with interchangeable bracelet system and Geneva Seal certified movement.',
    category: 'Watches',
  },

  // Additional Jewelry
  {
    name: 'Alhambra Necklace',
    brand: 'Van Cleef & Arpels',
    price: '$4,250',
    image: 'https://images.pexels.com/photos/3641059/pexels-photo-3641059.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Iconic Vintage Alhambra pendant in 18K yellow gold with mother-of-pearl quatrefoil motif.',
    category: 'Jewelry',
  },
  {
    name: 'Trinity Ring',
    brand: 'Cartier',
    price: '$1,420',
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&h=600&fit=crop',
    description: 'Three interlocking bands in white, yellow, and rose gold symbolizing love, fidelity, and friendship.',
    category: 'Jewelry',
  },
  {
    name: 'Serpenti Bracelet',
    brand: 'Bulgari',
    price: '$32,000',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop',
    description: 'Coiling snake bracelet in 18kt rose gold with diamond-set head and emerald eyes.',
    category: 'Jewelry',
  },

  // Additional Vehicles
  {
    name: 'Urus Performante',
    brand: 'Lamborghini',
    price: '$260,000',
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=600&fit=crop',
    description: 'Super SUV with twin-turbo V8 producing 666 hp, adaptive air suspension, and carbon ceramic brakes.',
    category: 'Vehicles',
  },
  {
    name: 'Cullinan Black Badge',
    brand: 'Rolls-Royce',
    price: '$382,000',
    image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=600&h=600&fit=crop',
    description: 'Ultra-luxury SUV with darkened chrome, starlight headliner, and 6.75L twin-turbo V12.',
    category: 'Vehicles',
  },
  {
    name: 'Taycan Turbo S',
    brand: 'Porsche',
    price: '$187,600',
    image: 'https://images.unsplash.com/photo-1619362280286-f1f8fd5032ed?w=600&h=600&fit=crop',
    description: 'All-electric sports sedan with 750 hp overboost, 2.4s 0-60, and 800V architecture.',
    category: 'Vehicles',
  },

  // Additional Handbags
  {
    name: 'Birkin 30',
    brand: 'Hermès',
    price: '$13,200',
    image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop',
    description: 'Iconic top-handle bag in Togo leather with gold hardware and signature sangles closure.',
    category: 'Handbags',
  },
  {
    name: 'Lady Dior Medium',
    brand: 'Dior',
    price: '$6,500',
    image: 'https://images.pexels.com/photos/16690455/pexels-photo-16690455.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Cannage-stitched lambskin with D-I-O-R charms, top handles, and optional shoulder strap.',
    category: 'Handbags',
  },
  {
    name: 'Cassette Bag',
    brand: 'Bottega Veneta',
    price: '$3,200',
    image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=600&h=600&fit=crop',
    description: 'Padded intrecciato weave crossbody in butter-soft nappa leather with magnetic closure.',
    category: 'Handbags',
  },

  // Additional Fine Wine
  {
    name: 'Penfolds Grange 2018',
    brand: 'Penfolds',
    price: '$750',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&h=600&fit=crop',
    description: 'Australia\'s most celebrated Shiraz with blackberry, dark chocolate, and new French oak complexity.',
    category: 'Fine Wine',
  },
  {
    name: 'Screaming Eagle 2019',
    brand: 'Screaming Eagle',
    price: '$3,200',
    image: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&h=600&fit=crop',
    description: 'Cult Napa Cabernet with cassis, graphite, and violet. One of California\'s rarest allocations.',
    category: 'Fine Wine',
  },
  {
    name: 'Krug Grande Cuvée',
    brand: 'Krug',
    price: '$285',
    image: 'https://images.unsplash.com/photo-1598306442928-4d90f32c6866?w=600&h=600&fit=crop',
    description: 'Multi-vintage prestige champagne blending 120+ wines across 10+ years for unmatched depth.',
    category: 'Fine Wine',
  },

  // Additional Fashion
  {
    name: 'Double-Breasted Blazer',
    brand: 'Brunello Cucinelli',
    price: '$4,195',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=600&fit=crop',
    description: 'Italian-made blazer in lightweight wool-silk blend with horn buttons and patch pockets.',
    category: 'Fashion',
  },
  {
    name: 'Cashmere Turtleneck',
    brand: 'Loro Piana',
    price: '$1,850',
    image: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&h=600&fit=crop',
    description: 'Fine-gauge baby cashmere turtleneck in navy with ribbed cuffs and hem.',
    category: 'Fashion',
  },
  {
    name: 'Triple Stitch Sneaker',
    brand: 'Zegna',
    price: '$850',
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop',
    description: 'Luxury slip-on sneaker in PELLETESSUTA woven leather with signature triple cross-stitch.',
    category: 'Fashion',
  },
  // Extra Watches (to reach 12+)
  {
    name: 'Luminor Marina',
    brand: 'Panerai',
    price: '$8,900',
    image: 'https://images.pexels.com/photos/13325931/pexels-photo-13325931.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Italian-designed 44mm dive watch with crown-protecting bridge device and 3-day power reserve.',
    category: 'Watches',
  },
  {
    name: 'Big Pilot 43',
    brand: 'IWC',
    price: '$14,200',
    image: 'https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=600&h=600&fit=crop',
    description: 'Iconic aviator watch with conical crown, soft-iron inner case for magnetic protection.',
    category: 'Watches',
  },
  {
    name: 'Fifty Fathoms',
    brand: 'Blancpain',
    price: '$15,300',
    image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&h=600&fit=crop',
    description: 'The original modern dive watch with unidirectional bezel and 300m water resistance.',
    category: 'Watches',
  },
  {
    name: 'Aqua Terra 150M',
    brand: 'Omega',
    price: '$5,600',
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&h=600&fit=crop',
    description: 'Versatile sports watch with teak-pattern dial and Master Chronometer certified movement.',
    category: 'Watches',
  },

  // Extra Jewelry (to reach 12+)
  {
    name: 'Clash de Cartier Ring',
    brand: 'Cartier',
    price: '$3,600',
    image: 'https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?w=600&h=600&fit=crop',
    description: 'Bold geometric ring in 18K rose gold with square studs and clou motifs.',
    category: 'Jewelry',
  },
  {
    name: 'Move Pavé Necklace',
    brand: 'Messika',
    price: '$5,800',
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&h=600&fit=crop',
    description: 'Diamond-set pendant with three moving diamonds in 18K white gold cage design.',
    category: 'Jewelry',
  },
  {
    name: 'Frivole Earrings',
    brand: 'Van Cleef & Arpels',
    price: '$7,900',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&h=600&fit=crop',
    description: 'Mirror-polished 18K yellow gold flower earrings with diamond heart centers.',
    category: 'Jewelry',
  },
  {
    name: 'Possession Ring',
    brand: 'Piaget',
    price: '$2,450',
    image: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=600&h=600&fit=crop',
    description: 'Turning ring in 18K rose gold with freely rotating band set with brilliant-cut diamonds.',
    category: 'Jewelry',
  },

  // Extra Vehicles (to reach 12+)
  {
    name: 'AMG GT 63 S',
    brand: 'Mercedes-AMG',
    price: '$178,000',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=600&fit=crop',
    description: '4-door coupé with handcrafted 4.0L biturbo V8, 630 hp, and drift mode.',
    category: 'Vehicles',
  },
  {
    name: 'M8 Competition',
    brand: 'BMW',
    price: '$133,000',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=600&fit=crop',
    description: 'Grand tourer with 617 hp twin-turbo V8, carbon roof, and M xDrive all-wheel system.',
    category: 'Vehicles',
  },
  {
    name: 'Huracán Tecnica',
    brand: 'Lamborghini',
    price: '$238,000',
    image: 'https://images.pexels.com/photos/9448215/pexels-photo-9448215.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Rear-wheel drive V10 supercar with 631 hp and advanced LDVI vehicle dynamics system.',
    category: 'Vehicles',
  },
  {
    name: 'Ghost',
    brand: 'Rolls-Royce',
    price: '$340,000',
    image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=600&h=600&fit=crop',
    description: 'Post-opulent luxury sedan with Planar suspension, illuminated fascia, and bespoke interior.',
    category: 'Vehicles',
  },

  // Extra Handbags (to reach 12+)
  {
    name: 'Saddle Bag',
    brand: 'Dior',
    price: '$4,100',
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&h=600&fit=crop',
    description: 'Iconic curved saddle silhouette in grained calfskin with antique gold-finish hardware.',
    category: 'Handbags',
  },
  {
    name: 'GG Marmont Mini',
    brand: 'Gucci',
    price: '$1,290',
    image: 'https://images.unsplash.com/photo-1614179689702-355944cd0918?w=600&h=600&fit=crop',
    description: 'Chevron-quilted leather bag with Double G hardware and chain shoulder strap.',
    category: 'Handbags',
  },
  {
    name: 'Lola Bag',
    brand: 'Burberry',
    price: '$2,490',
    image: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=600&h=600&fit=crop',
    description: 'Soft pillow bag in quilted lambskin with Thomas Burberry monogram clasp.',
    category: 'Handbags',
  },
  {
    name: 'Jodie Mini',
    brand: 'Bottega Veneta',
    price: '$2,800',
    image: 'https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=600&h=600&fit=crop',
    description: 'Knotted hobo bag in signature intrecciato nappa leather with sculptural silhouette.',
    category: 'Handbags',
  },

  // Extra Fine Wine (to reach 12+)
  {
    name: 'Tignanello 2020',
    brand: 'Antinori',
    price: '$120',
    image: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&h=600&fit=crop',
    description: 'Pioneer Super Tuscan with Sangiovese, Cabernet Sauvignon, and Cabernet Franc blend.',
    category: 'Fine Wine',
  },
  {
    name: 'Pétrus 2018',
    brand: 'Pétrus',
    price: '$4,500',
    image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600&h=600&fit=crop',
    description: 'Legendary Right Bank Merlot from Pomerol with truffle, plum, and mineral complexity.',
    category: 'Fine Wine',
  },
  {
    name: 'Barolo Monfortino 2015',
    brand: 'Giacomo Conterno',
    price: '$680',
    image: 'https://images.unsplash.com/photo-1566995541428-f2246c17cda1?w=600&h=600&fit=crop',
    description: 'Riserva Barolo aged 7 years in Slavonian oak with tar, roses, and extraordinary longevity.',
    category: 'Fine Wine',
  },
  {
    name: 'Vega Sicilia Único 2012',
    brand: 'Vega Sicilia',
    price: '$490',
    image: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=600&h=600&fit=crop',
    description: 'Spain\'s most prestigious red with decade-long aging, blackcurrant, tobacco, and spice.',
    category: 'Fine Wine',
  },

  // Extra Fashion (to reach 12+)
  {
    name: 'Logo Silk Scarf',
    brand: 'Hermès',
    price: '$445',
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=600&fit=crop',
    description: 'Hand-rolled 90cm silk twill scarf with equestrian print and vibrant colorway.',
    category: 'Fashion',
  },
  {
    name: 'Monogram Scarf',
    brand: 'Louis Vuitton',
    price: '$575',
    image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&h=600&fit=crop',
    description: 'Soft cashmere-silk blend scarf with signature monogram jacquard weave.',
    category: 'Fashion',
  },
  {
    name: 'Horsebit Loafer',
    brand: 'Gucci',
    price: '$920',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=600&fit=crop',
    description: 'Classic leather loafer with gold-tone horsebit hardware and leather sole.',
    category: 'Fashion',
  },
  {
    name: 'Trench Coat',
    brand: 'Burberry',
    price: '$2,290',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=600&fit=crop',
    description: 'Heritage cotton gabardine trench with check lining, epaulets, and storm shield.',
    category: 'Fashion',
  },

  // Extra Sunglasses (to reach 12+)
  {
    name: 'Santos de Cartier',
    brand: 'Cartier',
    price: '$1,050',
    image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=600&fit=crop',
    description: 'Square navigator frames with brushed platinum finish and polarized lenses.',
    category: 'Sunglasses',
  },
  {
    name: 'Medusa Biggie',
    brand: 'Versace',
    price: '$295',
    image: 'https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=600&h=600&fit=crop',
    description: 'Bold oversized rectangle frames with gold Medusa medallion on temples.',
    category: 'Sunglasses',
  },
  {
    name: 'Le Specs Halfmoon',
    brand: 'Prada',
    price: '$425',
    image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&h=600&fit=crop',
    description: 'Geometric half-rim sunglasses with metal bridge and gradient lenses.',
    category: 'Sunglasses',
  },
  {
    name: 'Cat Eye',
    brand: 'Tom Ford',
    price: '$455',
    image: 'https://images.pexels.com/photos/2622187/pexels-photo-2622187.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Exaggerated cat-eye acetate frames with signature T-hinge and gradient smoke lenses.',
    category: 'Sunglasses',
  },

  // Extra Fine Art (to reach 12+)
  {
    name: 'Glass Sculpture',
    brand: 'Perrotin Gallery',
    price: '$28,000',
    image: 'https://images.pexels.com/photos/1249532/pexels-photo-1249532.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Hand-blown Murano glass sculpture with iridescent finish and organic form.',
    category: 'Fine Art',
  },
  {
    name: 'Oil on Canvas Landscape',
    brand: 'Sotheby\'s',
    price: '$42,000',
    image: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=600&h=600&fit=crop',
    description: 'Contemporary landscape painting with luminous atmospheric perspective and impasto technique.',
    category: 'Fine Art',
  },
  {
    name: 'Steel Mobile',
    brand: 'Gagosian Gallery',
    price: '$19,500',
    image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=600&h=600&fit=crop',
    description: 'Hanging kinetic sculpture in polished stainless steel inspired by Calder tradition.',
    category: 'Fine Art',
  },
  {
    name: 'Textile Wall Art',
    brand: 'Lehmann Maupin',
    price: '$16,000',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=600&fit=crop',
    description: 'Large-scale woven tapestry combining traditional craft with contemporary abstract design.',
    category: 'Fine Art',
  },

  // Extra Cigars (to reach 12+)
  {
    name: 'God of Fire Serie B',
    brand: 'Arturo Fuente',
    price: '$52',
    image: 'https://images.pexels.com/photos/14546641/pexels-photo-14546641.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Ultra-premium cigar aged 5 years with complex notes of cocoa, espresso, and aged leather.',
    category: 'Cigars',
  },
  {
    name: 'Añejo Shark',
    brand: 'Arturo Fuente',
    price: '$35',
    image: 'https://images.pexels.com/photos/19798373/pexels-photo-19798373.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Limited edition torpedo with Connecticut Broadleaf Maduro wrapper aged in cognac barrels.',
    category: 'Cigars',
  },
  {
    name: 'La Flor Dominicana',
    brand: 'Andalusian Bull',
    price: '$18',
    image: 'https://images.pexels.com/photos/20025994/pexels-photo-20025994.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Bold Chisel-pressed figurado with Ecuadorian Corojo wrapper and full-bodied smoke.',
    category: 'Cigars',
  },
  {
    name: 'Liga Privada No. 9',
    brand: 'Drew Estate',
    price: '$16',
    image: 'https://images.pexels.com/photos/20528612/pexels-photo-20528612.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Connecticut Broadleaf Oscuro wrapper with Brazilian Mata Fina binder, rich and full.',
    category: 'Cigars',
  },

  // Extra Yachts (to reach 12+)
  {
    name: 'Ocean Alexander 90R',
    brand: 'Ocean Alexander',
    price: '$7,500,000',
    image: 'https://images.pexels.com/photos/8911490/pexels-photo-8911490.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Revolution series superyacht with Evan K Marshall interior and sky lounge.',
    category: 'Yachts',
  },
  {
    name: 'Navetta 73',
    brand: 'Absolute',
    price: '$4,200,000',
    image: 'https://images.pexels.com/photos/31977873/pexels-photo-31977873.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Long-range displacement yacht with main deck master suite and Seakeeper stabilizer.',
    category: 'Yachts',
  },
  {
    name: 'V-Class 55',
    brand: 'Ferretti',
    price: '$1,600,000',
    image: 'https://images.unsplash.com/photo-1560507074-b9eb43faab00?w=600&h=600&fit=crop',
    description: 'Sporty planing yacht with wide-body design, three cabins, and hydraulic bathing platform.',
    category: 'Yachts',
  },
  {
    name: 'Prestige 520',
    brand: 'Prestige',
    price: '$980,000',
    image: 'https://images.pexels.com/photos/15883439/pexels-photo-15883439.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Elegant flybridge with panoramic salon windows, three cabins, and Volvo IPS joystick docking.',
    category: 'Yachts',
  },

  // Extra Private Aviation (to reach 12+)
  {
    name: 'Learjet 75 Liberty',
    brand: 'Bombardier',
    price: '$9,900,000',
    image: 'https://images.pexels.com/photos/29112729/pexels-photo-29112729.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Light jet with executive suite seating, 2,040 nm range, and Garmin G5000 avionics.',
    category: 'Private Aviation',
  },
  {
    name: 'Praetor 600',
    brand: 'Embraer',
    price: '$21,000,000',
    image: 'https://images.unsplash.com/photo-1504150558240-0b4fd8946624?w=600&h=600&fit=crop',
    description: 'Super-midsize jet with flat floor, 4,018 nm range, and full fly-by-wire controls.',
    category: 'Private Aviation',
  },
  {
    name: 'Citation CJ4 Gen2',
    brand: 'Textron Aviation',
    price: '$9,500,000',
    image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&h=600&fit=crop',
    description: 'Light jet with stand-up cabin, 2,165 nm range, and single-pilot operation.',
    category: 'Private Aviation',
  },
  {
    name: 'ACJ TwoTwenty',
    brand: 'Airbus',
    price: '$80,000,000',
    image: 'https://images.pexels.com/photos/20562287/pexels-photo-20562287.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    description: 'Ultra-wide VIP bizliner with 785 sq ft cabin, 5,650 nm range, and living room altitude.',
    category: 'Private Aviation',
  },

  // Extra Collectibles (to reach 12+)
  {
    name: 'Fabergé Egg Pendant',
    brand: 'Fabergé',
    price: '$6,200',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop',
    description: 'Miniature egg pendant in 18K gold with royal blue enamel and diamond-set band.',
    category: 'Collectibles',
  },
  {
    name: 'Apollo 11 Photo Print',
    brand: 'NASA Heritage',
    price: '$18,000',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&h=600&fit=crop',
    description: 'Vintage silver gelatin print from the 1969 lunar mission with full provenance.',
    category: 'Collectibles',
  },
  {
    name: 'Antique Pocket Watch',
    brand: 'Breguet',
    price: '$35,000',
    image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600&h=600&fit=crop',
    description: '19th century gold pocket watch with enamel dial, Breguet numerals, and moon phase.',
    category: 'Collectibles',
  },
  {
    name: 'Rare Stamp Collection',
    brand: 'Stanley Gibbons',
    price: '$22,000',
    image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=600&h=600&fit=crop',
    description: 'Curated set of 19th century British Empire stamps in museum-quality preservation.',
    category: 'Collectibles',
  },
];

export function getProductsForInterests(interests: Set<string>): Product[] {
  if (interests.size === 0) return PRODUCTS;
  return PRODUCTS.filter((p) => interests.has(p.category));
}

export default PRODUCTS;
