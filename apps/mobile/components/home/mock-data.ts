/**
 * Mock Data for Home Grid Cards
 * This will be replaced with API data later
 */

import { ImageSourcePropType } from 'react-native';

// ============================================================================
// LOCAL IMAGE ASSETS
// ============================================================================

// Black Cars
const BLACK_CARS = {
  c1: require('@/assets/images/Black_cars/c1.webp'),
  c2: require('@/assets/images/Black_cars/c2.webp'),
  c3: require('@/assets/images/Black_cars/c3.webp'),
  c4: require('@/assets/images/Black_cars/c4.webp'),
  c5: require('@/assets/images/Black_cars/c5.webp'),
  c6: require('@/assets/images/Black_cars/c6.webp'),
  c7: require('@/assets/images/Black_cars/c7.webp'),
  c8: require('@/assets/images/Black_cars/c8.webp'),
  c9: require('@/assets/images/Black_cars/c9.webp'),
  c10: require('@/assets/images/Black_cars/c10.webp'),
  car1: require('@/assets/images/Black_cars/car1.webp'),
  car2: require('@/assets/images/Black_cars/car2.webp'),
  car3: require('@/assets/images/Black_cars/car3.webp'),
  car4: require('@/assets/images/Black_cars/car4.webp'),
  car5: require('@/assets/images/Black_cars/car5.webp'),
  car6: require('@/assets/images/Black_cars/car6.webp'),
  car7: require('@/assets/images/Black_cars/car7.webp'),
  car8: require('@/assets/images/Black_cars/car8.webp'),
  car9: require('@/assets/images/Black_cars/car9.webp'),
  car10: require('@/assets/images/Black_cars/car10.webp'),
  car11: require('@/assets/images/Black_cars/car11.webp'),
  car12: require('@/assets/images/Black_cars/car12.webp'),
  car13: require('@/assets/images/Black_cars/car13.webp'),
  car14: require('@/assets/images/Black_cars/car14.webp'),
};

// Labeled Cars
const LABELED_CARS = {
  porsche_gt3rs: require('@/assets/images/Labeled_Cars/Porsche_gt3rs_limtied_2020.jpeg'),
  lambo_huracan: require('@/assets/images/Labeled_Cars/Lamborgini_Hurccan_2016.jpeg'),
  mclaren_spyder_2020: require('@/assets/images/Labeled_Cars/mclearn_spyder_2020.jpeg'),
  mclaren_spyder_2018: require('@/assets/images/Labeled_Cars/mclearn_spuder_2018.jpeg'),
  lexus_lfa: require('@/assets/images/Labeled_Cars/lexus_lfa_2014.jpeg'),
  toyota_lc: require('@/assets/images/Labeled_Cars/toyota_landcruiser_2020.jpeg'),
  range_rover: require('@/assets/images/Labeled_Cars/Range_Rover_Sport_SVA_2018.jpeg'),
  gwagon: require('@/assets/images/Labeled_Cars/Mercedes_Gwagon_2020.jpeg'),
  audi_rs7: require('@/assets/images/Labeled_Cars/Audi_RS7_2021.jpeg'),
  audi_rs5_2015: require('@/assets/images/Labeled_Cars/audi_rs5_2015.jpeg'),
  audi_rs5_2014: require('@/assets/images/Labeled_Cars/audi_rs5_2014.jpeg'),
  lambo_urus: require('@/assets/images/Labeled_Cars/Lamborgini_Urus_2020.jpeg'),
};

// Videos
const VIDEOS = {
  hero2: require('@/assets/Videos/hero2.mp4'),
  revvuphero2: require('@/assets/Videos/revvuphero2.mp4'),
  rs7350: require('@/assets/Videos/rs7350.mp4'),
};

// ============================================================================
// TYPES
// ============================================================================

export interface CarListing {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  price: number;
  originalPrice?: number;
  mileage: number;
  emirate: string;
  specs: string;
  thumbnail: ImageSourcePropType;
  isBlkListing?: boolean;
}

export interface Partner {
  id: string;
  name: string;
  logo: ImageSourcePropType;
  bannerImage?: ImageSourcePropType;
  bannerColor?: string;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  isVerified: boolean;
  isFoundingPartner?: boolean;
  listings: CarListing[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  backgroundImage?: ImageSourcePropType;
  backgroundColor?: string;
  accentColor: string;
  listingCount: number;
  listings: CarListing[];
}

export interface Showroom {
  id: string;
  name: string;
  logo: ImageSourcePropType;
  heroImage: ImageSourcePropType;
  heroVideo?: number; // require() returns number for video assets
  heroTagline: string;
  emirate: string;
  address: string;
  rating: number;
  reviewCount: number;
  specialization: string;
  totalCarsSold: number;
  yearsInBusiness: number;
  isVerified: boolean;
  tier: 'standard' | 'gold' | 'platinum' | 'black';
}

// ============================================================================
// BLK SIGNATURE LINE - Premium Cars
// ============================================================================

export const blkSignatureListings: CarListing[] = [
  {
    id: 'blk-1',
    make: 'Porsche',
    model: '911 GT3 RS',
    year: 2020,
    trim: 'Limited',
    price: 1250000,
    mileage: 1200,
    emirate: 'dubai',
    specs: 'gcc',
    thumbnail: LABELED_CARS.porsche_gt3rs,
    isBlkListing: true,
  },
  {
    id: 'blk-2',
    make: 'Lamborghini',
    model: 'Huracán',
    year: 2016,
    trim: 'Performante',
    price: 1850000,
    mileage: 3500,
    emirate: 'abu_dhabi',
    specs: 'gcc',
    thumbnail: LABELED_CARS.lambo_huracan,
    isBlkListing: true,
  },
  {
    id: 'blk-3',
    make: 'McLaren',
    model: 'Spyder',
    year: 2020,
    trim: 'Super Series',
    price: 1450000,
    mileage: 800,
    emirate: 'dubai',
    specs: 'gcc',
    thumbnail: LABELED_CARS.mclaren_spyder_2020,
    isBlkListing: true,
  },
  {
    id: 'blk-4',
    make: 'Lexus',
    model: 'LFA',
    year: 2014,
    trim: 'Limited',
    price: 1150000,
    mileage: 5200,
    emirate: 'dubai',
    specs: 'gcc',
    thumbnail: LABELED_CARS.lexus_lfa,
    isBlkListing: true,
  },
];

// ============================================================================
// FOUNDING PARTNERS - Revvup First
// ============================================================================

export const foundingPartners: Partner[] = [
  {
    id: 'fp-1',
    name: 'Al Futtaim Motors',
    logo: BLACK_CARS.c1,
    bannerImage: BLACK_CARS.car1,
    bannerColor: '#1E3A5F',
    rating: 4.9,
    reviewCount: 12500,
    experienceYears: 35,
    isVerified: true,
    isFoundingPartner: true,
    listings: [
      {
        id: 'af-1',
        make: 'Toyota',
        model: 'Land Cruiser',
        year: 2020,
        trim: 'GR Sport',
        price: 425000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.toyota_lc,
      },
      {
        id: 'af-2',
        make: 'Lexus',
        model: 'LFA',
        year: 2014,
        trim: 'Limited',
        price: 485000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.lexus_lfa,
      },
      {
        id: 'af-3',
        make: 'Range Rover',
        model: 'Sport SVA',
        year: 2018,
        trim: 'SVA',
        price: 365000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.range_rover,
      },
    ],
  },
  {
    id: 'fp-2',
    name: 'Emirates Motor Company',
    logo: BLACK_CARS.c2,
    bannerImage: BLACK_CARS.car2,
    bannerColor: '#8B2942',
    rating: 4.8,
    reviewCount: 8900,
    experienceYears: 28,
    isVerified: true,
    isFoundingPartner: true,
    listings: [
      {
        id: 'em-1',
        make: 'Mercedes-Benz',
        model: 'G 63 AMG',
        year: 2020,
        price: 895000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.gwagon,
      },
      {
        id: 'em-2',
        make: 'Audi',
        model: 'RS7',
        year: 2021,
        trim: 'Sportback',
        price: 595000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.audi_rs7,
      },
      {
        id: 'em-3',
        make: 'Audi',
        model: 'RS5',
        year: 2015,
        trim: 'Coupe',
        price: 350000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.audi_rs5_2015,
      },
    ],
  },
  {
    id: 'fp-3',
    name: 'AGMC',
    logo: BLACK_CARS.c3,
    bannerImage: BLACK_CARS.car3,
    bannerColor: '#2D4A3E',
    rating: 4.9,
    reviewCount: 15200,
    experienceYears: 42,
    isVerified: true,
    isFoundingPartner: true,
    listings: [
      {
        id: 'ag-1',
        make: 'McLaren',
        model: 'Spyder',
        year: 2018,
        trim: 'Super Series',
        price: 895000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.mclaren_spyder_2018,
      },
      {
        id: 'ag-2',
        make: 'Lamborghini',
        model: 'Urus',
        year: 2020,
        trim: 'Performante',
        price: 625000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.lambo_urus,
      },
      {
        id: 'ag-3',
        make: 'Audi',
        model: 'RS5',
        year: 2014,
        trim: 'Coupe',
        price: 245000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.audi_rs5_2014,
      },
    ],
  },
];

// ============================================================================
// CATEGORIES - German, Japanese, etc.
// ============================================================================

export const categories: Category[] = [
  {
    id: 'cat-german',
    name: 'German Engineering',
    slug: 'german',
    backgroundColor: '#1A1A2E',
    backgroundImage: BLACK_CARS.car4,
    accentColor: '#D4AF37',
    listingCount: 3420,
    listings: [
      {
        id: 'ger-1',
        make: 'Audi',
        model: 'RS7',
        year: 2021,
        trim: 'Sportback',
        price: 485000,
        mileage: 2500,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.audi_rs7,
      },
      {
        id: 'ger-2',
        make: 'Audi',
        model: 'RS5',
        year: 2015,
        trim: 'Coupe',
        price: 595000,
        mileage: 1800,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.audi_rs5_2015,
      },
      {
        id: 'ger-3',
        make: 'Mercedes-Benz',
        model: 'G-Wagon',
        year: 2020,
        trim: 'AMG',
        price: 525000,
        mileage: 3200,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.gwagon,
      },
    ],
  },
  {
    id: 'cat-japanese',
    name: 'Japanese Legends',
    slug: 'japanese',
    backgroundColor: '#2D1B1B',
    backgroundImage: BLACK_CARS.car5,
    accentColor: '#E74C3C',
    listingCount: 5680,
    listings: [
      {
        id: 'jp-1',
        make: 'Lexus',
        model: 'LFA',
        year: 2014,
        trim: 'Limited',
        price: 895000,
        mileage: 500,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.lexus_lfa,
      },
      {
        id: 'jp-2',
        make: 'Toyota',
        model: 'Land Cruiser',
        year: 2020,
        trim: 'GR',
        price: 325000,
        mileage: 4200,
        emirate: 'sharjah',
        specs: 'gcc',
        thumbnail: LABELED_CARS.toyota_lc,
      },
      {
        id: 'jp-3',
        make: 'Lexus',
        model: 'LFA',
        year: 2014,
        trim: 'Convertible',
        price: 485000,
        mileage: 1800,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.lexus_lfa,
      },
    ],
  },
  {
    id: 'cat-hypercars',
    name: 'Hypercars',
    slug: 'hypercars',
    backgroundColor: '#0D0D0D',
    backgroundImage: BLACK_CARS.car6,
    accentColor: '#9B59B6',
    listingCount: 89,
    listings: [
      {
        id: 'hyp-1',
        make: 'McLaren',
        model: 'Spyder',
        year: 2020,
        trim: 'Super Series',
        price: 1250000,
        mileage: 800,
        emirate: 'dubai',
        specs: 'european',
        thumbnail: LABELED_CARS.mclaren_spyder_2020,
      },
      {
        id: 'hyp-2',
        make: 'McLaren',
        model: 'Spyder',
        year: 2018,
        trim: 'Super Series',
        price: 1580000,
        mileage: 150,
        emirate: 'abu_dhabi',
        specs: 'european',
        thumbnail: LABELED_CARS.mclaren_spyder_2018,
      },
      {
        id: 'hyp-3',
        make: 'Lamborghini',
        model: 'Huracán',
        year: 2016,
        trim: 'Performante',
        price: 1850000,
        mileage: 320,
        emirate: 'dubai',
        specs: 'european',
        thumbnail: LABELED_CARS.lambo_huracan,
      },
    ],
  },
  {
    id: 'cat-hidden-gems',
    name: 'Hidden Gems',
    slug: 'hidden-gems',
    backgroundColor: '#1B2D1B',
    backgroundImage: BLACK_CARS.car7,
    accentColor: '#2ECC71',
    listingCount: 234,
    listings: [
      {
        id: 'gem-1',
        make: 'Range Rover',
        model: 'Sport SVA',
        year: 2018,
        trim: 'SVA',
        price: 385000,
        mileage: 8500,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.range_rover,
      },
      {
        id: 'gem-2',
        make: 'Porsche',
        model: 'GT3 RS',
        year: 2020,
        trim: 'Limited',
        price: 425000,
        mileage: 1200,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.porsche_gt3rs,
      },
      {
        id: 'gem-3',
        make: 'Lamborghini',
        model: 'Urus',
        year: 2020,
        trim: 'Performante',
        price: 1250000,
        mileage: 600,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.lambo_urus,
      },
    ],
  },
];

// ============================================================================
// PARTNERS - Partner-specific inventory
// ============================================================================

export const partners: Partner[] = [
  {
    id: 'p-1',
    name: 'Sun City Motors',
    logo: BLACK_CARS.c4,
    bannerImage: BLACK_CARS.car8,
    bannerColor: '#9C7C38',
    rating: 4.7,
    reviewCount: 6800,
    experienceYears: 18,
    isVerified: true,
    listings: [
      {
        id: 'sc-1',
        make: 'Porsche',
        model: 'GT3 RS',
        year: 2020,
        trim: 'Limited',
        price: 2150000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.porsche_gt3rs,
      },
      {
        id: 'sc-2',
        make: 'McLaren',
        model: 'Spyder',
        year: 2020,
        trim: 'Super Series',
        price: 1450000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.mclaren_spyder_2020,
      },
      {
        id: 'sc-3',
        make: 'Lamborghini',
        model: 'Huracán',
        year: 2016,
        price: 1350000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.lambo_huracan,
      },
    ],
  },
  {
    id: 'p-2',
    name: 'VIP Motors',
    logo: BLACK_CARS.c5,
    bannerImage: BLACK_CARS.car9,
    bannerColor: '#5C4033',
    rating: 4.8,
    reviewCount: 9200,
    experienceYears: 22,
    isVerified: true,
    listings: [
      {
        id: 'vip-1',
        make: 'Lamborghini',
        model: 'Urus',
        year: 2020,
        trim: 'Performante',
        price: 1650000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.lambo_urus,
      },
      {
        id: 'vip-2',
        make: 'Mercedes-Benz',
        model: 'G-Wagon',
        year: 2020,
        trim: 'AMG',
        price: 1350000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.gwagon,
      },
      {
        id: 'vip-3',
        make: 'Range Rover',
        model: 'Sport SVA',
        year: 2018,
        trim: 'SVA',
        price: 895000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.range_rover,
      },
    ],
  },
  {
    id: 'p-3',
    name: 'Elite Auto Gallery',
    logo: BLACK_CARS.c6,
    bannerImage: BLACK_CARS.car10,
    bannerColor: '#4A4A4A',
    rating: 4.9,
    reviewCount: 11500,
    experienceYears: 25,
    isVerified: true,
    listings: [
      {
        id: 'elite-1',
        make: 'Audi',
        model: 'RS7',
        year: 2021,
        trim: 'Sportback',
        price: 980000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.audi_rs7,
      },
      {
        id: 'elite-2',
        make: 'Lexus',
        model: 'LFA',
        year: 2014,
        trim: 'Limited',
        price: 1250000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.lexus_lfa,
      },
      {
        id: 'elite-3',
        make: 'Toyota',
        model: 'Land Cruiser',
        year: 2020,
        trim: 'GR Sport',
        price: 550000,
        mileage: 0,
        emirate: 'dubai',
        specs: 'gcc',
        thumbnail: LABELED_CARS.toyota_lc,
      },
    ],
  },
];

// ============================================================================
// SHOWROOMS
// ============================================================================

export const showrooms: Showroom[] = [
  {
    id: 'sr-1',
    name: 'Al Quoz Luxury Motors',
    logo: BLACK_CARS.c7,
    heroImage: BLACK_CARS.car11,
    heroVideo: VIDEOS.hero2,
    heroTagline: 'Where Dreams Meet the Road',
    emirate: 'Dubai',
    address: 'Al Quoz Industrial Area 3',
    rating: 4.9,
    reviewCount: 4500,
    specialization: 'Supercars & Hypercars',
    totalCarsSold: 2850,
    yearsInBusiness: 18,
    isVerified: true,
    tier: 'black',
  },
  {
    id: 'sr-2',
    name: 'Emirates Prestige',
    logo: BLACK_CARS.c8,
    heroImage: BLACK_CARS.car12,
    heroVideo: VIDEOS.revvuphero2,
    heroTagline: 'Excellence in Every Detail',
    emirate: 'Dubai',
    address: 'Sheikh Zayed Road',
    rating: 4.8,
    reviewCount: 7800,
    specialization: 'German Luxury',
    totalCarsSold: 4200,
    yearsInBusiness: 25,
    isVerified: true,
    tier: 'platinum',
  },
  {
    id: 'sr-3',
    name: 'Capital Motors',
    logo: BLACK_CARS.c9,
    heroImage: BLACK_CARS.car13,
    heroVideo: VIDEOS.rs7350,
    heroTagline: 'Performance Redefined',
    emirate: 'Abu Dhabi',
    address: 'Yas Island',
    rating: 4.7,
    reviewCount: 3200,
    specialization: 'Performance & Sports',
    totalCarsSold: 1650,
    yearsInBusiness: 12,
    isVerified: true,
    tier: 'gold',
  },
  {
    id: 'sr-4',
    name: 'Marina Exotics',
    logo: BLACK_CARS.c10,
    heroImage: BLACK_CARS.car14,
    heroVideo: VIDEOS.hero2,
    heroTagline: 'Italian Passion, Dubai Style',
    emirate: 'Dubai',
    address: 'Dubai Marina Walk',
    rating: 4.9,
    reviewCount: 5600,
    specialization: 'Italian Exotics',
    totalCarsSold: 3100,
    yearsInBusiness: 15,
    isVerified: true,
    tier: 'black',
  },
];
