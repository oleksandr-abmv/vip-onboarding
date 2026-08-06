// ─── People behind the house ─────────────────────────────────────────────────
//
// The second block of the product page's Details sheet: who made the thing a
// thing. A piece at this price is bought partly for the name on it, and the name
// is usually a person.
//
// **Only people who are a matter of public record.** These are real companies,
// so inventing "Claire Fontaine, head of the atelier" would be fabricating a
// person and attaching them to a real business. Houses that are not in the map
// get `HOUSE_FALLBACK`, which talks about the house and names nobody.
//
// Keyed by the brand string on the product, lowercased.

export interface Person {
  name: string;
  /**
   * A real, licensed photograph, when there is one. **Never a generated
   * likeness**: these are named individuals and several are living, so a
   * synthesised portrait would be a fabricated picture of a real person passed
   * off as them. With no file here the card draws their initials instead.
   */
  image?: string;
  /** "Founder, 1837" - what they were and when. */
  role: string;
  /** Two or three sentences. Why this person and this piece are connected. */
  story: string;
}

const PEOPLE: Record<string, Person[]> = {
  hermes: [
    {
      name: 'Thierry Hermes',
      role: 'Founder, 1837',
      story:
        'Opened a harness workshop in Paris making tack for carriage horses. The saddle stitch his workshop used is still the one the house builds its leather goods on, which is why so much of the range reads like riding equipment that grew up.',
    },
  ],
  chanel: [
    {
      name: 'Gabrielle Chanel',
      role: 'Founder, 1910',
      story:
        'Began with hats on the rue Cambon and spent a career taking structure out of womenswear: jersey instead of corsetry, pockets where there had been none. The quilted flap bag and the tweed suit are both hers, and both were arguments about how a woman should be able to move.',
    },
  ],
  cartier: [
    {
      name: 'Louis-Francois Cartier',
      role: 'Founder, 1847',
      story:
        'Took over his master jeweller workshop in Paris at twenty-eight. His grandson Louis later made the house a watchmaker as well, designing the Santos for a pilot who wanted to read the time without letting go of the controls.',
    },
  ],
  rolex: [
    {
      name: 'Hans Wilsdorf',
      role: 'Founder, 1905',
      story:
        'Founded the company in London to put reliable movements into wristwatches at a time when serious watches were pocket watches. He pushed the waterproof case and the self-winding rotor, and had both proven in public rather than in a catalogue.',
    },
  ],
  gucci: [
    {
      name: 'Guccio Gucci',
      role: 'Founder, 1921',
      story:
        'Worked as a porter at the Savoy in London and opened a leather goods shop in Florence on the strength of what he learned about how well-off people travel. The luggage came first; everything else followed the luggage.',
    },
  ],
  prada: [
    {
      name: 'Mario Prada',
      role: 'Founder, 1913',
      story:
        'Opened a leather goods shop in the Galleria Vittorio Emanuele II in Milan. His granddaughter Miuccia took the house over in 1978 and made an industrial nylon the material it is now best known for.',
    },
  ],
  dior: [
    {
      name: 'Christian Dior',
      role: 'Founder, 1946',
      story:
        'Showed his first collection in 1947, and its cinched waists and long full skirts were immediately called the New Look. It was a deliberate answer to wartime rationing of cloth, and it made Paris the centre of fashion again.',
    },
  ],
  'saint laurent': [
    {
      name: 'Yves Saint Laurent',
      role: 'Founder, 1961',
      story:
        'Ran Dior at twenty-one, then left to open his own house. He put women in the tuxedo, the safari jacket and the trouser suit, and was the first couturier to take ready-to-wear seriously rather than treat it as a lesser line.',
    },
  ],
  'louis vuitton': [
    {
      name: 'Louis Vuitton',
      role: 'Founder, 1854',
      story:
        'Trained as a layetier, packing clothes for wealthy travellers, then built trunks with flat tops that could be stacked in a railway carriage rather than the domed ones that could not. The monogram canvas was drawn by his son in 1896 to stop counterfeiters.',
    },
  ],
  tiffany: [
    {
      name: 'Charles Lewis Tiffany',
      role: 'Founder, 1837',
      story:
        'Started as a stationery and fancy goods shop in New York and moved into jewellery when it became clear that was what people came back for. He adopted the 925 sterling standard in the United States before it was law.',
    },
  ],
  'ralph lauren': [
    {
      name: 'Ralph Lauren',
      role: 'Founder, 1967',
      story:
        'Began by selling wide ties out of a drawer in the Empire State Building. What he built afterwards was less a clothing line than a picture of a life, which is why the house sells furniture and paint as readily as it sells shirts.',
    },
  ],
  'tom ford': [
    {
      name: 'Tom Ford',
      role: 'Founder, 2005',
      story:
        'Spent a decade at Gucci turning a struggling house into the loudest name of the nineties, then started his own. His tailoring keeps the same argument: a suit should be cut close and read as deliberate from across a room.',
    },
  ],
  'brunello cucinelli': [
    {
      name: 'Brunello Cucinelli',
      role: 'Founder, 1978',
      story:
        'Started by dyeing cashmere in colours nobody was using for it, from a village in Umbria he later restored with the profits. The company still works there, and pays for the theatre and the library.',
    },
  ],
  'fritz hansen': [
    {
      name: 'Arne Jacobsen',
      role: 'Architect and designer',
      story:
        'Designed the Ant, the Series 7 and the Egg for the house between 1952 and 1958, most of them for buildings he was also designing. The chairs outlived the buildings and became what the name is known for.',
    },
  ],
  'herman miller': [
    {
      name: 'Charles and Ray Eames',
      role: 'Designers, from 1946',
      story:
        'A husband and wife working in Los Angeles who spent the war years learning to bend plywood for leg splints. They turned the same technique on furniture, and the lounge chair they drew in 1956 has not been out of production since.',
    },
  ],
};

/** For a house with no individual on public record in this file. */
const HOUSE_FALLBACK = (brand: string): Person[] => [
  {
    name: `The house of ${brand}`,
    role: 'The makers',
    story: `Every piece the concierge sources from ${brand} is checked against the house's own records before it reaches you, and the people who made it are the reason it is worth checking. We are still writing this entry properly.`,
  },
];

/** Who is behind this piece. Never empty, never invented. */
export function peopleFor(brand: string): Person[] {
  const key = brand.trim().toLowerCase();
  return PEOPLE[key] ?? HOUSE_FALLBACK(brand);
}
