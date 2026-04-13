export interface Subcategory {
  id: string;
  label: string;
  subtitle?: string;
  image: string; // filename only, e.g. 'casual.webp'
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
      { id: 'coupes', label: 'Coupes', subtitle: 'Sleek and two-door', image: 'coupes.webp' },
      { id: 'electric', label: 'Electric', subtitle: 'Quiet and clean', image: 'electric.webp' },
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
      { id: 'renaissance', label: 'Renaissance', subtitle: '1400 – 1600', image: 'renaissance.webp' },
      { id: 'baroque', label: 'Baroque', subtitle: '1600 – 1750', image: 'baroque.webp' },
      { id: 'impressionism', label: 'Impressionism', subtitle: '1860 – 1900', image: 'impressionism.webp' },
      { id: 'post-impressionism', label: 'Post-Impressionism', subtitle: '1880 – 1910', image: 'post-impressionism.webp' },
      { id: 'surrealism', label: 'Surrealism', subtitle: '1920 – 1960', image: 'surrealism.webp' },
      { id: 'abstract-expressionism', label: 'Abstract Expressionism', subtitle: '1940 – 1965', image: 'abstract-expressionism.webp' },
      { id: 'contemporary', label: 'Contemporary', subtitle: '1960 – present', image: 'contemporary.webp' },
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
      { id: 'earrings', label: 'Earrings', subtitle: 'Studs and drops', image: 'earrings.webp' },
      { id: 'chains', label: 'Chains', subtitle: 'Bold and layered', image: 'chains.webp' },
    ],
    subcategoriesWomen: [
      { id: 'bangles', label: 'Bangles', subtitle: 'Stiff and sculptural', image: 'bangles.webp' },
      { id: 'bracelets', label: 'Bracelets', subtitle: 'Flexible and layered', image: 'bracelets.webp' },
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
      { id: 'loafers', label: 'Loafers', subtitle: 'Relaxed and smart', image: 'loafers.webp' },
      { id: 'oxfords', label: 'Oxfords', subtitle: 'Formal and polished', image: 'oxfords.webp' },
      { id: 'sandals', label: 'Sandals', subtitle: 'Light and open', image: 'sandals.webp' },
      { id: 'sneakers', label: 'Sneakers', subtitle: 'Casual and cool', image: 'sneakers.webp' },
    ],
    subcategoriesWomen: [
      { id: 'boots', label: 'Boots', subtitle: 'Tough and refined', image: 'boots.webp' },
      { id: 'flats', label: 'Flats', subtitle: 'Easy and elegant', image: 'flats.webp' },
      { id: 'heels', label: 'Heels', subtitle: 'Elevated and bold', image: 'heels.webp' },
      { id: 'sandals', label: 'Sandals', subtitle: 'Light and open', image: 'sandals.webp' },
      { id: 'sneakers', label: 'Sneakers', subtitle: 'Casual and cool', image: 'sneakers.webp' },
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
      { id: 'diver', label: 'Diver', subtitle: 'Built for the deep', image: 'diver.webp' },
      { id: 'pilot', label: 'Pilot', subtitle: 'Aviation-inspired', image: 'pilot.webp' },
      { id: 'skeleton', label: 'Skeleton', subtitle: 'Open and mechanical', image: 'skeleton.webp' },
    ],
  },
};
