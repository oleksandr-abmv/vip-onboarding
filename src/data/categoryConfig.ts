export interface Subcategory {
  id: string;
  label: string;
  subtitle?: string;
  image?: string; // filename only, e.g. 'casual.webp' (optional - use icon fallback if absent)
  icon?: string;  // Material Symbols Rounded glyph - used as placeholder when no image
}

export interface CategoryConfig {
  id: string;
  name: string;
  folder: string; // subfolder name under /images/subcategories/
  gendered: boolean; // whether images differ by gender (men/women subfolders)
  title: string;
  description: string;
  subcategories: Subcategory[];
  subcategoriesWomen?: Subcategory[]; // optional different subcategories for women
}

export function getSubcategoryImagePath(config: CategoryConfig, imageFile: string, gender: string | null): string {
  if (config.gendered) {
    const genderFolder = gender === 'female' ? 'women' : 'men';
    return `/images/subcategories/${config.folder}/${genderFolder}/${imageFile}`;
  }
  return `/images/subcategories/${config.folder}/${imageFile}`;
}

export function getSubcategories(config: CategoryConfig, gender: string | null): Subcategory[] {
  if (gender === 'female' && config.subcategoriesWomen) {
    return config.subcategoriesWomen;
  }
  return config.subcategories;
}

export const categoryConfigs: Record<string, CategoryConfig> = {
  Accessories: {
    id: 'Accessories',
    name: 'Accessories',
    folder: 'accessories',
    gendered: true,
    title: 'What\'s your style?',
    description: 'Select as many as you like',
    subcategories: [
      { id: 'casual', label: 'Casual', subtitle: 'Relaxed and everyday', image: 'casual.webp' },
      { id: 'classic', label: 'Classic', subtitle: 'Timeless and refined', image: 'classic.webp' },
      { id: 'elegant', label: 'Elegant', subtitle: 'Polished and evening-ready', image: 'elegant.webp' },
      { id: 'minimalist', label: 'Minimalist', subtitle: 'Clean and understated', image: 'minimalist.webp' },
      { id: 'sporty', label: 'Sporty', subtitle: 'Active and dynamic', image: 'sporty.webp' },
      { id: 'streetwear', label: 'Streetwear', subtitle: 'Urban and bold', image: 'streetwear.webp' },
      { id: 'vintage', label: 'Vintage', subtitle: 'Retro and nostalgic', image: 'vintage.webp' },
    ],
  },

  'Handbags and Leather Goods': {
    id: 'Handbags and Leather Goods',
    name: 'Bags',
    folder: 'bags',
    gendered: true,
    title: 'What do you carry?',
    description: 'Select as many as you like',
    subcategories: [
      { id: 'backpacks', label: 'Backpacks', subtitle: 'Hands-free', image: 'backpacks.webp' },
      { id: 'briefcases', label: 'Briefcases', subtitle: 'Sharp and professional', image: 'briefcases.webp' },
      { id: 'crossbody', label: 'Crossbody', subtitle: 'Compact and light', image: 'crossbody.webp' },
      { id: 'duffel', label: 'Duffel bags', subtitle: 'Travel and getaway', image: 'duffel.webp' },
      { id: 'messenger', label: 'Messenger bags', subtitle: 'Laid-back and easy', image: 'messenger.webp' },
      { id: 'totes', label: 'Totes', subtitle: 'Spacious and open', image: 'totes.webp' },
    ],
    subcategoriesWomen: [
      { id: 'backpacks', label: 'Backpacks', subtitle: 'Hands-free and modern' },
      { id: 'clutches', label: 'Clutches', subtitle: 'Evening-ready', image: 'clutches.webp' },
      { id: 'crossbody', label: 'Crossbody', subtitle: 'Compact and light', image: 'crossbody.webp' },
      { id: 'mini-bags', label: 'Mini bags', subtitle: 'Small and statement', image: 'mini-bags.webp' },
      { id: 'shoulder-bags', label: 'Shoulder bags', subtitle: 'Classic and easy', image: 'shoulder-bags.webp' },
      { id: 'totes', label: 'Totes', subtitle: 'Spacious and open', image: 'totes.webp' },
      { id: 'top-handle', label: 'Top handle bags', subtitle: 'Structured and polished', image: 'top-handle.webp' },
    ],
  },

  Vehicles: {
    id: 'Vehicles',
    name: 'Cars',
    folder: 'cars',
    gendered: false,
    title: 'What do you drive?',
    description: 'Select as many as you like',
    subcategories: [
      { id: 'classic-cars', label: 'Classic cars', subtitle: 'Icons from the past', image: 'classic-cars.webp' },
      { id: 'convertibles', label: 'Convertibles', subtitle: 'Open and elegant', image: 'convertibles.png' },
      { id: 'coupes', label: 'Coupes', subtitle: 'Sleek and two-door', image: 'coupes.webp' },
      { id: 'electric', label: 'Electric', subtitle: 'Quiet and clean', image: 'electric.webp' },
      { id: 'grand-tourers', label: 'Grand Tourers', subtitle: 'Long-distance luxury', image: 'grand-tourers.png' },
      { id: 'hypercars', label: 'Hypercars', subtitle: 'Rare and extreme', image: 'hypercars.webp' },
      { id: 'suvs', label: 'SUVs', subtitle: 'Spacious and bold', image: 'suvs.webp' },
      { id: 'sedans', label: 'Sedans', subtitle: 'Refined and comfortable', image: 'sedans.webp' },
      { id: 'sports-cars', label: 'Sports cars', subtitle: 'Fast and thrilling', image: 'sports-cars.webp' },
    ],
  },

  'Fashion and Apparel': {
    id: 'Fashion and Apparel',
    name: 'Clothing',
    folder: 'clothing',
    gendered: true,
    title: 'How do you dress?',
    description: 'Select as many as you like',
    subcategories: [
      { id: 'casual', label: 'Casual', subtitle: 'Relaxed and everyday', image: 'casual.webp' },
      { id: 'classic', label: 'Classic', subtitle: 'Timeless and refined', image: 'classic.webp' },
      { id: 'elegant', label: 'Elegant', subtitle: 'Polished and evening-ready', image: 'elegant.webp' },
      { id: 'minimalist', label: 'Minimalist', subtitle: 'Clean and understated', image: 'minimalist.webp' },
      { id: 'sporty', label: 'Sporty', subtitle: 'Active and dynamic', image: 'sporty.webp' },
      { id: 'streetwear', label: 'Streetwear', subtitle: 'Urban and bold', image: 'streetwear.webp' },
      { id: 'vintage', label: 'Vintage', subtitle: 'Retro and nostalgic', image: 'vintage.webp' },
    ],
  },

  'Fine Art': {
    id: 'Fine Art',
    name: 'Fine Art',
    folder: 'fineart',
    gendered: false,
    title: 'Which era do you prefer?',
    description: 'Select as many as you like',
    subcategories: [
      { id: 'renaissance', label: 'Renaissance', subtitle: '1400 - 1600', image: 'renaissance.webp' },
      { id: 'baroque', label: 'Baroque', subtitle: '1600 - 1750', image: 'baroque.webp' },
      { id: 'impressionism', label: 'Impressionism', subtitle: '1860 - 1900', image: 'impressionism.webp' },
      { id: 'post-impressionism', label: 'Post-Impressionism', subtitle: '1880 - 1910', image: 'post-impressionism.webp' },
      { id: 'surrealism', label: 'Surrealism', subtitle: '1920 - 1960', image: 'surrealism.webp' },
      { id: 'abstract-expressionism', label: 'Abstract Expressionism', subtitle: '1940 - 1965', image: 'abstract-expressionism.webp' },
      { id: 'pop-art', label: 'Pop Art', subtitle: '1955 - 1970', image: 'pop-art.png' },
      { id: 'contemporary', label: 'Contemporary', subtitle: '1960 - present', image: 'contemporary.png' },
    ],
  },

  Furniture: {
    id: 'Furniture',
    name: 'Furniture',
    folder: 'furniture',
    gendered: false,
    title: 'What\'s your design style?',
    description: 'Select as many as you like',
    subcategories: [
      { id: 'art-deco', label: 'Art Deco', subtitle: 'Bold geometry and glamour', image: 'art-deco.webp' },
      { id: 'classic', label: 'Classic', subtitle: 'Traditional and timeless', image: 'classic.webp' },
      { id: 'contemporary', label: 'Contemporary', subtitle: 'Current and refined', image: 'contemporary.webp' },
      { id: 'industrial', label: 'Industrial', subtitle: 'Raw and architectural', image: 'industrial.png' },
      { id: 'mid-century', label: 'Mid-Century Modern', subtitle: 'Retro elegance', image: 'mid-century.webp' },
      { id: 'minimalist', label: 'Minimalist', subtitle: 'Less is more', image: 'minimalist.webp' },
      { id: 'rustic', label: 'Rustic', subtitle: 'Warm and natural', image: 'rustic.webp' },
      { id: 'scandinavian', label: 'Scandinavian', subtitle: 'Light and functional', image: 'scandinavian.webp' },
    ],
  },

  Jewellery: {
    id: 'Jewellery',
    name: 'Jewelry',
    folder: 'jewelry',
    gendered: true,
    title: 'What pieces do you wear?',
    description: 'Select as many as you like',
    subcategories: [
      { id: 'rings', label: 'Rings', subtitle: 'Statement and everyday', image: 'rings.webp' },
      { id: 'necklaces', label: 'Necklaces', subtitle: 'Pendants and diamonds', image: 'necklaces.webp' },
      { id: 'bracelets', label: 'Bracelets', subtitle: 'Cuffs and bangles', image: 'bracelets.webp' },
      { id: 'chains', label: 'Chains', subtitle: 'Bold and layered', image: 'chains.webp' },
      { id: 'cufflinks', label: 'Cufflinks', subtitle: 'Formal and tailored', image: 'cufflinks.webp' },
    ],
    subcategoriesWomen: [
      { id: 'bangles', label: 'Bangles', subtitle: 'Stiff and sculptural', image: 'bangles.webp' },
      { id: 'bracelets', label: 'Bracelets', subtitle: 'Flexible and layered', image: 'bracelets.webp' },
      { id: 'brooches', label: 'Brooches', subtitle: 'Pinned and elegant', image: 'brooches.png' },
      { id: 'chains', label: 'Chains', subtitle: 'Bold and layered', image: 'chains.png' },
      { id: 'earrings', label: 'Earrings', subtitle: 'Framing the face', image: 'earrings.webp' },
      { id: 'necklaces', label: 'Necklaces', subtitle: 'Close to the heart', image: 'necklaces.webp' },
      { id: 'rings', label: 'Rings', subtitle: 'Always on display', image: 'rings.webp' },
    ],
  },

  Footwear: {
    id: 'Footwear',
    name: 'Shoes',
    folder: 'shoes',
    gendered: true,
    title: 'What do you step into?',
    description: 'Select as many as you like',
    subcategories: [
      { id: 'boots', label: 'Boots', subtitle: 'Tough and refined', image: 'boots.webp' },
      { id: 'derbies', label: 'Derbies', subtitle: 'Relaxed and sharp', image: 'derbies.png' },
      { id: 'loafers', label: 'Loafers', subtitle: 'Relaxed and smart', image: 'loafers.webp' },
      { id: 'oxfords', label: 'Oxfords', subtitle: 'Formal and polished', image: 'oxfords.webp' },
      { id: 'sandals', label: 'Sandals', subtitle: 'Light and open', image: 'sandals.webp' },
      { id: 'sneakers', label: 'Sneakers', subtitle: 'Casual and cool', image: 'sneakers.webp' },
    ],
    subcategoriesWomen: [
      { id: 'boots', label: 'Boots', subtitle: 'Tough and refined', image: 'boots.webp' },
      { id: 'flats', label: 'Flats', subtitle: 'Easy and elegant', image: 'flats.webp' },
      { id: 'heels', label: 'Heels', subtitle: 'Elevated and bold', image: 'heels.webp' },
      { id: 'mules', label: 'Mules', subtitle: 'Open-back and easy', image: 'mules.png' },
      { id: 'sandals', label: 'Sandals', subtitle: 'Light and open', image: 'sandals.webp' },
      { id: 'sneakers', label: 'Sneakers', subtitle: 'Casual and cool', image: 'sneakers.webp' },
      { id: 'wedges', label: 'Wedges', subtitle: 'Lifted and stable', image: 'wedges.png' },
    ],
  },

  Watches: {
    id: 'Watches',
    name: 'Watches',
    folder: 'watches',
    gendered: true,
    title: 'What\'s your watch style?',
    description: 'Select as many as you like',
    subcategories: [
      { id: 'chronograph', label: 'Chronograph', subtitle: 'Timing and precision', image: 'chronograph.webp' },
      { id: 'classic', label: 'Classic', subtitle: 'Elegant and timeless', image: 'classic.webp' },
      { id: 'complications', label: 'Complications', subtitle: 'Perpetual and intricate', image: 'complications.png' },
      { id: 'diver', label: 'Diver', subtitle: 'Built for the deep', image: 'diver.webp' },
      { id: 'gmt', label: 'GMT', subtitle: 'Two time zones', image: 'gmt.png' },
      { id: 'pilot', label: 'Pilot', subtitle: 'Aviation-inspired', image: 'pilot.webp' },
      { id: 'skeleton', label: 'Skeleton', subtitle: 'Open and mechanical', image: 'skeleton.webp' },
    ],
  },

  Cigars: {
    id: 'Cigars',
    name: 'Cigars',
    folder: 'cigars',
    gendered: false,
    title: 'What\'s your cigar strength?',
    description: 'Pick the strength you prefer',
    subcategories: [
      { id: 'mild', label: 'Mild', subtitle: 'Soft and approachable', icon: 'spa' },
      { id: 'medium', label: 'Medium', subtitle: 'Balanced and smooth', icon: 'whatshot' },
      { id: 'medium-full', label: 'Medium-full', subtitle: 'Warm and layered', icon: 'local_fire_department' },
      { id: 'full', label: 'Full-bodied', subtitle: 'Rich and intense', icon: 'bolt' },
      { id: 'extra-full', label: 'Extra full', subtitle: 'Bold and powerful', icon: 'flash_on' },
    ],
  },

  Collectibles: {
    id: 'Collectibles',
    name: 'Collectibles',
    folder: 'collectibles',
    gendered: false,
    title: 'What do you collect?',
    description: 'Select as many as you like',
    subcategories: [
      { id: 'sneakers', label: 'Sneakers', subtitle: 'Grails and rarities', image: 'sneakers.png' },
      { id: 'trading-cards', label: 'Trading cards', subtitle: 'Cards and collections', image: 'trading-cards.png' },
      { id: 'coins', label: 'Coins', subtitle: 'Numismatic and bullion', image: 'coins.png' },
      { id: 'stamps', label: 'Stamps', subtitle: 'Rare and historic', image: 'stamps.png' },
      { id: 'memorabilia', label: 'Memorabilia', subtitle: 'Signed and storied', image: 'memorabilia.png' },
      { id: 'toys-figures', label: 'Toys & figures', subtitle: 'Designer and vintage', image: 'toys-figures.png' },
      { id: 'comics', label: 'Comics', subtitle: 'First editions and rarities', image: 'comics.png' },
      { id: 'vinyl', label: 'Vinyl records', subtitle: 'Rare pressings and first issues', image: 'vinyl.png' },
    ],
  },

  'Wine & Spirits': {
    id: 'Wine & Spirits',
    name: 'Wine & Spirits',
    folder: 'wine-spirits',
    gendered: false,
    title: 'What do you pour?',
    description: 'Select as many as you like',
    subcategories: [
      { id: 'red-wine', label: 'Red wine', subtitle: 'Bold and refined', image: 'red-wine.png' },
      { id: 'white-wine', label: 'White wine', subtitle: 'Crisp and mineral', image: 'white-wine.png' },
      { id: 'champagne', label: 'Champagne', subtitle: 'Sparkling and storied', image: 'champagne.png' },
      { id: 'whisky', label: 'Whisky', subtitle: 'Aged and complex', image: 'whisky.png' },
      { id: 'cognac', label: 'Cognac & brandy', subtitle: 'Silky and warm', image: 'cognac.png' },
      { id: 'tequila', label: 'Tequila', subtitle: 'Agave and aged', image: 'tequila.png' },
      { id: 'rum', label: 'Rum', subtitle: 'Caribbean and warm', image: 'rum.png' },
    ],
  },

  'Yachts & Boats': {
    id: 'Yachts & Boats',
    name: 'Yachts & Boats',
    folder: 'yachts',
    gendered: false,
    title: 'What do you sail?',
    description: 'Select as many as you like',
    subcategories: [
      { id: 'motor-yachts', label: 'Motor yachts', subtitle: 'Power and range', image: 'motor-yachts.png' },
      { id: 'sailing-yachts', label: 'Sailing yachts', subtitle: 'Wind and grace', image: 'sailing-yachts.png' },
      { id: 'superyachts', label: 'Superyachts', subtitle: '30m and beyond', image: 'superyachts.png' },
      { id: 'catamarans', label: 'Catamarans', subtitle: 'Stable and spacious', image: 'catamarans.png' },
      { id: 'tenders', label: 'Tenders & day boats', subtitle: 'Compact and quick', image: 'tenders.png' },
      { id: 'classic-boats', label: 'Classic boats', subtitle: 'Heritage and restored', image: 'classic-boats.png' },
      { id: 'sportfishing', label: 'Sportfishing', subtitle: 'Built for deep water', image: 'sportfishing.png' },
      { id: 'explorer', label: 'Explorer yachts', subtitle: 'Range and capability', image: 'explorer.png' },
    ],
  },
};
