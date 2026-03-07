import { categoryConfigs } from '../data/categoryConfig';

export interface CategoryAnswerSet {
  budget: string | [number, number] | null;
  q1: string | string[] | null;
  q2: string | string[] | null;
}

export interface TasteProfile {
  vibeLabel: string;
  description: string;
  highlights: string[];
}

export function computeProfile(
  categoryAnswers: Record<string, CategoryAnswerSet>,
  _likedProducts: string[],
  selectedInterests: string[],
): TasteProfile {
  let highTierCount = 0;
  let totalAnswered = 0;
  let hasCollection = false;
  let hasInvestment = false;
  let hasBeginner = false;

  Object.entries(categoryAnswers).forEach(([catId, answers]) => {
    if (!answers.budget) return;
    totalAnswered++;
    const config = categoryConfigs[catId];
    if (!config) return;
    // budget can be [minIdx, maxIdx] range or legacy string id
    let topTierIdx: number;
    if (Array.isArray(answers.budget)) {
      topTierIdx = answers.budget[1];
    } else {
      topTierIdx = config.budgetTiers.findIndex((t) => t.id === answers.budget);
    }
    if (topTierIdx >= config.budgetTiers.length - 2) highTierCount++;

    const allResponses = [answers.q1, answers.q2].flat().filter(Boolean) as string[];
    if (allResponses.includes('collection') || allResponses.includes('investment'))
      hasCollection = true;
    if (allResponses.includes('investment')) hasInvestment = true;
    if (allResponses.includes('beginner') || allResponses.includes('first'))
      hasBeginner = true;
  });

  const highRatio = totalAnswered > 0 ? highTierCount / totalAnswered : 0;

  let vibeLabel: string;
  let description: string;

  if (highRatio >= 0.7 && hasCollection) {
    vibeLabel = 'The Serious Collector';
    description = "High-end taste with a collector's eye. You know what you want.";
  } else if (highRatio >= 0.5) {
    vibeLabel = 'The Connoisseur';
    description = 'Refined taste across categories. Quality over quantity.';
  } else if (hasBeginner && selectedInterests.length >= 3) {
    vibeLabel = 'The Curious Explorer';
    description = "Wide interests, ready to discover. We'll surface the best entry points.";
  } else if (selectedInterests.length >= 4) {
    vibeLabel = 'The Refined Explorer';
    description = 'Broad luxury appetite with taste to match. Discovery is your thing.';
  } else if (hasInvestment) {
    vibeLabel = 'The Strategic Buyer';
    description = "You see luxury as an investment. We'll focus on value and rarity.";
  } else {
    vibeLabel = 'The Discerning Eye';
    description = "You know quality when you see it. Let's find your next piece.";
  }

  const highlights: string[] = [];
  Object.entries(categoryAnswers).forEach(([catId, answers]) => {
    const config = categoryConfigs[catId];
    if (!config) return;
    if (Array.isArray(answers.budget)) {
      const minTier = config.budgetTiers[answers.budget[0]];
      const maxTier = config.budgetTiers[answers.budget[1]];
      if (minTier && maxTier) {
        highlights.push(answers.budget[0] === answers.budget[1]
          ? `${config.name}: ${minTier.label}`
          : `${config.name}: ${minTier.label} to ${maxTier.label}`);
      }
    } else {
      const tier = config.budgetTiers.find((t) => t.id === answers.budget);
      if (tier) highlights.push(`${config.name}: ${tier.label}`);
    }
  });

  return { vibeLabel, description, highlights: highlights.slice(0, 4) };
}
