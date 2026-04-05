export const CUISINE_COLORS = {
  indian: '#e07b39',
  mexican: '#c94c4c',
  japanese: '#4e8d7c',
  mediterranean: '#7ba05b',
  ethiopian: '#c6783e',
  thai: '#d4a017',
  korean: '#8b5e83',
  west_african: '#b87333',
  peruvian: '#5b7ea0',
  middle_eastern: '#a0785b',
}

export const CUISINE_NAMES = {
  indian: 'Indian',
  mexican: 'Mexican',
  japanese: 'Japanese',
  mediterranean: 'Mediterranean',
  ethiopian: 'Ethiopian',
  thai: 'Thai',
  korean: 'Korean',
  west_african: 'West African',
  peruvian: 'Peruvian',
  middle_eastern: 'Middle Eastern',
}

// Geographic coordinates for globe (lat, lng)
export const CUISINE_GEO = {
  indian: { lat: 20.5937, lng: 78.9629, label: 'India' },
  mexican: { lat: 23.6345, lng: -102.5528, label: 'Mexico' },
  japanese: { lat: 36.2048, lng: 138.2529, label: 'Japan' },
  mediterranean: { lat: 38.0, lng: 23.7, label: 'Greece' },
  ethiopian: { lat: 9.145, lng: 40.4897, label: 'Ethiopia' },
  thai: { lat: 15.87, lng: 100.9925, label: 'Thailand' },
  korean: { lat: 35.9078, lng: 127.7669, label: 'Korea' },
  west_african: { lat: 9.082, lng: 8.6753, label: 'Nigeria' },
  peruvian: { lat: -9.19, lng: -75.0152, label: 'Peru' },
  middle_eastern: { lat: 33.8886, lng: 35.4955, label: 'Lebanon' },
}

export const CATEGORY_LABELS = {
  protein: 'Protein',
  legume: 'Legume',
  vegetable: 'Vegetable',
  soup: 'Soup',
  fermented: 'Fermented',
  dairy: 'Dairy',
  fruit: 'Fruit',
  cereal_low: 'Whole Grain',
  cereal_high: 'Refined Grain',
  dessert: 'Dessert',
  mixed: 'Mixed',
  fried: 'Fried',
  salad: 'Salad',
  snack: 'Snack',
}

/**
 * TRADITIONAL vs MODERN categorization rationale:
 *
 * "Traditional" = food preparation methods and ingredients that predate
 * industrial food processing (roughly pre-1950s for most cultures).
 * These categories align with how foods were prepared using locally
 * available, minimally processed ingredients:
 *   - legume: Pulses and beans — staple protein source across all 10 cuisines
 *     for millennia (dal, frijoles, natto, foul medames)
 *   - vegetable: Fresh and cooked vegetables — universal traditional base
 *   - protein: Fish, poultry, meat — traditional animal protein preparations
 *   - fermented: Kimchi, miso, injera, yogurt — ancient preservation methods
 *   - soup: Broths and stews — foundational cooking method in all cultures
 *   - dairy: Yogurt, cheese, buttermilk — traditional in pastoral cultures
 *   - cereal_low: Whole/ancient grains — teff, millet, quinoa, brown rice,
 *     barley — the grains that sustained populations pre-industrialization
 *   - salad: Raw preparations — traditional across Mediterranean, Middle
 *     Eastern, and Southeast Asian cuisines
 *
 * "Modern" = categories dominated by industrial processing, refined
 * ingredients, or preparation methods that became widespread only after
 * industrialization of the food supply:
 *   - cereal_high: Refined white flour, white rice, instant noodles —
 *     products of industrial milling that strip fiber and nutrients
 *   - dessert: Sugar-dense preparations — while sweets existed historically,
 *     refined sugar availability post-1800s transformed these dramatically
 *   - fried: Deep-fried foods — while frying existed, cheap vegetable oils
 *     and commercial fryers made this a dominant modern preparation
 *   - snack: Packaged/processed convenience foods — a 20th century category
 *
 * LIMITATIONS of this classification:
 *   - Some overlap exists (e.g., tempura in Japanese cuisine is traditional
 *     but categorized as fried; jaggery-based sweets are ancient)
 *   - The binary is necessarily reductive; a spectrum from "ancestral" to
 *     "ultra-processed" (cf. NOVA classification) would be more nuanced
 *   - Regional variation within cuisines is not captured
 *   - The classification is based on dominant preparation method, not
 *     individual recipe history
 *
 * REFERENCES:
 *   - Monteiro et al. (2019) NOVA classification, Public Health Nutr.
 *   - Popkin (2006) "Global nutrition transition", Nutr. Rev.
 *   - Kearney (2010) "Food consumption trends", Phil. Trans. R. Soc.
 */
export const TRADITIONAL_CATEGORIES = [
  'legume', 'vegetable', 'protein', 'fermented', 'soup', 'dairy', 'cereal_low', 'salad'
]

export const MODERN_CATEGORIES = [
  'cereal_high', 'dessert', 'fried', 'snack'
]

/**
 * Category epoch mapping for more granular analysis.
 * Aligns with the NOVA ultra-processed food classification where applicable.
 */
export const CATEGORY_EPOCH = {
  legume: { epoch: 'ancestral', nova: 1, label: 'Unprocessed/minimally processed' },
  vegetable: { epoch: 'ancestral', nova: 1, label: 'Unprocessed/minimally processed' },
  protein: { epoch: 'ancestral', nova: 1, label: 'Unprocessed/minimally processed' },
  fermented: { epoch: 'ancestral', nova: 3, label: 'Processed (fermentation)' },
  soup: { epoch: 'ancestral', nova: 2, label: 'Culinary preparation' },
  dairy: { epoch: 'ancestral', nova: 1, label: 'Unprocessed/minimally processed' },
  cereal_low: { epoch: 'ancestral', nova: 1, label: 'Unprocessed/minimally processed' },
  salad: { epoch: 'ancestral', nova: 1, label: 'Unprocessed/minimally processed' },
  cereal_high: { epoch: 'industrial', nova: 3, label: 'Processed (refined)' },
  dessert: { epoch: 'industrial', nova: 4, label: 'Ultra-processed' },
  fried: { epoch: 'industrial', nova: 4, label: 'Ultra-processed' },
  snack: { epoch: 'industrial', nova: 4, label: 'Ultra-processed' },
  fruit: { epoch: 'ancestral', nova: 1, label: 'Unprocessed/minimally processed' },
  mixed: { epoch: 'mixed', nova: 2, label: 'Culinary preparation' },
}

export const COMPOUND_FAMILIES = {
  terpenes: [
    'Limonene', 'Linalool', 'alpha-Pinene', 'beta-Pinene', 'Myrcene',
    'Geraniol', 'Citral', 'Geranial', 'Neral', '1,8-Cineole', 'Camphor',
    'Borneol', 'Terpinolene', 'alpha-Terpineol', 'Terpinen-4-ol',
    'gamma-Terpinene', 'alpha-Terpinene', 'p-Cymene', 'Sabinene',
    'Camphene', 'Ocimene', 'beta-Caryophyllene', 'alpha-Humulene',
    'beta-Phellandrene', 'alpha-Phellandrene', 'Nerolidol',
    'Germacrene-D', 'alpha-Farnesene', 'beta-Bisabolene',
    'beta-Sesquiphellandrene', 'Zingiberene', 'ar-Curcumene',
    'Citronellal', 'Citronellol', 'Verbenone', 'Carnosol',
    'Menthol', 'Menthone', 'Piperitone', 'Pulegone',
  ],
  sulfides: [
    'Allicin', 'Diallyl_disulfide', 'Diallyl_trisulfide', 'Dimethyl_disulfide',
    'Dimethyl_trisulfide', 'Allyl_methyl_sulfide', 'Methyl_allyl_disulfide',
    'Dipropyl_disulfide', 'Methyl_propyl_disulfide', 'Diallyl_sulfide',
    'Allyl_sulfide', 'Dimethyl_sulfide', 'Hydrogen_sulfide',
    'Thiosulfinates', 'Ajoene', 'S-allylcysteine',
    'Allyl_isothiocyanate', 'Sinigrin', 'Propanethial_S-oxide',
  ],
  aldehydes: [
    'Hexanal', 'Nonanal', 'Octanal', 'Decanal', 'Dodecanal',
    'cis-3-Hexenal', '2-Decenal', '2-Dodecenal', 'Cinnamaldehyde',
    'Cuminaldehyde', 'Benzaldehyde', 'Phenylacetaldehyde',
    '2,4-Decadienal', '3-Methylbutanal', '2-Methylbutanal',
    'Piperonal', 'Vanillin', 'Citronellal',
  ],
  phenolics: [
    'Eugenol', 'Carvacrol', 'Thymol', 'Guaiacol', 'Capsaicin',
    'Curcumin', 'Quercetin', 'Kaempferol', 'Rosmarinic_acid',
    'Oleocanthal', 'Hydroxytyrosol', 'Gallic_acid',
    'Methyl_chavicol', 'Chavicol', 'Sesamol',
    'Gingerol_6', 'Shogaol_6', 'Zingerone',
  ],
  lactones: [
    'delta-Decalactone', 'delta-Octalactone', 'gamma-Dodecalactone',
    'Sotolone', 'Coumarin',
  ],
  pyrazines: [
    'Pyrazines', 'Tetramethylpyrazine', 'Trimethylpyrazine',
    '2,5-Dimethylpyrazine', '2-Isobutyl-3-methoxypyrazine',
    'Furfural', '2-Furylmethanol',
  ],
  acids: [
    'Lactic_acid', 'Acetic_acid', 'Butyric_acid', 'Tartaric_acid',
    'Malic_acid', 'Citric_acid', 'Glutamate', 'Inosinate',
  ],
}

export const GI_ZONES = [
  { min: 0, max: 35, label: 'Low', color: '#6a9968' },
  { min: 35, max: 55, label: 'Medium', color: '#d4a574' },
  { min: 55, max: 70, label: 'High', color: '#c17d5d' },
  { min: 70, max: 100, label: 'Very High', color: '#c94c4c' },
]

export const DATA_SOURCES = [
  { id: 'flavordb2', cite: 'FlavorDB2', detail: '25,595 flavor molecules, 2,254 mapped to 936 ingredients', ref: 'Goel et al., J. Food Sci., 2024' },
  { id: 'foodb', cite: 'FooDB', detail: '70,926 compounds, ~28,000 with experimental evidence', ref: 'foodb.ca' },
  { id: 'ahn2011', cite: 'Ahn et al. 2011', detail: '381 ingredients, 1,021 compounds, 56,498 recipes', ref: 'Sci. Rep. 1:196' },
  { id: 'jain2015', cite: 'Jain et al. 2015', detail: '2,543 Indian recipes, 194 ingredients, 1,170 compounds', ref: 'arXiv:1502.03815' },
  { id: 'pmc7791047', cite: 'PMC7791047', detail: '1,100+ non-Western food GI values', ref: 'Nutr. Diabetes, 2020' },
  { id: 'pmc9304465', cite: 'PMC9304465', detail: 'Indian food GI values', ref: 'Indian J. Med. Res., 2022' },
  { id: 'pmc9552392', cite: 'PMC9552392', detail: 'Indian food GI compendium', ref: 'Nutrients, 2022' },
  { id: 'pmc9570555', cite: 'PMC9570555', detail: 'Per-spice volatile compound counts via GC-MS', ref: 'Foods, 2022' },
  { id: 'pmc6966211', cite: 'PMC6966211', detail: 'Garlic 125 volatile compounds', ref: 'Molecules, 2020' },
  { id: 'caprioli2025', cite: 'Caprioli et al. 2025', detail: 'Culinary fingerprints via ingredient-type networks, SVM 95%', ref: 'Food Research Intl.' },
]
