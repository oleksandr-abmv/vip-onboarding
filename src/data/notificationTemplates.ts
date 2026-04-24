/**
 * Personalized Notification copy for the NotificationsScreen hero card.
 *
 * Walks the user's selected interests in order, looks for the first
 * (category, subcategory) pair that has a sample message, and returns it.
 * Falls back to a category-level message, then a generic default.
 *
 * Category IDs match those in src/data/categoryConfig.ts.
 */

type NotifKey = `${string}/${string}`;

// (category, subcategory) → concrete "just dropped" copy
const BY_SUBCATEGORY: Record<NotifKey, string> = {
  // Watches
  'Watches/chronograph': 'A new Rolex Daytona just landed in your size.',
  'Watches/classic': 'A Patek Calatrava is being held for your review.',
  'Watches/complications': 'A Patek Philippe 5270 Perpetual Chronograph just arrived.',
  'Watches/diver': 'A Rolex Submariner allocation just opened.',
  'Watches/gmt': "A Rolex GMT-Master II 'Pepsi' is available in your size.",
  'Watches/pilot': 'An IWC Big Pilot just arrived at the boutique.',
  'Watches/skeleton': 'An Audemars Piguet Openworked is being offered privately.',

  // Cars
  'Vehicles/classic-cars': 'A 1962 Aston Martin DB5 is listed for private viewing.',
  'Vehicles/convertibles': 'A new Ferrari 812 GTS allocation just opened.',
  'Vehicles/coupes': 'A Bentley Continental GT coupe is being offered.',
  'Vehicles/electric': 'A Rolls-Royce Spectre is ready for a test drive.',
  'Vehicles/grand-tourers': 'A Bentley Continental GT Speed allocation just opened.',
  'Vehicles/hypercars': 'A Bugatti Chiron Super Sport allocation is available.',
  'Vehicles/sedans': 'A Rolls-Royce Phantom is listed for your consideration.',
  'Vehicles/sports-cars': 'A Ferrari SF90 Stradale is reserved for you to view.',
  'Vehicles/suvs': 'A Rolls-Royce Cullinan configuration slot just opened.',

  // Bags
  'Handbags and Leather Goods/backpacks': 'A Prada Re-Nylon Saffiano just arrived in stock.',
  'Handbags and Leather Goods/briefcases': 'A Berluti Un Jour briefcase is being held for you.',
  'Handbags and Leather Goods/clutches': 'A Givenchy 4G clutch just arrived in stock.',
  'Handbags and Leather Goods/crossbody': 'A Dior Saddle bag just arrived in a rare colorway.',
  'Handbags and Leather Goods/duffel': 'A Louis Vuitton Keepall 50 just arrived.',
  'Handbags and Leather Goods/messenger': 'A Bottega Veneta Intrecciato messenger is available.',
  'Handbags and Leather Goods/mini-bags': 'A Jacquemus Le Chiquito just arrived in your color.',
  'Handbags and Leather Goods/shoulder-bags': 'A Chanel Classic Flap is reserved for you to view.',
  'Handbags and Leather Goods/top-handle': 'A Hermès Kelly allocation just opened.',
  'Handbags and Leather Goods/totes': 'A Hermès Birkin just became available in your size.',

  // Jewelry
  'Jewellery/bangles': 'A Cartier Love bracelet is ready in your size.',
  'Jewellery/bracelets': 'A David Yurman Cable bracelet just arrived.',
  'Jewellery/brooches': 'A Van Cleef & Arpels Lotus brooch just surfaced.',
  'Jewellery/chains': 'A Cartier Juste un Clou chain is available in rose gold.',
  'Jewellery/cufflinks': 'A pair of Cartier Trinity cufflinks just arrived.',
  'Jewellery/earrings': "A Cartier Juste un Clou earring just arrived in your size.",
  'Jewellery/necklaces': 'A Bulgari Serpenti necklace is held for your review.',
  'Jewellery/rings': 'A Cartier Love ring just arrived in your size.',

  // Shoes
  'Footwear/boots': 'A pair of Bottega Veneta Chelsea boots just arrived.',
  'Footwear/derbies': 'A pair of John Lobb Philip II derbies is reserved for you.',
  'Footwear/flats': 'A pair of Chanel ballet flats just arrived in your size.',
  'Footwear/heels': 'A pair of Christian Louboutin So Kate heels is available.',
  'Footwear/loafers': 'A pair of Gucci Horsebit loafers just arrived in your size.',
  'Footwear/mules': 'A pair of Manolo Blahnik Maysale mules just arrived.',
  'Footwear/oxfords': 'A pair of John Lobb Philip II oxfords is ready.',
  'Footwear/sandals': 'A pair of Hermès Oran sandals just arrived in your size.',
  'Footwear/sneakers': 'A pair of Dior B30 sneakers just arrived.',
  'Footwear/wedges': 'A pair of Saint Laurent Tribute wedges is available.',

  // Wine & Spirits
  'Wine & Spirits/red-wine': 'A Château Latour allocation just opened for you.',
  'Wine & Spirits/white-wine': 'A Domaine Leflaive Montrachet is reserved for you.',
  'Wine & Spirits/champagne': 'A Krug Grande Cuvée 170ème just arrived.',
  'Wine & Spirits/whisky': 'A Macallan 25 Sherry Oak is held for your collection.',
  'Wine & Spirits/cognac': 'A Louis XIII decanter is available for private tasting.',
  'Wine & Spirits/tequila': 'A Clase Azul Ultra Extra Añejo just arrived.',
  'Wine & Spirits/rum': 'An Appleton Estate 50 Year allocation just opened.',

  // Cigars
  'Cigars/mild': 'A fresh Macanudo Café allocation just arrived.',
  'Cigars/medium': 'A Romeo y Julieta Churchill is being held for you.',
  'Cigars/medium-full': 'A Cohiba Behike 56 allocation just opened.',
  'Cigars/full': 'A Padrón 1964 Anniversary Maduro just arrived.',
  'Cigars/extra-full': 'A Liga Privada No. 9 Toro allocation is available.',

  // Collectibles
  'Collectibles/sneakers': 'An OG Air Jordan 1 Chicago just came to market.',
  'Collectibles/trading-cards': 'A PSA 10 1st Edition Charizard is being offered.',
  'Collectibles/coins': 'A 1933 Saint-Gaudens Double Eagle is listed at auction.',
  'Collectibles/stamps': 'A Penny Black 1840 in fine condition just surfaced.',
  'Collectibles/memorabilia': 'A signed Jordan game-worn jersey just surfaced at auction.',
  'Collectibles/toys-figures': 'A KAWS Bearbrick 1000% just arrived in its original box.',
  'Collectibles/comics': 'An Action Comics #1 graded slab is being offered privately.',
  'Collectibles/vinyl': "A first-press Beatles 'Butcher Cover' just surfaced.",

  // Yachts & Boats
  'Yachts & Boats/motor-yachts': 'A Sunseeker 95 is listed for private viewing.',
  'Yachts & Boats/sailing-yachts': 'An Oyster 885 is being offered for charter.',
  'Yachts & Boats/superyachts': 'A Feadship charter window just opened.',
  'Yachts & Boats/catamarans': 'A Sunreef 80 Power Eco is available for charter.',
  'Yachts & Boats/tenders': 'A Riva Aquariva Super is being offered for private sale.',
  'Yachts & Boats/classic-boats': 'A restored 1962 Riva Aquarama just came to market.',
  'Yachts & Boats/sportfishing': 'A Viking 92 Enclosed Bridge is listed for your review.',
  'Yachts & Boats/explorer': 'A Damen SeaXplorer 77 expedition yacht is available.',

  // Fine Art
  'Fine Art/renaissance': 'A Renaissance Old Master study is available at private sale.',
  'Fine Art/baroque': 'A Dutch Baroque work is being offered privately.',
  'Fine Art/impressionism': 'A Monet water-lilies study just came to market.',
  'Fine Art/post-impressionism': 'A Cézanne landscape is listed at private sale.',
  'Fine Art/surrealism': 'A Dalí lithograph is being offered at auction.',
  'Fine Art/abstract-expressionism': 'A Rothko color-field study is available privately.',
  'Fine Art/pop-art': 'A Warhol Marilyn screenprint just came to market.',
  'Fine Art/contemporary': 'A Basquiat work is being offered at private sale.',

  // Furniture
  'Furniture/art-deco': 'A Lalique crystal vase lamp just arrived at the showroom.',
  'Furniture/classic': 'A Ralph Lauren Home tufted sofa is being offered.',
  'Furniture/contemporary': 'A B&B Italia Charles sofa configuration slot just opened.',
  'Furniture/industrial': 'A Jean Prouvé Standard chair is available for your review.',
  'Furniture/mid-century': 'An Eames Lounge Chair just arrived at the showroom.',
  'Furniture/minimalist': 'A Fritz Hansen PK22 lounge chair is being held for you.',
  'Furniture/rustic': 'A reclaimed-oak dining table is listed for private sale.',
  'Furniture/scandinavian': 'A Fritz Hansen Egg chair just arrived in a rare fabric.',

  // Accessories
  'Accessories/casual': 'A new Loro Piana cashmere scarf just arrived in your color.',
  'Accessories/classic': 'A Hermès H-Buckle belt is ready in your size.',
  'Accessories/elegant': 'A Tom Ford silk bow tie just arrived at the boutique.',
  'Accessories/minimalist': 'A Bottega Veneta card holder is available in a rare color.',
  'Accessories/sporty': 'A Prada Linea Rossa pair is back in stock in your size.',
  'Accessories/streetwear': 'A Louis Vuitton Monogram beanie just arrived.',
  'Accessories/vintage': 'A vintage Persol 714 folding pair just surfaced.',

  // Clothing
  'Fashion and Apparel/casual': 'A Loro Piana cashmere polo just arrived in your size.',
  'Fashion and Apparel/classic': 'A Tom Ford Shelton suit is ready for your fitting.',
  'Fashion and Apparel/elegant': 'A Brioni silk tuxedo is being held for your review.',
  'Fashion and Apparel/minimalist': 'A Jil Sander cotton poplin shirt just arrived.',
  'Fashion and Apparel/sporty': 'A Moncler Grenoble ski vest just arrived in your size.',
  'Fashion and Apparel/streetwear': 'A Balenciaga oversized denim jacket is available.',
  'Fashion and Apparel/vintage': 'A Gucci GG jacquard cardigan just arrived.',
};

// Category-level fallbacks when no subcategory matched. Still name a concrete
// hero product so the copy never reads as generic filler.
const BY_CATEGORY: Record<string, string> = {
  'Watches': 'A Patek Philippe 5270 Perpetual Chronograph just arrived at the boutique.',
  'Vehicles': 'A new Ferrari 812 GTS allocation just opened for your review.',
  'Handbags and Leather Goods': 'A Hermès Birkin just became available in your size.',
  'Jewellery': 'A Cartier Love ring just arrived in your size.',
  'Footwear': 'A pair of John Lobb Philip II derbies is reserved for you.',
  'Wine & Spirits': 'A Macallan 25 Sherry Oak is being held for your collection.',
  'Cigars': 'A Cohiba Behike 56 allocation just opened.',
  'Collectibles': 'An Action Comics #1 graded slab is being offered privately.',
  'Yachts & Boats': 'A restored 1962 Riva Aquarama just came to market.',
  'Fine Art': 'A Basquiat work is being offered at private sale.',
  'Furniture': 'An Eames Lounge Chair just arrived at the showroom.',
  'Accessories': 'A new Loro Piana cashmere scarf just arrived in your color.',
  'Fashion and Apparel': 'A Tom Ford Shelton suit is ready for your fitting.',
};

const DEFAULT_MESSAGE = 'A new Patek Aquanaut just arrived in your size.';

export function personalizedNotification(
  selectedInterests: string[],
  subcategoriesByCategory: Record<string, string[]>,
): string {
  for (const catId of selectedInterests) {
    const subs = subcategoriesByCategory[catId] || [];
    for (const sub of subs) {
      const key = `${catId}/${sub}` as NotifKey;
      const msg = BY_SUBCATEGORY[key];
      if (msg) return msg;
    }
    const catMsg = BY_CATEGORY[catId];
    if (catMsg) return catMsg;
  }
  return DEFAULT_MESSAGE;
}
