import { IssueCategory, IssueStatus, CategoryInfo } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'pothole',
    label: 'Pothole & Road Damage',
    description: 'Deep road potholes, crumbling asphalt, or crater hazards',
    slaDefaultHours: 48,
    color: '#ea580c', // orange-600
    icon: 'AlertTriangle',
  },
  {
    id: 'garbage',
    label: 'Garbage & Waste Pile',
    description: 'Overflowing dumpsters, illegal dumping, uncollected trash',
    slaDefaultHours: 24,
    color: '#16a34a', // green-600
    icon: 'Trash2',
  },
  {
    id: 'streetlight',
    label: 'Streetlight Broken',
    description: 'Dark streets, flickering or damaged light poles',
    slaDefaultHours: 36,
    color: '#eab308', // yellow-500
    icon: 'Lightbulb',
  },
  {
    id: 'water_leakage',
    label: 'Water Pipe Leakage',
    description: 'Burst municipal supply lines or continuous potable water leaks',
    slaDefaultHours: 12,
    color: '#0284c7', // sky-600
    icon: 'Droplets',
  },
  {
    id: 'drainage',
    label: 'Clogged Drainage / Sewage',
    description: 'Stagnant water logging, overflowing manholes, foul sewage',
    slaDefaultHours: 24,
    color: '#7c3aed', // violet-600
    icon: 'Waves',
  },
  {
    id: 'traffic_signal',
    label: 'Traffic Signal Failure',
    description: 'Dead or blinking signals causing major junction congestion',
    slaDefaultHours: 6,
    color: '#dc2626', // red-600
    icon: 'Activity',
  },
  {
    id: 'fallen_tree',
    label: 'Fallen Tree / Branch',
    description: 'Blocked road or overhead wire hazard from fallen tree',
    slaDefaultHours: 12,
    color: '#059669', // emerald-600
    icon: 'TreePine',
  },
  {
    id: 'sidewalk',
    label: 'Broken Footpath / Curb',
    description: 'Damaged pedestrian walkways, open slabs, missing paver blocks',
    slaDefaultHours: 72,
    color: '#4b5563', // gray-600
    icon: 'Footprints',
  },
  {
    id: 'other',
    label: 'Other Civic Hazard',
    description: 'Encroachments, illegal banners, or open electrical boxes',
    slaDefaultHours: 48,
    color: '#64748b', // slate-500
    icon: 'HelpCircle',
  },
];

export const STATUS_CONFIG: Record<
  IssueStatus,
  { label: string; bg: string; text: string; border: string; dot: string; description: string }
> = {
  reported: {
    label: 'Reported',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    description: 'Waiting for municipal officer acknowledgment',
  },
  acknowledged: {
    label: 'Acknowledged',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    description: 'Assigned to ward field inspector',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    description: 'Maintenance team deployed on-site',
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    description: 'Work completed with resolution proof',
  },
  disputed: {
    label: 'Disputed',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    description: 'Citizen contested resolution quality',
  },
  closed: {
    label: 'Closed',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    description: 'Verified by citizens and archived',
  },
};

export const WARDS_LIST = [
  'Ward 1 - Model Town, Jalandhar',
  'Ward 2 - Civil Lines, Jalandhar',
  'Ward 3 - Cantt Road, Jalandhar',
  'Ward 4 - Rama Mandi, Jalandhar',
  'Ward 5 - Phillaur Municipal Core',
  'Ward 6 - Phillaur Fort Road',
  'Ward 7 - GT Road, Jalandhar',
  'Ward 8 - Urban Estate Phase II, Jalandhar',
  'Ward 9 - BMC Chowk, Jalandhar',
  'Ward 10 - Basti Sheikh, Jalandhar',
];

export const INDIAN_STATES = [
  'Punjab',
  'Maharashtra',
  'Delhi',
  'Karnataka',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Gujarat',
  'West Bengal',
  'Rajasthan',
  'Haryana',
  'Kerala',
  'Telangana',
  'Madhya Pradesh',
  'Andhra Pradesh',
  'Bihar',
  'Odisha',
];

export const STATE_DISTRICTS_MAP: Record<string, string[]> = {
  Punjab: [
    'Jalandhar',
    'Ludhiana',
    'Amritsar',
    'SAS Nagar (Mohali)',
    'Patiala',
    'Bathinda',
    'Hoshiarpur',
    'Kapurthala',
    'Pathankot',
    'Moga',
  ],
  Maharashtra: [
    'Mumbai City',
    'Mumbai Suburban',
    'Pune',
    'Nagpur',
    'Thane',
    'Nashik',
    'Aurangabad',
    'Solapur',
  ],
  Delhi: [
    'Central Delhi',
    'New Delhi',
    'South Delhi',
    'North Delhi',
    'West Delhi',
    'East Delhi',
    'South West Delhi',
  ],
  Karnataka: [
    'Bengaluru Urban',
    'Mysuru',
    'Dakshina Kannada (Mangaluru)',
    'Hubballi-Dharwad',
    'Belagavi',
    'Kalaburagi',
  ],
  'Tamil Nadu': [
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Tiruchirappalli',
    'Salem',
    'Tirunelveli',
  ],
  'Uttar Pradesh': [
    'Lucknow',
    'Kanpur Nagar',
    'Varanasi',
    'Agra',
    'Prayagraj',
    'Gautam Buddha Nagar (Noida)',
    'Ghaziabad',
  ],
  Gujarat: [
    'Ahmedabad',
    'Surat',
    'Vadodara',
    'Rajkot',
    'Gandhinagar',
    'Bhavnagar',
  ],
  'West Bengal': [
    'Kolkata',
    'Howrah',
    'North 24 Parganas',
    'South 24 Parganas',
    'Darjeeling',
    'Siliguri',
  ],
  Rajasthan: [
    'Jaipur',
    'Jodhpur',
    'Kota',
    'Udaipur',
    'Bikaner',
    'Ajmer',
  ],
  Haryana: [
    'Gurugram',
    'Faridabad',
    'Panipat',
    'Ambala',
    'Karnal',
    'Panchkula',
  ],
  Kerala: [
    'Thiruvananthapuram',
    'Ernakulam (Kochi)',
    'Kozhikode',
    'Thrissur',
    'Kollam',
  ],
  Telangana: [
    'Hyderabad',
    'Warangal',
    'Medchal-Malkajgiri',
    'Rangareddy',
    'Nizamabad',
  ],
  'Madhya Pradesh': [
    'Bhopal',
    'Indore',
    'Gwalior',
    'Jabalpur',
    'Ujjain',
  ],
  'Andhra Pradesh': [
    'Visakhapatnam',
    'Vijayawada',
    'Guntur',
    'Tirupati',
    'Nellore',
  ],
  Bihar: [
    'Patna',
    'Gaya',
    'Bhagalpur',
    'Muzaffarpur',
    'Darbhanga',
  ],
  Odisha: [
    'Khurda (Bhubaneswar)',
    'Cuttack',
    'Sundargarh (Rourkela)',
    'Puri',
    'Sambalpur',
  ],
};

export const JALANDHAR_WARDS = [
  'Ward 1 - Model Town Urban Zone',
  'Ward 2 - Civil Lines Administrative Ward',
  'Ward 3 - Cantt Road & Defense Colony',
  'Ward 4 - Rama Mandi Commercial Hub',
  'Ward 5 - Phillaur Municipal Core',
  'Ward 6 - Phillaur Fort Road',
  'Ward 7 - GT Road Commercial Corridor',
  'Ward 8 - Urban Estate Phase II',
  'Ward 9 - BMC Chowk & Central Market',
  'Ward 10 - Basti Sheikh & Industrial Area',
];

export function getWardsForDistrict(districtName: string): string[] {
  if (!districtName) return JALANDHAR_WARDS;
  const dLower = districtName.toLowerCase();
  if (dLower.includes('jalandhar')) {
    return JALANDHAR_WARDS;
  }
  if (dLower.includes('ludhiana')) {
    return [
      'Zone A - Clock Tower & Old City',
      'Zone B - Gill Road & Industrial Area',
      'Zone C - Focal Point & Dhandari',
      'Zone D - Sarabha Nagar & Civil Lines',
      'Ward 1 - Model Town Ludhiana',
      'Ward 2 - Dugri Phase 1 & 2',
      'Ward 3 - Haibowal Kalan',
      'Ward 4 - Civil Lines West',
    ];
  }
  if (dLower.includes('amritsar')) {
    return [
      'Ward 1 - Golden Temple Heritage Zone',
      'Ward 2 - Lawrence Road & Mall Road',
      'Ward 3 - Ranjit Avenue Commercial',
      'Ward 4 - Majitha Road Residential',
      'Ward 5 - Chheharta Industrial Belt',
    ];
  }
  if (dLower.includes('mohali') || dLower.includes('sas nagar')) {
    return [
      'Phase 1 - Industrial & Commercial',
      'Phase 3B2 - Urban Market Zone',
      'Phase 7 - Central Residential Sector',
      'Sector 70 - Green Avenue',
      'Sector 71 - Administrative Block',
      'Sector 79 - Airport Road Corridor',
    ];
  }
  if (dLower.includes('mumbai')) {
    return [
      'Ward A - Colaba & Fort',
      'Ward D - Malabar Hill & Breach Candy',
      'Ward F/N - Matunga & Wadala',
      'Ward G/S - Worli & Lower Parel',
      'Ward H/W - Bandra West & Khar',
      'Ward K/W - Andheri West & Juhu',
    ];
  }
  if (dLower.includes('bengaluru')) {
    return [
      'Ward 112 - Domlur & Indiranagar',
      'Ward 150 - Bellandur Tech Corridor',
      'Ward 174 - HSR Layout Sector 1-7',
      'Ward 151 - Koramangala Central',
      'Ward 75 - Malleshwaram West',
      'Ward 160 - Whitefield Inner Circle',
    ];
  }
  if (dLower.includes('delhi')) {
    return [
      'Ward 1 - Civil Lines & University',
      'Ward 2 - Connaught Place & Central',
      'Ward 3 - Karol Bagh Commercial',
      'Ward 4 - Hauz Khas & South Ext',
      'Ward 5 - Rohini Sector 7-15',
      'Ward 6 - Dwarka Sector 6-12',
    ];
  }
  // Generic municipal wards for any selected district
  return [
    `Ward 1 - Central Zone, ${districtName}`,
    `Ward 2 - Civil Lines, ${districtName}`,
    `Ward 3 - Model Town, ${districtName}`,
    `Ward 4 - Green Park, ${districtName}`,
    `Ward 5 - Commercial Core, ${districtName}`,
    `Ward 6 - North Extension, ${districtName}`,
    `Ward 7 - South Block, ${districtName}`,
    `Ward 8 - East Division, ${districtName}`,
    `Ward 9 - West Zone, ${districtName}`,
    `Ward 10 - Cantonment Board, ${districtName}`,
  ];
}



