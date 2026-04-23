/**
 * Seed products for categories that don't have imagery yet.
 * All use the VIP logo as a placeholder image, per the uniform-placeholder
 * convention in CLAUDE.md. When real imagery arrives, move each product
 * to a proper image file and drop it from this list.
 */

import type { Product } from './products';

const IMG = '/vip-logo.svg';

const PLACEHOLDER_PRODUCTS: Product[] = [
  // ──────────────────────────────── CIGARS (by intensity) ────────────────

  // Mild
  { category: 'Cigars', subcategory: 'mild', name: 'Cafe', brand: 'Macanudo', price: '', image: IMG, description: 'Soft Connecticut wrapper, smooth and mellow.', gender: 'unisex' },
  { category: 'Cigars', subcategory: 'mild', name: 'White Series No. 2', brand: 'Montecristo', price: '', image: IMG, description: 'Creamy Dominican blend, approachable.', gender: 'unisex' },

  // Medium
  { category: 'Cigars', subcategory: 'medium', name: 'OpusX', brand: 'Arturo Fuente', price: '', image: IMG, description: 'Cult Dominican puro, elegant and rare.', gender: 'unisex' },
  { category: 'Cigars', subcategory: 'medium', name: 'Winston Churchill The Traveller', brand: 'Davidoff', price: '', image: IMG, description: 'Refined blend with global provenance.', gender: 'unisex' },
  { category: 'Cigars', subcategory: 'medium', name: 'ESG 24 Year Salute', brand: 'Ashton', price: '', image: IMG, description: 'Aged Dominican estate tobacco.', gender: 'unisex' },

  // Medium-full
  { category: 'Cigars', subcategory: 'medium-full', name: 'Behike 56', brand: 'Cohiba', price: '', image: IMG, description: 'The flagship Havana, balanced and storied.', gender: 'unisex' },
  { category: 'Cigars', subcategory: 'medium-full', name: 'No. 2 Torpedo', brand: 'Montecristo', price: '', image: IMG, description: 'Classic Cuban torpedo, smooth and full.', gender: 'unisex' },
  { category: 'Cigars', subcategory: 'medium-full', name: 'Serie D No. 4 Robusto', brand: 'Partagás', price: '', image: IMG, description: 'Bold and earthy Havana robusto.', gender: 'unisex' },

  // Full-bodied
  { category: 'Cigars', subcategory: 'full', name: '1926 Serie No. 40 Maduro', brand: 'Padrón', price: '', image: IMG, description: 'Rich maduro with cocoa depth.', gender: 'unisex' },
  { category: 'Cigars', subcategory: 'full', name: 'Le Bijou 1922 Torpedo', brand: 'My Father', price: '', image: IMG, description: 'Full-bodied with espresso notes.', gender: 'unisex' },
  { category: 'Cigars', subcategory: 'full', name: 'OpusX Angels Share', brand: 'Arturo Fuente', price: '', image: IMG, description: 'Rare allocation for collectors.', gender: 'unisex' },

  // Extra full
  { category: 'Cigars', subcategory: 'extra-full', name: 'Triple Maduro', brand: 'Camacho', price: '', image: IMG, description: 'Layered maduro, bold and powerful.', gender: 'unisex' },
  { category: 'Cigars', subcategory: 'extra-full', name: 'Rare Corojo', brand: 'Punch', price: '', image: IMG, description: 'Spicy corojo wrapper, intense finish.', gender: 'unisex' },
  { category: 'Cigars', subcategory: 'extra-full', name: 'Serie V Melanio', brand: 'Oliva', price: '', image: IMG, description: 'Sungrown wrapper, deep and robust.', gender: 'unisex' },

  // ──────────────────────────────── COLLECTIBLES ─────────────────────────

  // Sneakers
  { category: 'Collectibles', subcategory: 'sneakers', name: 'Air Jordan 1 Chicago 1985 OG', brand: 'Nike', price: '', image: IMG, description: 'Original colourway, grail-tier sneaker.', gender: 'unisex' },
  { category: 'Collectibles', subcategory: 'sneakers', name: 'Air Force 1 by Virgil Abloh', brand: 'Louis Vuitton x Nike', price: '', image: IMG, description: 'Landmark luxury-streetwear collab.', gender: 'unisex' },
  { category: 'Collectibles', subcategory: 'sneakers', name: 'Air MAG Back to the Future', brand: 'Nike', price: '', image: IMG, description: 'Self-lacing limited release.', gender: 'unisex' },

  // Trading cards
  { category: 'Collectibles', subcategory: 'trading-cards', name: 'Charizard 1st Edition Base Set', brand: 'Pokémon', price: '', image: IMG, description: 'Holographic first-edition, graded PSA.', gender: 'unisex' },
  { category: 'Collectibles', subcategory: 'trading-cards', name: 'Black Lotus Alpha', brand: 'Magic: The Gathering', price: '', image: IMG, description: 'Alpha-set power nine, mint condition.', gender: 'unisex' },
  { category: 'Collectibles', subcategory: 'trading-cards', name: 'Mickey Mantle 1952 Rookie', brand: 'Topps', price: '', image: IMG, description: 'Iconic post-war baseball rookie.', gender: 'unisex' },

  // Coins
  { category: 'Collectibles', subcategory: 'coins', name: '1933 Saint-Gaudens Double Eagle', brand: 'US Mint', price: '', image: IMG, description: 'Legendary $20 gold, auction-grade.', gender: 'unisex' },
  { category: 'Collectibles', subcategory: 'coins', name: 'Morgan Silver Dollar Carson City', brand: 'US Mint', price: '', image: IMG, description: 'Frontier-era silver in proof grade.', gender: 'unisex' },
  { category: 'Collectibles', subcategory: 'coins', name: '1oz Krugerrand', brand: 'South African Mint', price: '', image: IMG, description: 'Classic gold bullion coin.', gender: 'unisex' },

  // Stamps
  { category: 'Collectibles', subcategory: 'stamps', name: 'Penny Black 1840', brand: 'Royal Mail', price: '', image: IMG, description: 'The world first adhesive postage stamp.', gender: 'unisex' },
  { category: 'Collectibles', subcategory: 'stamps', name: 'Inverted Jenny C3a 1918', brand: 'US Postal Service', price: '', image: IMG, description: 'Famed printing error, airmail icon.', gender: 'unisex' },
  { category: 'Collectibles', subcategory: 'stamps', name: '1c Magenta 1856', brand: 'British Guiana', price: '', image: IMG, description: 'Storied unique philatelic rarity.', gender: 'unisex' },

  // Memorabilia
  { category: 'Collectibles', subcategory: 'memorabilia', name: 'Game-Worn Bulls Jersey', brand: 'Michael Jordan', price: '', image: IMG, description: 'Authenticated NBA-era piece.', gender: 'unisex' },
  { category: 'Collectibles', subcategory: 'memorabilia', name: 'Signed Baseball', brand: 'Babe Ruth', price: '', image: IMG, description: 'Period-signed, provenance documented.', gender: 'unisex' },
  { category: 'Collectibles', subcategory: 'memorabilia', name: 'Thrilla in Manila Gloves', brand: 'Muhammad Ali', price: '', image: IMG, description: 'Fight-worn boxing gloves, 1975.', gender: 'unisex' },

  // Toys & figures
  { category: 'Collectibles', subcategory: 'toys-figures', name: 'Companion 4ft Figure', brand: 'KAWS', price: '', image: IMG, description: 'Gallery-scale vinyl art toy.', gender: 'unisex' },
  { category: 'Collectibles', subcategory: 'toys-figures', name: 'Bearbrick 1000%', brand: 'Medicom Toy', price: '', image: IMG, description: 'Limited collaboration sculpture.', gender: 'unisex' },
  { category: 'Collectibles', subcategory: 'toys-figures', name: 'Sixth-Scale Figure', brand: 'Hot Toys', price: '', image: IMG, description: 'Museum-grade film character figure.', gender: 'unisex' },

  // ──────────────────────────────── WINE & SPIRITS ───────────────────────

  // Red wine
  { category: 'Wine & Spirits', subcategory: 'red-wine', name: 'La Tâche Grand Cru', brand: 'Domaine de la Romanée-Conti', price: '', image: IMG, description: 'Monopole Burgundy, silky and layered.', gender: 'unisex' },
  { category: 'Wine & Spirits', subcategory: 'red-wine', name: 'Pétrus', brand: 'Château Pétrus', price: '', image: IMG, description: 'Pomerol Merlot, dense and velvety.', gender: 'unisex' },
  { category: 'Wine & Spirits', subcategory: 'red-wine', name: 'Cabernet Sauvignon', brand: 'Screaming Eagle', price: '', image: IMG, description: 'Napa cult producer, bold and refined.', gender: 'unisex' },

  // White wine
  { category: 'Wine & Spirits', subcategory: 'white-wine', name: 'Montrachet Grand Cru', brand: 'Domaine Leflaive', price: '', image: IMG, description: 'Top-tier Burgundy Chardonnay.', gender: 'unisex' },
  { category: 'Wine & Spirits', subcategory: 'white-wine', name: 'Meursault', brand: 'Coche-Dury', price: '', image: IMG, description: 'Cult white Burgundy, mineral and precise.', gender: 'unisex' },
  { category: 'Wine & Spirits', subcategory: 'white-wine', name: "Château d'Yquem Sauternes", brand: "Château d'Yquem", price: '', image: IMG, description: 'Legendary dessert wine.', gender: 'unisex' },

  // Champagne
  { category: 'Wine & Spirits', subcategory: 'champagne', name: 'P3 Plénitude', brand: 'Dom Pérignon', price: '', image: IMG, description: 'Third-plateau long-aged prestige cuvée.', gender: 'unisex' },
  { category: 'Wine & Spirits', subcategory: 'champagne', name: 'Clos du Mesnil', brand: 'Krug', price: '', image: IMG, description: 'Single-vineyard Blanc de Blancs.', gender: 'unisex' },
  { category: 'Wine & Spirits', subcategory: 'champagne', name: 'Cristal', brand: 'Louis Roederer', price: '', image: IMG, description: 'Tsar-era prestige cuvée.', gender: 'unisex' },

  // Whisky
  { category: 'Wine & Spirits', subcategory: 'whisky', name: '25 Year Sherry Oak', brand: 'The Macallan', price: '', image: IMG, description: 'Classic Speyside single malt.', gender: 'unisex' },
  { category: 'Wine & Spirits', subcategory: 'whisky', name: '55 Year', brand: 'Yamazaki', price: '', image: IMG, description: 'Flagship Japanese single malt.', gender: 'unisex' },
  { category: 'Wine & Spirits', subcategory: 'whisky', name: '23 Year Family Reserve', brand: 'Pappy Van Winkle', price: '', image: IMG, description: 'Kentucky bourbon, cult allocation.', gender: 'unisex' },

  // Cognac & brandy
  { category: 'Wine & Spirits', subcategory: 'cognac', name: 'Louis XIII', brand: 'Rémy Martin', price: '', image: IMG, description: 'Centenary Grande Champagne cognac.', gender: 'unisex' },
  { category: 'Wine & Spirits', subcategory: 'cognac', name: 'Paradis Impérial', brand: 'Hennessy', price: '', image: IMG, description: 'Rare eaux-de-vie assemblage.', gender: 'unisex' },
  { category: 'Wine & Spirits', subcategory: 'cognac', name: 'Cohiba Extra Old', brand: 'Martell', price: '', image: IMG, description: 'Collaboration release with Cohiba.', gender: 'unisex' },

  // Tequila
  { category: 'Wine & Spirits', subcategory: 'tequila', name: 'Ultra', brand: 'Clase Azul', price: '', image: IMG, description: 'Five-year aged ultra-premium tequila.', gender: 'unisex' },
  { category: 'Wine & Spirits', subcategory: 'tequila', name: '1942', brand: 'Don Julio', price: '', image: IMG, description: 'Añejo with caramel and oak notes.', gender: 'unisex' },
  { category: 'Wine & Spirits', subcategory: 'tequila', name: 'Añejo', brand: 'Casa Dragones', price: '', image: IMG, description: 'Small-batch aged Jalisco tequila.', gender: 'unisex' },

  // Rum
  { category: 'Wine & Spirits', subcategory: 'rum', name: 'XO', brand: 'Ron Zacapa', price: '', image: IMG, description: 'Guatemalan solera-aged rum.', gender: 'unisex' },
  { category: 'Wine & Spirits', subcategory: 'rum', name: '50 Year Independence Reserve', brand: 'Appleton Estate', price: '', image: IMG, description: 'Ultra-aged Jamaican rum.', gender: 'unisex' },
  { category: 'Wine & Spirits', subcategory: 'rum', name: '2005 Exceptional Cask', brand: 'Foursquare', price: '', image: IMG, description: 'Barbados single-estate rum.', gender: 'unisex' },

  // ──────────────────────────────── YACHTS & BOATS ───────────────────────

  // Motor yachts
  { category: 'Yachts & Boats', subcategory: 'motor-yachts', name: 'Grande 35 Metri', brand: 'Azimut', price: '', image: IMG, description: 'Tri-deck Italian flagship.', gender: 'unisex' },
  { category: 'Yachts & Boats', subcategory: 'motor-yachts', name: '88 Yacht', brand: 'Sunseeker', price: '', image: IMG, description: 'British performance motor yacht.', gender: 'unisex' },
  { category: 'Yachts & Boats', subcategory: 'motor-yachts', name: '1000', brand: 'Ferretti', price: '', image: IMG, description: 'Flagship Italian motor yacht.', gender: 'unisex' },

  // Sailing yachts
  { category: 'Yachts & Boats', subcategory: 'sailing-yachts', name: '885', brand: 'Oyster', price: '', image: IMG, description: 'Bluewater luxury sailing yacht.', gender: 'unisex' },
  { category: 'Yachts & Boats', subcategory: 'sailing-yachts', name: '88', brand: 'Swan', price: '', image: IMG, description: 'Finnish high-performance sailing yacht.', gender: 'unisex' },
  { category: 'Yachts & Boats', subcategory: 'sailing-yachts', name: 'WallyCento', brand: 'Wally', price: '', image: IMG, description: 'Carbon racer-cruiser, 100ft class.', gender: 'unisex' },

  // Superyachts
  { category: 'Yachts & Boats', subcategory: 'superyachts', name: 'Custom 82m', brand: 'Feadship', price: '', image: IMG, description: 'Dutch bespoke superyacht.', gender: 'unisex' },
  { category: 'Yachts & Boats', subcategory: 'superyachts', name: 'Black Pearl', brand: 'Oceanco', price: '', image: IMG, description: '106m sail-assisted superyacht.', gender: 'unisex' },
  { category: 'Yachts & Boats', subcategory: 'superyachts', name: 'Dilbar', brand: 'Lürssen', price: '', image: IMG, description: '156m German superyacht build.', gender: 'unisex' },

  // Catamarans
  { category: 'Yachts & Boats', subcategory: 'catamarans', name: '620', brand: 'Lagoon', price: '', image: IMG, description: 'Flagship cruising catamaran.', gender: 'unisex' },
  { category: 'Yachts & Boats', subcategory: 'catamarans', name: '80 Eco', brand: 'Sunreef', price: '', image: IMG, description: 'Solar-assisted luxury catamaran.', gender: 'unisex' },
  { category: 'Yachts & Boats', subcategory: 'catamarans', name: 'Alegria 67', brand: 'Fountaine Pajot', price: '', image: IMG, description: 'Spacious owners-version catamaran.', gender: 'unisex' },

  // Tenders & day boats
  { category: 'Yachts & Boats', subcategory: 'tenders', name: 'Picnic Boat 40', brand: 'Hinckley', price: '', image: IMG, description: 'Jet-drive New England day boat.', gender: 'unisex' },
  { category: 'Yachts & Boats', subcategory: 'tenders', name: 'Rivamare', brand: 'Riva', price: '', image: IMG, description: 'Italian lacquered day cruiser.', gender: 'unisex' },
  { category: 'Yachts & Boats', subcategory: 'tenders', name: 'Tender 48', brand: 'Wally', price: '', image: IMG, description: 'Compact carbon superyacht tender.', gender: 'unisex' },

  // Classic boats
  { category: 'Yachts & Boats', subcategory: 'classic-boats', name: 'Aquarama 1962', brand: 'Riva', price: '', image: IMG, description: 'Restored mahogany Italian icon.', gender: 'unisex' },
  { category: 'Yachts & Boats', subcategory: 'classic-boats', name: 'Continental 1958', brand: 'Chris-Craft', price: '', image: IMG, description: 'American heritage runabout.', gender: 'unisex' },
  { category: 'Yachts & Boats', subcategory: 'classic-boats', name: 'Sportabout', brand: 'Hacker-Craft', price: '', image: IMG, description: 'Hand-built American mahogany.', gender: 'unisex' },

  // Sportfishing
  { category: 'Yachts & Boats', subcategory: 'sportfishing', name: '76 Convertible', brand: 'Viking', price: '', image: IMG, description: 'Tournament-grade sportfishing yacht.', gender: 'unisex' },
  { category: 'Yachts & Boats', subcategory: 'sportfishing', name: 'GT70', brand: 'Hatteras', price: '', image: IMG, description: 'Long-range sportfishing platform.', gender: 'unisex' },
  { category: 'Yachts & Boats', subcategory: 'sportfishing', name: '44 Express', brand: 'Bertram', price: '', image: IMG, description: 'Deep-V offshore fishing classic.', gender: 'unisex' },

  // Explorer
  { category: 'Yachts & Boats', subcategory: 'explorer', name: '85 Explorer', brand: 'Arksen', price: '', image: IMG, description: 'Ocean-going expedition yacht.', gender: 'unisex' },
  { category: 'Yachts & Boats', subcategory: 'explorer', name: 'SeaXplorer 77', brand: 'Damen', price: '', image: IMG, description: 'Polar-rated expedition superyacht.', gender: 'unisex' },
  { category: 'Yachts & Boats', subcategory: 'explorer', name: '50 Expedition', brand: 'Bering', price: '', image: IMG, description: 'Steel-hulled trawler explorer.', gender: 'unisex' },

  // ──────────────────────────────── BAGS (Women) ─────────────────────────

  // Backpacks
  { category: 'Handbags and Leather Goods', subcategory: 'backpacks', name: 'Re-Nylon Backpack', brand: 'Prada', price: '', image: IMG, description: 'Recycled nylon icon, modernised.', gender: 'female' },
  { category: 'Handbags and Leather Goods', subcategory: 'backpacks', name: 'Goya Small Backpack', brand: 'Loewe', price: '', image: IMG, description: 'Soft Spanish leather in a sleek silhouette.', gender: 'female' },
  { category: 'Handbags and Leather Goods', subcategory: 'backpacks', name: 'Gabrielle Backpack', brand: 'Chanel', price: '', image: IMG, description: 'Quilted leather with chain straps.', gender: 'female' },

  // ──────────────────────────────── CARS (new subs) ──────────────────────

  // Convertibles
  { category: 'Vehicles', subcategory: 'convertibles', name: '911 Cabriolet', brand: 'Porsche', price: '', image: IMG, description: 'Flagship convertible sports car.', gender: 'unisex' },
  { category: 'Vehicles', subcategory: 'convertibles', name: 'Continental GTC', brand: 'Bentley', price: '', image: IMG, description: 'Grand-touring convertible.', gender: 'unisex' },
  { category: 'Vehicles', subcategory: 'convertibles', name: 'Portofino M', brand: 'Ferrari', price: '', image: IMG, description: 'Front-engine convertible GT.', gender: 'unisex' },

  // Grand Tourers
  { category: 'Vehicles', subcategory: 'grand-tourers', name: 'Continental GT', brand: 'Bentley', price: '', image: IMG, description: 'The definitive grand tourer.', gender: 'unisex' },
  { category: 'Vehicles', subcategory: 'grand-tourers', name: 'DB12', brand: 'Aston Martin', price: '', image: IMG, description: 'British GT with cross-country poise.', gender: 'unisex' },
  { category: 'Vehicles', subcategory: 'grand-tourers', name: 'Roma', brand: 'Ferrari', price: '', image: IMG, description: 'Elegant front-engine Ferrari GT.', gender: 'unisex' },

  // ──────────────────────────────── JEWELRY (Men - Cufflinks) ────────────

  { category: 'Jewellery', subcategory: 'cufflinks', name: 'Onyx Cufflinks', brand: 'Montblanc', price: '', image: IMG, description: 'Polished black stone cufflinks.', gender: 'male' },
  { category: 'Jewellery', subcategory: 'cufflinks', name: 'Trinity Cufflinks', brand: 'Cartier', price: '', image: IMG, description: 'Three-gold signature cufflinks.', gender: 'male' },
  { category: 'Jewellery', subcategory: 'cufflinks', name: 'Signature Cufflinks', brand: 'Tiffany & Co.', price: '', image: IMG, description: 'Sterling silver heritage design.', gender: 'male' },

  // ──────────────────────────────── JEWELRY (Women - Brooches, Chains) ───

  // Brooches
  { category: 'Jewellery', subcategory: 'brooches', name: 'Panthère Brooch', brand: 'Cartier', price: '', image: IMG, description: 'Iconic panther motif in gold and onyx.', gender: 'female' },
  { category: 'Jewellery', subcategory: 'brooches', name: 'Plume Brooch', brand: 'Van Cleef & Arpels', price: '', image: IMG, description: 'Feather motif with pavé diamonds.', gender: 'female' },
  { category: 'Jewellery', subcategory: 'brooches', name: 'Camellia Brooch', brand: 'Chanel', price: '', image: IMG, description: 'House-signature flower in white gold.', gender: 'female' },

  // Chains (women)
  { category: 'Jewellery', subcategory: 'chains', name: 'Juste un Clou Chain', brand: 'Cartier', price: '', image: IMG, description: 'Nail motif chain in rose gold.', gender: 'female' },
  { category: 'Jewellery', subcategory: 'chains', name: 'Chaîne d\'Ancre', brand: 'Hermès', price: '', image: IMG, description: 'House-signature anchor-link chain.', gender: 'female' },
  { category: 'Jewellery', subcategory: 'chains', name: 'Nudo Chain', brand: 'Pomellato', price: '', image: IMG, description: 'Italian goldsmith fine chain.', gender: 'female' },

  // ──────────────────────────────── SHOES (Men - Derbies) ────────────────

  { category: 'Footwear', subcategory: 'derbies', name: 'Westminster Derby', brand: 'John Lobb', price: '', image: IMG, description: 'Hand-lasted Northampton derby.', gender: 'male' },
  { category: 'Footwear', subcategory: 'derbies', name: 'Alessandro Derby', brand: 'Berluti', price: '', image: IMG, description: 'Patinated Venezia leather derby.', gender: 'male' },
  { category: 'Footwear', subcategory: 'derbies', name: 'Kanye Derby', brand: 'Hermès', price: '', image: IMG, description: 'Sleek leather derby with contrast stitch.', gender: 'male' },

  // ──────────────────────────────── SHOES (Women - Mules, Wedges) ────────

  // Mules
  { category: 'Footwear', subcategory: 'mules', name: 'Oasis Mule', brand: 'Hermès', price: '', image: IMG, description: 'House-signature leather mule.', gender: 'female' },
  { category: 'Footwear', subcategory: 'mules', name: 'Two-Tone Mule', brand: 'Chanel', price: '', image: IMG, description: 'Slingback-influenced mule silhouette.', gender: 'female' },
  { category: 'Footwear', subcategory: 'mules', name: 'Le Loafer Mule', brand: 'Saint Laurent', price: '', image: IMG, description: 'Tailored loafer reworked as a mule.', gender: 'female' },

  // Wedges
  { category: 'Footwear', subcategory: 'wedges', name: 'Cataclou Wedge', brand: 'Christian Louboutin', price: '', image: IMG, description: 'Studded espadrille wedge.', gender: 'female' },
  { category: 'Footwear', subcategory: 'wedges', name: 'Leather Wedge', brand: 'Gucci', price: '', image: IMG, description: 'Platform wedge in smooth leather.', gender: 'female' },
  { category: 'Footwear', subcategory: 'wedges', name: 'Cork Wedge', brand: 'Chanel', price: '', image: IMG, description: 'Quilted upper on a natural-cork wedge.', gender: 'female' },

  // ──────────────────────────────── WATCHES (new subs) ───────────────────

  // Complications
  { category: 'Watches', subcategory: 'complications', name: 'Perpetual Calendar', brand: 'Patek Philippe', price: '', image: IMG, description: 'Reference horology complication.', gender: 'unisex' },
  { category: 'Watches', subcategory: 'complications', name: 'Tourbillon', brand: 'Audemars Piguet', price: '', image: IMG, description: 'Haute horlogerie tourbillon movement.', gender: 'unisex' },
  { category: 'Watches', subcategory: 'complications', name: 'Master Ultra Thin Moon', brand: 'Jaeger-LeCoultre', price: '', image: IMG, description: 'Moonphase dress complication.', gender: 'unisex' },

  // GMT
  { category: 'Watches', subcategory: 'gmt', name: 'GMT-Master II', brand: 'Rolex', price: '', image: IMG, description: 'The reference travel watch.', gender: 'unisex' },
  { category: 'Watches', subcategory: 'gmt', name: 'Aquanaut Travel Time', brand: 'Patek Philippe', price: '', image: IMG, description: 'Dual-timezone sports complication.', gender: 'unisex' },
  { category: 'Watches', subcategory: 'gmt', name: 'Pilot Worldtimer', brand: 'IWC', price: '', image: IMG, description: 'World-time pilot\'s watch.', gender: 'unisex' },

  // ──────────────────────────────── COLLECTIBLES (new subs) ──────────────

  // Comics
  { category: 'Collectibles', subcategory: 'comics', name: 'Action Comics No. 1', brand: 'DC Comics', price: '', image: IMG, description: 'Superman debut, 1938.', gender: 'unisex' },
  { category: 'Collectibles', subcategory: 'comics', name: 'Amazing Fantasy No. 15', brand: 'Marvel Comics', price: '', image: IMG, description: 'Spider-Man debut, 1962.', gender: 'unisex' },
  { category: 'Collectibles', subcategory: 'comics', name: 'Detective Comics No. 27', brand: 'DC Comics', price: '', image: IMG, description: 'Batman debut, 1939.', gender: 'unisex' },

  // Vinyl records
  { category: 'Collectibles', subcategory: 'vinyl', name: 'The White Album First Pressing', brand: 'The Beatles', price: '', image: IMG, description: 'Low-number UK first pressing.', gender: 'unisex' },
  { category: 'Collectibles', subcategory: 'vinyl', name: 'Pink Moon First Pressing', brand: 'Nick Drake', price: '', image: IMG, description: 'Original Island Records issue.', gender: 'unisex' },
  { category: 'Collectibles', subcategory: 'vinyl', name: 'Kind of Blue Mono', brand: 'Miles Davis', price: '', image: IMG, description: 'Original six-eye Columbia mono.', gender: 'unisex' },

  // ──────────────────────────────── FURNITURE (Industrial) ───────────────

  { category: 'Furniture', subcategory: 'industrial', name: 'Beat Pendant Light', brand: 'Tom Dixon', price: '', image: IMG, description: 'Hammered brass pendant.', gender: 'unisex' },
  { category: 'Furniture', subcategory: 'industrial', name: 'Steel Console Table', brand: 'Restoration Hardware', price: '', image: IMG, description: 'Raw-steel console with reclaimed wood.', gender: 'unisex' },
  { category: 'Furniture', subcategory: 'industrial', name: '606 Universal Shelf', brand: 'Vitsoe', price: '', image: IMG, description: 'Dieter Rams modular shelving.', gender: 'unisex' },
];

export default PLACEHOLDER_PRODUCTS;
