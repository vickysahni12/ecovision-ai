export interface SampleWasteItem {
  id: string;
  name: string;
  category: 'recyclable' | 'organic' | 'hazardous' | 'landfill';
  description: string;
  fileName: string;
  dataUrl: string;
}

// Crisp, lightweight SVG Data URIs for instant preview testing without external network dependency
export const SAMPLE_WASTE_ITEMS: SampleWasteItem[] = [
  {
    id: 'sample-pet-bottle',
    name: 'PET Plastic Water Bottle',
    category: 'recyclable',
    description: 'Clear plastic water bottle with screw cap (Polyethylene Terephthalate)',
    fileName: 'pet_water_bottle_500ml.png',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23f0fdf4"/>
          <stop offset="100%" stop-color="%23dcfce7"/>
        </linearGradient>
        <linearGradient id="bottle" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="%2338bdf8" stop-opacity="0.7"/>
          <stop offset="50%" stop-color="%23bae6fd" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="%230284c7" stop-opacity="0.8"/>
        </linearGradient>
        <linearGradient id="cap" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="%230284c7"/>
          <stop offset="100%" stop-color="%230369a1"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" rx="24" fill="url(%23bg)"/>
      <rect x="180" y="55" width="40" height="25" rx="4" fill="url(%23cap)"/>
      <rect x="185" y="80" width="30" height="20" fill="%23e0f2fe"/>
      <path d="M185 100 Q150 140 150 190 L150 330 Q150 345 165 345 L235 345 Q250 345 250 330 L250 190 Q250 140 215 100 Z" fill="url(%23bottle)"/>
      <rect x="150" y="200" width="100" height="60" rx="6" fill="%23ffffff" fill-opacity="0.9"/>
      <text x="200" y="235" font-family="sans-serif" font-size="14" font-weight="bold" fill="%230369a1" text-anchor="middle">PURE SPRING</text>
      <text x="200" y="250" font-family="sans-serif" font-size="10" fill="%2364748b" text-anchor="middle">100% Recyclable PET</text>
      <circle cx="200" cy="310" r="14" fill="%23059669" fill-opacity="0.15"/>
      <path d="M195 310 L198 314 L206 306" stroke="%23059669" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'sample-soda-can',
    name: 'Aluminum Soda Can',
    category: 'recyclable',
    description: 'Empty beverage can made from recyclable aluminum',
    fileName: 'aluminum_can_330ml.png',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23f1f5f9"/>
          <stop offset="100%" stop-color="%23e2e8f0"/>
        </linearGradient>
        <linearGradient id="can" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="%23ef4444"/>
          <stop offset="40%" stop-color="%23f87171"/>
          <stop offset="100%" stop-color="%23b91c1c"/>
        </linearGradient>
        <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="%23cbd5e1"/>
          <stop offset="50%" stop-color="%23f8fafc"/>
          <stop offset="100%" stop-color="%2394a3b8"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" rx="24" fill="url(%23bg2)"/>
      <ellipse cx="200" cy="100" rx="45" ry="12" fill="url(%23metal)"/>
      <path d="M155 100 L150 120 L150 310 Q150 325 200 325 Q250 325 250 310 L250 120 L245 100 Z" fill="url(%23can)"/>
      <ellipse cx="200" cy="100" rx="40" ry="10" fill="%2394a3b8"/>
      <ellipse cx="200" cy="100" rx="12" ry="4" fill="%23475569"/>
      <text x="200" y="210" font-family="sans-serif" font-size="20" font-weight="900" fill="%23ffffff" text-anchor="middle" letter-spacing="2">SPARK</text>
      <text x="200" y="235" font-family="sans-serif" font-size="11" fill="%23fee2e2" text-anchor="middle">ALUMINUM BEVERAGE</text>
    </svg>`,
  },
  {
    id: 'sample-banana-peel',
    name: 'Organic Banana Peel',
    category: 'organic',
    description: 'Decomposable food scrap suitable for municipal or home composting',
    fileName: 'organic_banana_peel.png',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23fefce8"/>
          <stop offset="100%" stop-color="%23fef08a"/>
        </linearGradient>
        <linearGradient id="banana" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23eab308"/>
          <stop offset="80%" stop-color="%23ca8a04"/>
          <stop offset="100%" stop-color="%23713f12"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" rx="24" fill="url(%23bg3)"/>
      <path d="M140 120 Q160 210 210 270 Q260 330 310 320 Q270 260 250 190 Q230 130 140 120 Z" fill="url(%23banana)"/>
      <path d="M140 120 Q120 190 120 280 Q130 290 160 280 Q160 210 180 150 Z" fill="%23facc15"/>
      <circle cx="138" cy="118" r="8" fill="%23451a03"/>
      <text x="200" y="360" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23854d0e" text-anchor="middle">100% Compostable Organic</text>
    </svg>`,
  },
  {
    id: 'sample-cardboard-box',
    name: 'Corrugated Shipping Box',
    category: 'recyclable',
    description: 'Clean shipping carton made of recyclable unbleached kraft paperboard',
    fileName: 'shipping_cardboard_carton.png',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23fafaf9"/>
          <stop offset="100%" stop-color="%23f5f5f4"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" rx="24" fill="url(%23bg4)"/>
      <polygon points="200,90 320,150 200,210 80,150" fill="%23d6a36c"/>
      <polygon points="80,150 200,210 200,310 80,250" fill="%23b8814a"/>
      <polygon points="200,210 320,150 320,250 200,310" fill="%239c6b38"/>
      <line x1="200" y1="90" x2="200" y2="210" stroke="%23b8814a" stroke-width="2"/>
      <text x="200" y="350" font-family="sans-serif" font-size="13" font-weight="bold" fill="%2378350f" text-anchor="middle">Corrugated Kraft Cardboard</text>
    </svg>`,
  },
  {
    id: 'sample-battery',
    name: 'Alkaline AA Battery',
    category: 'hazardous',
    description: 'Heavy metal electrochemical cell requiring certified e-waste or hazard drop-off',
    fileName: 'alkaline_battery_cell.png',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23fff1f2"/>
          <stop offset="100%" stop-color="%23ffe4e6"/>
        </linearGradient>
        <linearGradient id="battTop" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="%23f59e0b"/>
          <stop offset="50%" stop-color="%23fbbf24"/>
          <stop offset="100%" stop-color="%23d97706"/>
        </linearGradient>
        <linearGradient id="battBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="%231e293b"/>
          <stop offset="50%" stop-color="%23334155"/>
          <stop offset="100%" stop-color="%230f172a"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" rx="24" fill="url(%23bg5)"/>
      <rect x="185" y="80" width="30" height="15" rx="3" fill="%23cbd5e1"/>
      <rect x="155" y="95" width="90" height="60" rx="4" fill="url(%23battTop)"/>
      <rect x="155" y="155" width="90" height="150" rx="4" fill="url(%23battBody)"/>
      <text x="200" y="220" font-family="sans-serif" font-size="18" font-weight="900" fill="%23f59e0b" text-anchor="middle">1.5V AA</text>
      <text x="200" y="245" font-family="sans-serif" font-size="11" fill="%23e2e8f0" text-anchor="middle">DO NOT LANDFILL</text>
      <text x="200" y="350" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23e11d48" text-anchor="middle">Hazardous / E-Waste Drop-off Only</text>
    </svg>`,
  },
];
