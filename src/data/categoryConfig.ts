export interface CategoryQuestion {
  id: string;
  label: string;
  multiSelect: boolean;
  options: { id: string; label: string; icon?: string }[];
}

export interface BudgetTier {
  id: string;
  price: string;
  label: string;
}

export interface CategoryConfig {
  id: string;
  icon: string;
  name: string;
  budgetTiers: BudgetTier[];
  questions: CategoryQuestion[];
}

export const categoryConfigs: Record<string, CategoryConfig> = {
  Watches: {
    id: 'Watches',
    icon: 'watch',
    name: 'Watches',
    budgetTiers: [
      { id: 'under1k', price: 'Under $1K', label: 'Starting out' },
      { id: '1k-5k', price: '$1K \u2013 $5K', label: 'Enthusiast' },
      { id: '5k-15k', price: '$5K \u2013 $15K', label: 'Connoisseur' },
      { id: '15k-50k', price: '$15K \u2013 $50K', label: 'Collector' },
      { id: '50k+', price: '$50K+', label: 'Haute horlogerie' },
    ],
    questions: [
      {
        id: 'condition',
        label: 'Condition preference',
        multiSelect: false,
        options: [
          { id: 'new', label: 'New only', icon: 'new_releases' },
          { id: 'preowned', label: 'Open to pre-owned', icon: 'autorenew' },
          { id: 'vintage', label: 'Prefer vintage', icon: 'history' },
        ],
      },
      {
        id: 'purpose',
        label: "What's it for?",
        multiSelect: true,
        options: [
          { id: 'daily', label: 'Daily wear', icon: 'routine' },
          { id: 'special', label: 'Special occasions', icon: 'celebration' },
          { id: 'collection', label: 'Collection', icon: 'collections_bookmark' },
          { id: 'investment', label: 'Investment', icon: 'trending_up' },
        ],
      },
    ],
  },

  Jewelry: {
    id: 'Jewelry',
    icon: 'diamond',
    name: 'Jewelry',
    budgetTiers: [
      { id: 'under500', price: 'Under $500', label: 'Everyday pieces' },
      { id: '500-2k', price: '$500 \u2013 $2K', label: 'Refined taste' },
      { id: '2k-10k', price: '$2K \u2013 $10K', label: 'Statement' },
      { id: '10k-50k', price: '$10K \u2013 $50K', label: 'Connoisseur' },
      { id: '50k+', price: '$50K+', label: 'Haute joaillerie' },
    ],
    questions: [
      {
        id: 'recipient',
        label: "Who's it for?",
        multiSelect: false,
        options: [
          { id: 'myself', label: 'Myself', icon: 'person' },
          { id: 'partner', label: 'My partner', icon: 'favorite' },
          { id: 'gift', label: 'A gift', icon: 'redeem' },
        ],
      },
      {
        id: 'type',
        label: 'Focus',
        multiSelect: true,
        options: [
          { id: 'rings', label: 'Rings', icon: 'token' },
          { id: 'necklaces', label: 'Necklaces', icon: 'ink_pen' },
          { id: 'bracelets', label: 'Bracelets', icon: 'styler' },
          { id: 'earrings', label: 'Earrings', icon: 'earbuds' },
          { id: 'all', label: 'Open to all', icon: 'diamond' },
        ],
      },
    ],
  },

  'Fine Wine': {
    id: 'Fine Wine',
    icon: 'wine_bar',
    name: 'Fine Wine',
    budgetTiers: [
      { id: 'under50', price: 'Under $50/bottle', label: 'Exploring' },
      { id: '50-200', price: '$50 \u2013 $200', label: 'Enthusiast' },
      { id: '200-500', price: '$200 \u2013 $500', label: 'Collector' },
      { id: '500+', price: '$500+', label: 'Rare & allocated' },
    ],
    questions: [
      {
        id: 'experience',
        label: 'Experience level',
        multiSelect: false,
        options: [
          { id: 'beginner', label: 'Curious beginner', icon: 'explore' },
          { id: 'enthusiast', label: 'Enthusiast', icon: 'local_bar' },
          { id: 'collector', label: 'Seasoned collector', icon: 'workspace_premium' },
        ],
      },
      {
        id: 'buying',
        label: 'Buying style',
        multiSelect: false,
        options: [
          { id: 'bottles', label: 'Single bottles', icon: 'liquor' },
          { id: 'cases', label: 'Cases (6-12)', icon: 'inventory_2' },
          { id: 'cellar', label: 'Cellar investment', icon: 'savings' },
        ],
      },
    ],
  },

  Handbags: {
    id: 'Handbags',
    icon: 'shopping_bag',
    name: 'Handbags',
    budgetTiers: [
      { id: 'under1k', price: 'Under $1K', label: 'Entry luxury' },
      { id: '1k-3k', price: '$1K \u2013 $3K', label: 'Refined' },
      { id: '3k-10k', price: '$3K \u2013 $10K', label: 'Statement' },
      { id: '10k+', price: '$10K+', label: 'Collector / rare' },
    ],
    questions: [
      {
        id: 'condition',
        label: 'Condition',
        multiSelect: false,
        options: [
          { id: 'new', label: 'New only', icon: 'new_releases' },
          { id: 'preloved', label: 'Open to pre-loved', icon: 'autorenew' },
          { id: 'vintage', label: 'Vintage collector', icon: 'history' },
        ],
      },
      {
        id: 'purpose',
        label: 'Purpose',
        multiSelect: true,
        options: [
          { id: 'everyday', label: 'Everyday carry', icon: 'routine' },
          { id: 'special', label: 'Special occasions', icon: 'celebration' },
          { id: 'investment', label: 'Collection / investment', icon: 'trending_up' },
        ],
      },
    ],
  },

  Vehicles: {
    id: 'Vehicles',
    icon: 'directions_car',
    name: 'Vehicles',
    budgetTiers: [
      { id: 'under50k', price: 'Under $50K', label: 'Accessible performance' },
      { id: '50k-150k', price: '$50K \u2013 $150K', label: 'Luxury' },
      { id: '150k-500k', price: '$150K \u2013 $500K', label: 'Supercar' },
      { id: '500k+', price: '$500K+', label: 'Hypercar / rare' },
    ],
    questions: [
      {
        id: 'type',
        label: 'Type',
        multiSelect: false,
        options: [
          { id: 'sports', label: 'Sports / performance', icon: 'speed' },
          { id: 'sedan', label: 'Luxury sedan', icon: 'directions_car' },
          { id: 'suv', label: 'SUV / GT', icon: 'garage' },
          { id: 'classic', label: 'Classic / vintage', icon: 'history' },
        ],
      },
      {
        id: 'condition',
        label: 'Condition',
        multiSelect: false,
        options: [
          { id: 'new', label: 'Factory new', icon: 'new_releases' },
          { id: 'cpo', label: 'Certified pre-owned', icon: 'verified' },
          { id: 'classic', label: 'Classic / vintage', icon: 'history' },
        ],
      },
    ],
  },

  'Fine Art': {
    id: 'Fine Art',
    icon: 'palette',
    name: 'Fine Art',
    budgetTiers: [
      { id: 'under5k', price: 'Under $5K', label: 'Emerging artists' },
      { id: '5k-25k', price: '$5K \u2013 $25K', label: 'Established' },
      { id: '25k-100k', price: '$25K \u2013 $100K', label: 'Gallery level' },
      { id: '100k+', price: '$100K+', label: 'Museum quality' },
    ],
    questions: [
      {
        id: 'experience',
        label: 'Experience',
        multiSelect: false,
        options: [
          { id: 'first', label: 'First-time buyer', icon: 'explore' },
          { id: 'growing', label: 'Growing collection', icon: 'trending_up' },
          { id: 'established', label: 'Established collector', icon: 'workspace_premium' },
        ],
      },
      {
        id: 'medium',
        label: 'Preferred medium',
        multiSelect: true,
        options: [
          { id: 'contemporary', label: 'Contemporary', icon: 'brush' },
          { id: 'modern', label: 'Modern', icon: 'palette' },
          { id: 'classical', label: 'Classical', icon: 'museum' },
          { id: 'photography', label: 'Photography', icon: 'photo_camera' },
          { id: 'sculpture', label: 'Sculpture', icon: 'view_in_ar' },
        ],
      },
    ],
  },

  Yachts: {
    id: 'Yachts',
    icon: 'sailing',
    name: 'Yachts',
    budgetTiers: [
      { id: 'under500k', price: 'Under $500K', label: 'Day cruisers' },
      { id: '500k-2m', price: '$500K \u2013 $2M', label: 'Weekend yacht' },
      { id: '2m-10m', price: '$2M \u2013 $10M', label: 'Explorer' },
      { id: '10m+', price: '$10M+', label: 'Superyacht' },
    ],
    questions: [
      {
        id: 'interest',
        label: 'Interest type',
        multiSelect: false,
        options: [
          { id: 'charter', label: 'Charter / rental', icon: 'event_available' },
          { id: 'first', label: 'First-time ownership', icon: 'key' },
          { id: 'upgrade', label: 'Upgrading', icon: 'upgrade' },
        ],
      },
      {
        id: 'use',
        label: 'Primary use',
        multiSelect: false,
        options: [
          { id: 'weekend', label: 'Weekend cruising', icon: 'wb_sunny' },
          { id: 'voyages', label: 'Extended voyages', icon: 'explore' },
          { id: 'entertainment', label: 'Entertainment', icon: 'celebration' },
        ],
      },
    ],
  },

  Sunglasses: {
    id: 'Sunglasses',
    icon: 'sunny',
    name: 'Sunglasses',
    budgetTiers: [
      { id: 'under300', price: 'Under $300', label: 'Designer' },
      { id: '300-700', price: '$300 \u2013 $700', label: 'Premium' },
      { id: '700-1.5k', price: '$700 \u2013 $1.5K', label: 'Luxury' },
      { id: '1.5k+', price: '$1.5K+', label: 'Haute couture' },
    ],
    questions: [
      {
        id: 'style',
        label: 'Style',
        multiSelect: false,
        options: [
          { id: 'classic', label: 'Classic / timeless', icon: 'auto_awesome' },
          { id: 'sporty', label: 'Sporty', icon: 'sports_tennis' },
          { id: 'fashion', label: 'Fashion-forward', icon: 'style' },
          { id: 'vintage', label: 'Vintage-inspired', icon: 'history' },
        ],
      },
      {
        id: 'use',
        label: 'Primary use',
        multiSelect: false,
        options: [
          { id: 'everyday', label: 'Everyday', icon: 'routine' },
          { id: 'driving', label: 'Driving', icon: 'directions_car' },
          { id: 'outdoor', label: 'Beach / outdoor', icon: 'beach_access' },
          { id: 'statement', label: 'Statement piece', icon: 'star' },
        ],
      },
    ],
  },

  Fashion: {
    id: 'Fashion',
    icon: 'checkroom',
    name: 'Fashion',
    budgetTiers: [
      { id: 'under1k', price: 'Under $1K', label: 'Designer RTW' },
      { id: '1k-5k', price: '$1K \u2013 $5K', label: 'Premium' },
      { id: '5k-15k', price: '$5K \u2013 $15K', label: 'Luxury' },
      { id: '15k+', price: '$15K+', label: 'Haute couture / bespoke' },
    ],
    questions: [
      {
        id: 'focus',
        label: 'Focus',
        multiSelect: false,
        options: [
          { id: 'rtw', label: 'Ready-to-wear', icon: 'checkroom' },
          { id: 'bespoke', label: 'Bespoke / MTM', icon: 'design_services' },
          { id: 'accessories', label: 'Accessories', icon: 'diamond' },
          { id: 'all', label: 'All of it', icon: 'select_all' },
        ],
      },
      {
        id: 'aesthetic',
        label: 'Aesthetic',
        multiSelect: false,
        options: [
          { id: 'classic', label: 'Classic / tailored', icon: 'straighten' },
          { id: 'street', label: 'Streetwear luxury', icon: 'skateboarding' },
          { id: 'avant', label: 'Avant-garde', icon: 'architecture' },
          { id: 'minimal', label: 'Minimalist', icon: 'square' },
        ],
      },
    ],
  },

  Cigars: {
    id: 'Cigars',
    icon: 'smoking_rooms',
    name: 'Cigars',
    budgetTiers: [
      { id: 'under20', price: 'Under $20/cigar', label: 'Daily smokes' },
      { id: '20-50', price: '$20 \u2013 $50', label: 'Premium' },
      { id: '50-100', price: '$50 \u2013 $100', label: 'Rare / aged' },
      { id: '100+', price: '$100+', label: 'Ultra-premium' },
    ],
    questions: [
      {
        id: 'experience',
        label: 'Experience',
        multiSelect: false,
        options: [
          { id: 'beginner', label: 'Curious beginner', icon: 'explore' },
          { id: 'regular', label: 'Regular smoker', icon: 'smoking_rooms' },
          { id: 'aficionado', label: 'Aficionado', icon: 'workspace_premium' },
        ],
      },
      {
        id: 'preference',
        label: 'Strength preference',
        multiSelect: false,
        options: [
          { id: 'mild', label: 'Mild & smooth', icon: 'spa' },
          { id: 'medium', label: 'Medium body', icon: 'tune' },
          { id: 'full', label: 'Full & complex', icon: 'local_fire_department' },
          { id: 'nopref', label: 'No preference', icon: 'all_inclusive' },
        ],
      },
    ],
  },

  'Private Aviation': {
    id: 'Private Aviation',
    icon: 'flight',
    name: 'Aviation',
    budgetTiers: [
      { id: 'charter', price: 'Charter / membership', label: 'Pay per flight' },
      { id: 'fractional', price: 'Fractional ownership', label: 'Shared asset' },
      { id: 'turboprop', price: 'Full ownership \u2014 turboprop', label: 'Entry ownership' },
      { id: 'jet', price: 'Full ownership \u2014 jet', label: 'Private jet' },
    ],
    questions: [
      {
        id: 'current',
        label: 'Current solution',
        multiSelect: false,
        options: [
          { id: 'commercial', label: 'Commercial first / business', icon: 'airline_seat_flat' },
          { id: 'charter', label: 'Charter occasionally', icon: 'flight' },
          { id: 'own', label: 'Own / share aircraft', icon: 'key' },
        ],
      },
      {
        id: 'use',
        label: 'Primary use',
        multiSelect: false,
        options: [
          { id: 'business', label: 'Business travel', icon: 'business_center' },
          { id: 'personal', label: 'Personal / leisure', icon: 'beach_access' },
          { id: 'both', label: 'Both', icon: 'all_inclusive' },
        ],
      },
    ],
  },

  Collectibles: {
    id: 'Collectibles',
    icon: 'emoji_events',
    name: 'Collectibles',
    budgetTiers: [
      { id: 'under1k', price: 'Under $1K', label: 'Hobbyist' },
      { id: '1k-10k', price: '$1K \u2013 $10K', label: 'Enthusiast' },
      { id: '10k-50k', price: '$10K \u2013 $50K', label: 'Serious collector' },
      { id: '50k+', price: '$50K+', label: 'Institutional grade' },
    ],
    questions: [
      {
        id: 'category',
        label: 'Category',
        multiSelect: true,
        options: [
          { id: 'coins', label: 'Coins / currency', icon: 'paid' },
          { id: 'sports', label: 'Sports memorabilia', icon: 'sports_baseball' },
          { id: 'rare', label: 'Rare objects', icon: 'diamond' },
          { id: 'art-toys', label: 'Art toys / limited ed.', icon: 'toys' },
        ],
      },
      {
        id: 'goal',
        label: 'Goal',
        multiSelect: false,
        options: [
          { id: 'personal', label: 'Personal enjoyment', icon: 'favorite' },
          { id: 'investment', label: 'Long-term investment', icon: 'savings' },
          { id: 'both', label: 'Both', icon: 'all_inclusive' },
        ],
      },
    ],
  },
};

// Generic fallback for when no interests selected
export const genericBudgetTiers: BudgetTier[] = [
  { id: 'under1k', price: 'Under $1K', label: 'Exploring' },
  { id: '1k-5k', price: '$1K \u2013 $5K', label: 'Enthusiast' },
  { id: '5k-25k', price: '$5K \u2013 $25K', label: 'Connoisseur' },
  { id: '25k-100k', price: '$25K \u2013 $100K', label: 'Collector' },
  { id: '100k+', price: '$100K+', label: 'Ultra-premium' },
];
