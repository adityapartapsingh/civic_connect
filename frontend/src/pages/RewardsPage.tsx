import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { issuesApi, authApi } from '../services/api';
import { WardLeaderboardItem } from '../types';
import { INDIAN_STATES } from '../utils/constants';
import {
  Trophy,
  Shield,
  ShieldCheck,
  MapPin,
  Flame,
  Users,
  Building2,
  Building,
  Flag,
  Gift,
  ShoppingBag,
  Check,
  ArrowRight,
  Coins,
  HelpCircle,
  Info,
  AlertTriangle,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

// =====================================================================
// REWARDS CATALOG ITEM INTERFACE
// =====================================================================
export interface RewardItem {
  id: string;
  name: string;
  category: 'merch' | 'utility' | 'honor';
  coins: number;
  points?: number; // legacy alias
  image: string;
  description: string;
  stock?: number;
  sizes?: string[];
  specs: string;
}

// =====================================================================
// CITIZEN REWARDS CATALOG
// =====================================================================
export const CITIZEN_REWARDS_CATALOG: RewardItem[] = [
  {
    id: 'merch_tshirt',
    name: 'Official Civic Connect Organic T-Shirt',
    category: 'merch',
    coins: 500,
    points: 500,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    description: '100% bio-washed breathable cotton t-shirt with embroidered municipal civic badge on sleeve.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specs: 'Heavyweight 220 GSM • Unisex Fit • Navy & Slate',
  },
  {
    id: 'merch_bottle',
    name: 'Stainless Steel Insulated Thermal Bottle (750ml)',
    category: 'merch',
    coins: 350,
    points: 350,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    description: 'Double-walled vacuum insulated flask keeps water icy cold for 24 hours. Laser engraved Civic Connect logo.',
    specs: 'Grade 304 Steel • Leakproof • Matte Charcoal',
  },
  {
    id: 'merch_mug',
    name: 'Ceramic Civic Champion Coffee & Chai Mug',
    category: 'merch',
    coins: 200,
    points: 200,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    description: 'Sturdy matte ceramic mug for your daily brew. Microwave & dishwasher safe.',
    specs: '350ml Capacity • Ergonomic Handle • Cobalt Blue',
  },
  {
    id: 'merch_cap',
    name: 'Embroidered Cotton Twill Civic Scout Cap',
    category: 'merch',
    coins: 150,
    points: 150,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80',
    description: 'Breathable 6-panel unstructured cap with brass buckle clasp. Protects on field verification rounds.',
    specs: '100% Chino Cotton • Adjustable Strap • Deep Forest Green',
  },
  {
    id: 'merch_cert',
    name: 'Municipal Certificate of Civic Honor',
    category: 'honor',
    coins: 750,
    points: 750,
    image: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80',
    description: 'Official gold-embossed Parchment Certificate signed by Municipal Commissioner, Jalandhar & Mayor.',
    specs: 'A4 Archival Heavy Vellum • Serialized Seal • Framing Included',
  },
  {
    id: 'merch_pass',
    name: 'Fast-Track Citizen Pass (Municipal Corporation)',
    category: 'utility',
    coins: 1000,
    points: 1000,
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    description: 'Priority citizen queue pass for civic services, property tax counter, and NOC approvals for 1 year.',
    specs: 'NFC Smart Card • Valid across Jalandhar Zones • Non-Transferable',
  },
];

// =====================================================================
// LEADERBOARD INTERFACES
// =====================================================================
interface LeaderboardUser {
  rank: number;
  name: string;
  phoneMasked: string;
  points: number;
  solvedCount: number;
  ward: string;
  district: string;
  state: string;
  badge: string;
  isCurrentUser?: boolean;
}

interface OfficerLeaderboardUser {
  rank: number;
  name: string;
  designation: string;
  employeeId: string;
  department: string;
  wardOrDivision: string;
  district: string;
  state: string;
  solvedCount: number; // PRIMARY METRIC: Problems Resolved
  onTimeSlaPercent: number;
  satisfactionPercent: number;
  servicePoints: number;
  badge: string;
  isCurrentUser?: boolean;
}

// =====================================================================
// CITIZEN LEADERBOARDS (Ranked by Community Points & Reports Verified)
// =====================================================================
const COMMUNITY_LOCAL_CITIZENS: Omit<LeaderboardUser, 'rank'>[] = [
  { name: 'Harpreet Singh', phoneMasked: '98***1120', points: 680, solvedCount: 24, ward: 'Ward 2 - Civil Lines', district: 'Jalandhar', state: 'Punjab', badge: 'Elite' },
  { name: 'Gurjit Kaur', phoneMasked: '98***8842', points: 590, solvedCount: 19, ward: 'Ward 2 - Civil Lines', district: 'Jalandhar', state: 'Punjab', badge: 'Elite' },
  { name: 'Raman K. Sharma', phoneMasked: '94***3391', points: 470, solvedCount: 16, ward: 'Ward 2 - Civil Lines', district: 'Jalandhar', state: 'Punjab', badge: 'Veteran' },
  { name: 'Manish Verma', phoneMasked: '98***5502', points: 380, solvedCount: 13, ward: 'Ward 2 - Civil Lines', district: 'Jalandhar', state: 'Punjab', badge: 'Veteran' },
  { name: 'Deepak Joshi', phoneMasked: '98***6671', points: 160, solvedCount: 4, ward: 'Ward 2 - Civil Lines', district: 'Jalandhar', state: 'Punjab', badge: 'Scout' },
  { name: 'Kavita Chawla', phoneMasked: '99***2210', points: 140, solvedCount: 4, ward: 'Ward 2 - Civil Lines', district: 'Jalandhar', state: 'Punjab', badge: 'Scout' },
];

const COMMUNITY_DISTRICT_CITIZENS: Omit<LeaderboardUser, 'rank'>[] = [
  { name: 'Dr. Jaswant Rai', phoneMasked: '98***9901', points: 1420, solvedCount: 52, ward: 'Model Town', district: 'Jalandhar', state: 'Punjab', badge: 'Hall of Fame' },
  { name: 'Simranjit Randhawa', phoneMasked: '98***4412', points: 1190, solvedCount: 43, ward: 'Cantt Road', district: 'Jalandhar', state: 'Punjab', badge: 'Elite' },
  { name: 'Baldev Krishan', phoneMasked: '98***7731', points: 980, solvedCount: 36, ward: 'Rama Mandi', district: 'Jalandhar', state: 'Punjab', badge: 'Elite' },
  { name: 'Harpreet Singh', phoneMasked: '98***1120', points: 680, solvedCount: 24, ward: 'Civil Lines', district: 'Jalandhar', state: 'Punjab', badge: 'Elite' },
  { name: 'Amitabh Sen', phoneMasked: '98***3320', points: 640, solvedCount: 22, ward: 'Urban Estate II', district: 'Jalandhar', state: 'Punjab', badge: 'Elite' },
];

export { INDIAN_STATES };

export type IndianState = (typeof INDIAN_STATES)[number];

const STATE_CITIZENS_DATA: Record<string, Omit<LeaderboardUser, 'rank'>[]> = {
  Punjab: [
    { name: 'Col. Rajesh Bakshi (Retd)', phoneMasked: '98***3301', points: 2890, solvedCount: 112, ward: 'Sector 70', district: 'SAS Nagar (Mohali)', state: 'Punjab', badge: 'National Glory' },
    { name: 'Navneet Sodhi', phoneMasked: '98***8819', points: 2340, solvedCount: 89, ward: 'Civil Lines', district: 'Ludhiana', state: 'Punjab', badge: 'Hall of Fame' },
    { name: 'Dr. Jaswant Rai', phoneMasked: '98***9901', points: 1420, solvedCount: 52, ward: 'Model Town', district: 'Jalandhar', state: 'Punjab', badge: 'Hall of Fame' },
    { name: 'Amrik Singh Dhillon', phoneMasked: '98***2290', points: 1380, solvedCount: 49, ward: 'Ranjit Avenue', district: 'Amritsar', state: 'Punjab', badge: 'Hall of Fame' },
    { name: 'Harleen Sandhu', phoneMasked: '98***6612', points: 940, solvedCount: 34, ward: 'Urban Estate Phase 1', district: 'Patiala', state: 'Punjab', badge: 'Elite' },
  ],
  Maharashtra: [
    { name: 'Vikram Shinde', phoneMasked: '98***4401', points: 2750, solvedCount: 98, ward: 'Bandra West', district: 'Mumbai Suburban', state: 'Maharashtra', badge: 'Hall of Fame' },
    { name: 'Ananya Deshmukh', phoneMasked: '97***1102', points: 2190, solvedCount: 76, ward: 'Kothrud', district: 'Pune', state: 'Maharashtra', badge: 'Hall of Fame' },
    { name: 'Rohan Kulkarni', phoneMasked: '98***8820', points: 1680, solvedCount: 61, ward: 'Dharampeth', district: 'Nagpur', state: 'Maharashtra', badge: 'Elite' },
    { name: 'Pooja Patil', phoneMasked: '99***3319', points: 1120, solvedCount: 42, ward: 'Cidco Sector 4', district: 'Nashik', state: 'Maharashtra', badge: 'Elite' },
  ],
  Delhi: [
    { name: 'Arjun Mehra', phoneMasked: '98***7711', points: 2610, solvedCount: 92, ward: 'Rohini Sector 9', district: 'North West Delhi', state: 'Delhi', badge: 'Hall of Fame' },
    { name: 'Sonal Aggarwal', phoneMasked: '98***2290', points: 2140, solvedCount: 78, ward: 'Hauz Khas', district: 'South Delhi', state: 'Delhi', badge: 'Hall of Fame' },
    { name: 'Gaurav Batra', phoneMasked: '98***9931', points: 1540, solvedCount: 55, ward: 'Janakpuri', district: 'West Delhi', state: 'Delhi', badge: 'Elite' },
  ],
  Karnataka: [
    { name: 'Karthik Narayanan', phoneMasked: '98***4410', points: 2840, solvedCount: 104, ward: 'Indiranagar 100ft', district: 'Bengaluru Urban', state: 'Karnataka', badge: 'Hall of Fame' },
    { name: 'Deepa Hegde', phoneMasked: '97***7721', points: 2210, solvedCount: 81, ward: 'Jayalakshmipuram', district: 'Mysuru', state: 'Karnataka', badge: 'Hall of Fame' },
    { name: 'Srinivas Rao', phoneMasked: '99***5512', points: 1490, solvedCount: 53, ward: 'Kodialbail', district: 'Dakshina Kannada', state: 'Karnataka', badge: 'Elite' },
  ],
  'Tamil Nadu': [
    { name: 'S. Ramachandran', phoneMasked: '98***8812', points: 2690, solvedCount: 96, ward: 'Anna Nagar', district: 'Chennai', state: 'Tamil Nadu', badge: 'Hall of Fame' },
    { name: 'Meenakshi Sundaram', phoneMasked: '94***3320', points: 1980, solvedCount: 71, ward: 'RS Puram', district: 'Coimbatore', state: 'Tamil Nadu', badge: 'Elite' },
  ],
};

function getCitizensForState(stateName: string): Omit<LeaderboardUser, 'rank'>[] {
  if (STATE_CITIZENS_DATA[stateName]) {
    return STATE_CITIZENS_DATA[stateName];
  }
  return [
    { name: `Citizen Champion (${stateName})`, phoneMasked: '98***1100', points: 1850, solvedCount: 65, ward: 'Ward 1 - Central', district: 'Capital Division', state: stateName, badge: 'Hall of Fame' },
    { name: `Civic Leader (${stateName})`, phoneMasked: '98***2200', points: 1420, solvedCount: 51, ward: 'Ward 4 - Green Park', district: 'District HQ', state: stateName, badge: 'Elite' },
    { name: `Neighborhood Scout (${stateName})`, phoneMasked: '98***3300', points: 1110, solvedCount: 39, ward: 'Ward 8 - North Block', district: 'East Zone', state: stateName, badge: 'Elite' },
  ];
}

const COMMUNITY_INDIA_CITIZENS: Omit<LeaderboardUser, 'rank'>[] = [
  { name: 'Col. Rajesh Bakshi (Retd)', phoneMasked: '98***3301', points: 2890, solvedCount: 112, ward: 'Sector 70', district: 'SAS Nagar (Mohali)', state: 'Punjab', badge: 'National Glory' },
  { name: 'Karthik Narayanan', phoneMasked: '98***4410', points: 2840, solvedCount: 104, ward: 'Indiranagar', district: 'Bengaluru', state: 'Karnataka', badge: 'Hall of Fame' },
  { name: 'Vikram Shinde', phoneMasked: '98***4401', points: 2750, solvedCount: 98, ward: 'Bandra West', district: 'Mumbai', state: 'Maharashtra', badge: 'Hall of Fame' },
  { name: 'S. Ramachandran', phoneMasked: '98***8812', points: 2690, solvedCount: 96, ward: 'Anna Nagar', district: 'Chennai', state: 'Tamil Nadu', badge: 'Hall of Fame' },
  { name: 'Vikramaditya Roy', phoneMasked: '98***2241', points: 2610, solvedCount: 94, ward: 'Salt Lake Sector 5', district: 'Kolkata', state: 'West Bengal', badge: 'Hall of Fame' },
];

// =====================================================================
// OFFICER LEADERBOARDS (Ranked Strictly by Problems Resolved)
// =====================================================================
const OFFICER_LEADERBOARD_LOCAL: Omit<OfficerLeaderboardUser, 'rank'>[] = [
  { name: 'Er. Manpreet Gill', designation: 'Sub-Divisional Officer (SDO)', employeeId: 'PB-MCJ-2023-ENG-014', department: 'Roads & Bridges Division', wardOrDivision: 'Central Zone (Wards 1-10)', district: 'Jalandhar', state: 'Punjab', solvedCount: 142, onTimeSlaPercent: 98.6, satisfactionPercent: 99.2, servicePoints: 4260, badge: 'Chief Engineer Star' },
  { name: 'Er. Kamaljit Sandhu', designation: 'Junior Engineer (JE)', employeeId: 'PB-MCJ-2024-ENG-039', department: 'Sanitation & Solid Waste', wardOrDivision: 'Central Zone (Wards 1-10)', district: 'Jalandhar', state: 'Punjab', solvedCount: 118, onTimeSlaPercent: 97.4, satisfactionPercent: 98.5, servicePoints: 3540, badge: 'Zero-Dispute Champion' },
  { name: 'Er. Rajesh K. Sharma', designation: 'Assistant Engineer (AE)', employeeId: 'PB-MCJ-2022-ENG-022', department: 'Water Supply & Sewerage', wardOrDivision: 'Central Zone (Wards 1-10)', district: 'Jalandhar', state: 'Punjab', solvedCount: 96, onTimeSlaPercent: 95.8, satisfactionPercent: 97.1, servicePoints: 2880, badge: 'Monsoon Vanguard' },
  { name: 'Er. Balwinder Singh', designation: 'Junior Engineer (JE)', employeeId: 'PB-MCJ-2024-ENG-051', department: 'Street Lighting & Electrical', wardOrDivision: 'Central Zone (Wards 1-10)', district: 'Jalandhar', state: 'Punjab', solvedCount: 84, onTimeSlaPercent: 96.2, satisfactionPercent: 98.0, servicePoints: 2520, badge: 'Rapid Responder' },
  { name: 'Er. Jasleen Kaur', designation: 'Junior Engineer (JE)', employeeId: 'PB-MCJ-2025-ENG-078', department: 'Horticulture & Parks', wardOrDivision: 'Central Zone (Wards 1-10)', district: 'Jalandhar', state: 'Punjab', solvedCount: 68, onTimeSlaPercent: 94.1, satisfactionPercent: 96.5, servicePoints: 2040, badge: 'Rapid Responder' },
];

const OFFICER_LEADERBOARD_DISTRICT: Omit<OfficerLeaderboardUser, 'rank'>[] = [
  { name: 'Er. Gurpreet S. Chahal', designation: 'Executive Engineer (XEN)', employeeId: 'PB-MCJ-2020-ENG-005', department: 'Civil Infrastructure Works', wardOrDivision: 'District HQ Directorate', district: 'Jalandhar', state: 'Punjab', solvedCount: 312, onTimeSlaPercent: 99.1, satisfactionPercent: 99.4, servicePoints: 9360, badge: 'State Laureate' },
  { name: 'Er. Manpreet Gill', designation: 'Sub-Divisional Officer (SDO)', employeeId: 'PB-MCJ-2023-ENG-014', department: 'Roads & Bridges Division', wardOrDivision: 'Central Zone', district: 'Jalandhar', state: 'Punjab', solvedCount: 142, onTimeSlaPercent: 98.6, satisfactionPercent: 99.2, servicePoints: 4260, badge: 'Chief Engineer Star' },
  { name: 'Er. Kamaljit Sandhu', designation: 'Junior Engineer (JE)', employeeId: 'PB-MCJ-2024-ENG-039', department: 'Sanitation & Solid Waste', wardOrDivision: 'Central Zone', district: 'Jalandhar', state: 'Punjab', solvedCount: 118, onTimeSlaPercent: 97.4, satisfactionPercent: 98.5, servicePoints: 3540, badge: 'Zero-Dispute Champion' },
  { name: 'Er. Rakesh Babbar', designation: 'Assistant Engineer (AE)', employeeId: 'PB-MCJ-2021-ENG-019', department: 'North Division', wardOrDivision: 'Cantt & Rama Mandi', district: 'Jalandhar', state: 'Punjab', solvedCount: 104, onTimeSlaPercent: 96.8, satisfactionPercent: 97.8, servicePoints: 3120, badge: 'Asphalt Sovereign' },
];

const STATE_OFFICERS_DATA: Record<string, Omit<OfficerLeaderboardUser, 'rank'>[]> = {
  Punjab: [
    { name: 'Er. Harbhajan S. Bhatti', designation: 'Chief Engineer', employeeId: 'PB-LG-2018-ENG-002', department: 'Department of Local Government', wardOrDivision: 'State Directorate', district: 'SAS Nagar (Mohali)', state: 'Punjab', solvedCount: 840, onTimeSlaPercent: 99.4, satisfactionPercent: 99.7, servicePoints: 25200, badge: 'President Laureate' },
    { name: 'Er. Tarlochan Singh', designation: 'Superintending Engineer (SE)', employeeId: 'PB-MCL-2019-ENG-003', department: 'Municipal Corporation Ludhiana', wardOrDivision: 'Zone A', district: 'Ludhiana', state: 'Punjab', solvedCount: 520, onTimeSlaPercent: 98.9, satisfactionPercent: 99.1, servicePoints: 15600, badge: 'State Laureate' },
    { name: 'Er. Gurpreet S. Chahal', designation: 'Executive Engineer (XEN)', employeeId: 'PB-MCJ-2020-ENG-005', department: 'Civil Infrastructure Works', wardOrDivision: 'District HQ Directorate', district: 'Jalandhar', state: 'Punjab', solvedCount: 312, onTimeSlaPercent: 99.1, satisfactionPercent: 99.4, servicePoints: 9360, badge: 'State Laureate' },
    { name: 'Er. Davinder K. Gill', designation: 'Executive Engineer (XEN)', employeeId: 'PB-MCA-2021-ENG-011', department: 'Municipal Corporation Amritsar', wardOrDivision: 'Heritage Zone', district: 'Amritsar', state: 'Punjab', solvedCount: 284, onTimeSlaPercent: 97.8, satisfactionPercent: 98.6, servicePoints: 8520, badge: 'Chief Engineer Star' },
  ],
  Maharashtra: [
    { name: 'Er. Anant Shirodkar', designation: 'Executive Engineer', employeeId: 'IND-MCGM-2017-ENG-008', department: 'Brihanmumbai Municipal Corp (BMC)', wardOrDivision: 'K-West Ward', district: 'Mumbai', state: 'Maharashtra', solvedCount: 1180, onTimeSlaPercent: 99.2, satisfactionPercent: 99.5, servicePoints: 35400, badge: 'National Sovereign' },
    { name: 'Er. Nitin G. Khadse', designation: 'Superintending Engineer', employeeId: 'MH-PMC-2018-ENG-012', department: 'Pune Municipal Corporation', wardOrDivision: 'Shivajinagar Zone', district: 'Pune', state: 'Maharashtra', solvedCount: 690, onTimeSlaPercent: 98.7, satisfactionPercent: 99.0, servicePoints: 20700, badge: 'State Laureate' },
    { name: 'Er. Varsha Patil', designation: 'Executive Engineer', employeeId: 'MH-NMC-2020-ENG-022', department: 'Nagpur Municipal Corporation', wardOrDivision: 'Civil Lines Zone', district: 'Nagpur', state: 'Maharashtra', solvedCount: 410, onTimeSlaPercent: 97.5, satisfactionPercent: 98.2, servicePoints: 12300, badge: 'Chief Engineer Star' },
  ],
  Delhi: [
    { name: 'Er. Sunil K. Sharma', designation: 'Superintending Engineer', employeeId: 'DL-MCD-2016-ENG-004', department: 'Municipal Corporation of Delhi', wardOrDivision: 'Rohini Zone', district: 'North West Delhi', state: 'Delhi', solvedCount: 920, onTimeSlaPercent: 99.0, satisfactionPercent: 99.3, servicePoints: 27600, badge: 'President Laureate' },
    { name: 'Er. Meenakshi Gupta', designation: 'Executive Engineer', employeeId: 'DL-NDMC-2019-ENG-015', department: 'New Delhi Municipal Council', wardOrDivision: 'Central Division', district: 'New Delhi', state: 'Delhi', solvedCount: 580, onTimeSlaPercent: 98.4, satisfactionPercent: 98.9, servicePoints: 17400, badge: 'State Laureate' },
  ],
  Karnataka: [
    { name: 'Er. Raghavendra Rao', designation: 'Chief Engineer (Solid Waste)', employeeId: 'KA-BBMP-2016-ENG-007', department: 'Bruhat Bengaluru Mahanagara Palike', wardOrDivision: 'East Zone', district: 'Bengaluru Urban', state: 'Karnataka', solvedCount: 1040, onTimeSlaPercent: 99.3, satisfactionPercent: 99.6, servicePoints: 31200, badge: 'National Sovereign' },
    { name: 'Er. Shilpa Murthy', designation: 'Executive Engineer (Major Roads)', employeeId: 'KA-BBMP-2019-ENG-019', department: 'BBMP Infrastructure Division', wardOrDivision: 'South Zone', district: 'Bengaluru Urban', state: 'Karnataka', solvedCount: 620, onTimeSlaPercent: 98.2, satisfactionPercent: 98.8, servicePoints: 18600, badge: 'State Laureate' },
  ],
};

function getOfficersForState(stateName: string): Omit<OfficerLeaderboardUser, 'rank'>[] {
  if (STATE_OFFICERS_DATA[stateName]) {
    return STATE_OFFICERS_DATA[stateName];
  }
  return [
    { name: `Er. Chief Engineer (${stateName})`, designation: 'Superintending Engineer (SE)', employeeId: `${stateName.slice(0, 2).toUpperCase()}-PWD-2019-001`, department: 'State Urban Directorate', wardOrDivision: 'Capital Division', district: 'State HQ', state: stateName, solvedCount: 480, onTimeSlaPercent: 98.5, satisfactionPercent: 99.0, servicePoints: 14400, badge: 'State Laureate' },
    { name: `Er. Division Executive (${stateName})`, designation: 'Executive Engineer (XEN)', employeeId: `${stateName.slice(0, 2).toUpperCase()}-MC-2021-014`, department: 'Municipal Works', wardOrDivision: 'Zone 1', district: 'Central District', state: stateName, solvedCount: 290, onTimeSlaPercent: 97.4, satisfactionPercent: 98.3, servicePoints: 8700, badge: 'Chief Engineer Star' },
    { name: `Er. Rapid Responder (${stateName})`, designation: 'Assistant Engineer (AE)', employeeId: `${stateName.slice(0, 2).toUpperCase()}-MC-2023-042`, department: 'Roads & Bridges', wardOrDivision: 'Division A', district: 'District Zone', state: stateName, solvedCount: 160, onTimeSlaPercent: 96.1, satisfactionPercent: 97.5, servicePoints: 4800, badge: 'Asphalt Sovereign' },
  ];
}

const OFFICER_LEADERBOARD_INDIA: Omit<OfficerLeaderboardUser, 'rank'>[] = [
  { name: 'Er. K. S. Ramanathan', designation: 'Chief Municipal Engineer', employeeId: 'IND-MOHUA-2015-ENG-001', department: 'Greater Chennai Corporation', wardOrDivision: 'Zone 9', district: 'Chennai', state: 'Tamil Nadu', solvedCount: 1420, onTimeSlaPercent: 99.6, satisfactionPercent: 99.8, servicePoints: 42600, badge: 'National Sovereign' },
  { name: 'Er. Anant Shirodkar', designation: 'Executive Engineer', employeeId: 'IND-MCGM-2017-ENG-008', department: 'Brihanmumbai Municipal Corp (BMC)', wardOrDivision: 'K-West Ward', district: 'Mumbai', state: 'Maharashtra', solvedCount: 1180, onTimeSlaPercent: 99.2, satisfactionPercent: 99.5, servicePoints: 35400, badge: 'National Sovereign' },
  { name: 'Er. Raghavendra Rao', designation: 'Chief Engineer', employeeId: 'KA-BBMP-2016-ENG-007', department: 'Bruhat Bengaluru Mahanagara Palike', wardOrDivision: 'East Zone', district: 'Bengaluru', state: 'Karnataka', solvedCount: 1040, onTimeSlaPercent: 99.3, satisfactionPercent: 99.6, servicePoints: 31200, badge: 'National Sovereign' },
  { name: 'Er. Sunil K. Sharma', designation: 'Superintending Engineer', employeeId: 'DL-MCD-2016-ENG-004', department: 'Municipal Corporation of Delhi', wardOrDivision: 'Rohini Zone', district: 'North West Delhi', state: 'Delhi', solvedCount: 920, onTimeSlaPercent: 99.0, satisfactionPercent: 99.3, servicePoints: 27600, badge: 'President Laureate' },
  { name: 'Er. Harbhajan S. Bhatti', designation: 'Chief Engineer', employeeId: 'PB-LG-2018-ENG-002', department: 'Department of Local Government', wardOrDivision: 'State Directorate', district: 'SAS Nagar (Mohali)', state: 'Punjab', solvedCount: 840, onTimeSlaPercent: 99.4, satisfactionPercent: 99.7, servicePoints: 25200, badge: 'President Laureate' },
];

export const RewardsPage: React.FC = () => {
  const { user, isOfficer, deductCoins, deductPoints, setUser } = useAuthStore();
  const { addToast } = useToastStore();

  const [searchParams, setSearchParams] = useSearchParams();

  // Top level active tab: Rankings vs Redeem Rewards (sync with ?tab= query parameter)
  const [activeTab, setActiveTab] = useState<'rankings' | 'rewards'>(() => {
    return searchParams.get('tab') === 'rewards' ? 'rewards' : 'rankings';
  });

  // Modal for Civic Economy & Reward Rules
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'rewards' && activeTab !== 'rewards') {
      setActiveTab('rewards');
    } else if (tabParam === 'rankings' && activeTab !== 'rankings') {
      setActiveTab('rankings');
    }
  }, [searchParams]);

  // Sub-navigation for Rankings: Officer vs Ward vs Citizen
  const [rankingType, setRankingType] = useState<'officer' | 'ward' | 'citizen'>('officer');

  // Scope selector for Officer and Citizen leaderboards
  const [rankingScope, setRankingScope] = useState<'local' | 'district' | 'state' | 'india'>('local');

  // Dynamic State Jurisdiction (defaults to user profile state or saved state or Punjab)
  const [selectedState, setSelectedState] = useState<string>(() => {
    if (user?.state) return user.state;
    const saved = localStorage.getItem('civic_user_state');
    if (saved) return saved;
    return 'Punjab';
  });

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    localStorage.setItem('civic_user_state', newState);
    if (user) {
      setUser({ ...user, state: newState });
    }
    addToast({
      type: 'info',
      title: 'Jurisdiction Updated',
      message: `State jurisdiction switched to ${newState}. Rankings updated.`,
    });
  };

  useEffect(() => {
    if (user?.state && user.state !== selectedState) {
      setSelectedState(user.state);
    }
  }, [user?.state]);

  // Municipal Ward Resolution Leaderboard State
  const [wardLeaderboard, setWardLeaderboard] = useState<WardLeaderboardItem[]>([]);
  const [isWardsLoading, setIsWardsLoading] = useState<boolean>(true);
  const [wardSortMetric, setWardSortMetric] = useState<'rate' | 'speed' | 'count'>('rate');

  // Modal State for Rewards Redemption
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<{ id: string; item: RewardItem } | null>(null);

  // Dual Economy: Spendable Coins vs Permanent Reputation Points
  const currentPoints = user?.points ?? 0;
  const currentCoins = user?.coins ?? user?.points ?? 0;
  const currentProblemsResolved = user?.reports_resolved_count ?? 0;

  // Fetch Ward Leaderboard data
  useEffect(() => {
    let isMounted = true;
    const fetchWardLeaderboard = async () => {
      setIsWardsLoading(true);
      try {
        const data = await issuesApi.getLeaderboard();
        if (isMounted) {
          setWardLeaderboard(data);
        }
      } catch (err) {
        console.error('Failed to load ward leaderboard:', err);
      } finally {
        if (isMounted) {
          setIsWardsLoading(false);
        }
      }
    };
    fetchWardLeaderboard();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sorted Ward list
  const sortedWards = useMemo(() => {
    const list = [...wardLeaderboard];
    if (wardSortMetric === 'rate') {
      return list.sort((a, b) => b.resolution_rate_percent - a.resolution_rate_percent);
    }
    if (wardSortMetric === 'speed') {
      return list.sort((a, b) => a.avg_resolution_hours - b.avg_resolution_hours);
    }
    return list.sort((a, b) => b.resolved_reports - a.resolved_reports);
  }, [wardLeaderboard, wardSortMetric]);

  // Dynamic Citizen Leaderboard
  const currentCitizenLeaderboard = useMemo<LeaderboardUser[]>(() => {
    let baseList: Omit<LeaderboardUser, 'rank'>[] = [];
    switch (rankingScope) {
      case 'local':
        baseList = COMMUNITY_LOCAL_CITIZENS.map((c) => ({ ...c }));
        break;
      case 'district':
        baseList = COMMUNITY_DISTRICT_CITIZENS.map((c) => ({ ...c }));
        break;
      case 'state':
        baseList = getCitizensForState(selectedState).map((c) => ({ ...c }));
        break;
      case 'india':
        baseList = COMMUNITY_INDIA_CITIZENS.map((c) => ({ ...c }));
        break;
      default:
        baseList = COMMUNITY_LOCAL_CITIZENS.map((c) => ({ ...c }));
    }

    if (user && user.role !== 'officer') {
      const userEntry: Omit<LeaderboardUser, 'rank'> = {
        name: user.name || 'Verified Citizen',
        phoneMasked: user.phone ? user.phone.slice(0, 4) + '***' + user.phone.slice(-3) : 'Verified',
        points: user.points ?? 0,
        solvedCount: user.reports_resolved_count ?? 0,
        ward: user.jurisdiction_zone || 'Ward 2 - Civil Lines',
        district: user.district || 'Jalandhar',
        state: user.state || selectedState,
        badge: (user.points ?? 0) >= 600 ? 'Elite' : (user.points ?? 0) >= 300 ? 'Veteran' : 'Scout',
        isCurrentUser: true,
      };
      baseList.push(userEntry);
    }

    baseList.sort((a, b) => b.points - a.points);

    return baseList.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));
  }, [rankingScope, user, selectedState]);

  // Dynamic Officer Resolution Leaderboard (Ranked Strictly by Problems Resolved)
  const currentOfficerLeaderboard = useMemo<OfficerLeaderboardUser[]>(() => {
    let baseList: Omit<OfficerLeaderboardUser, 'rank'>[] = [];
    switch (rankingScope) {
      case 'local':
        baseList = OFFICER_LEADERBOARD_LOCAL.map((c) => ({ ...c }));
        break;
      case 'district':
        baseList = OFFICER_LEADERBOARD_DISTRICT.map((c) => ({ ...c }));
        break;
      case 'state':
        baseList = getOfficersForState(selectedState).map((c) => ({ ...c }));
        break;
      case 'india':
        baseList = OFFICER_LEADERBOARD_INDIA.map((c) => ({ ...c }));
        break;
      default:
        baseList = OFFICER_LEADERBOARD_LOCAL.map((c) => ({ ...c }));
    }

    if (user && (user.role === 'officer' || isOfficer)) {
      const officerEntry: Omit<OfficerLeaderboardUser, 'rank'> = {
        name: user.name || 'Field Officer',
        designation: user.designation || 'Assistant Engineer (AE)',
        employeeId: user.employee_id || 'PB-MCJ-2024-ENG-082',
        department: user.department || 'Roads & Infrastructure Division',
        wardOrDivision: user.jurisdiction_zone || 'Central Zone (Ward 2)',
        district: user.district || 'Jalandhar',
        state: user.state || selectedState,
        solvedCount: user.reports_resolved_count ?? 0,
        onTimeSlaPercent: 98.4,
        satisfactionPercent: 99.0,
        servicePoints: user.points ?? 0,
        badge:
          (user.reports_resolved_count ?? 0) >= 100
            ? 'Chief Engineer Star'
            : (user.reports_resolved_count ?? 0) >= 25
            ? 'Asphalt Sovereign'
            : 'Rapid Responder',
        isCurrentUser: true,
      };
      baseList.push(officerEntry);
    }

    baseList.sort((a, b) => {
      if (b.solvedCount !== a.solvedCount) {
        return b.solvedCount - a.solvedCount;
      }
      return b.onTimeSlaPercent - a.onTimeSlaPercent;
    });

    return baseList.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));
  }, [rankingScope, user, isOfficer, selectedState]);

  // Modal Handlers
  const handleOpenRedeemModal = (item: RewardItem) => {
    setSelectedReward(item);
    if (item.sizes && item.sizes.length > 0) {
      setSelectedSize(item.sizes[1] || item.sizes[0]);
    }
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return;
    if (!user) {
      addToast({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in with your mobile OTP to redeem rewards.',
      });
      return;
    }
    const rewardCost = selectedReward.coins;
    if (currentCoins < rewardCost) {
      addToast({
        type: 'error',
        title: 'Insufficient Civic Coins',
        message: `You need ${rewardCost - currentCoins} more coins to claim ${selectedReward.name}. Your civic points (${currentPoints} pts) remain 100% safe!`,
      });
      return;
    }
    setIsRedeeming(true);

    try {
      const res = await authApi.redeemReward({
        item_id: selectedReward.id,
        item_name: selectedReward.name,
        coins_cost: rewardCost,
        size: selectedReward.sizes ? selectedSize : undefined,
      });

      const success = deductCoins(
        rewardCost,
        `Claimed: ${selectedReward.name}${selectedReward.sizes ? ` (Size: ${selectedSize})` : ''}`
      );

      if (success) {
        const orderId = res?.order_id || `RDM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        setOrderConfirmed({
          id: orderId,
          item: selectedReward,
        });
        setSelectedReward(null);
      }
    } catch (err: any) {
      console.error('Redeem failed, falling back to local wallet:', err);
      const success = deductCoins(
        rewardCost,
        `Claimed: ${selectedReward.name}${selectedReward.sizes ? ` (Size: ${selectedSize})` : ''}`
      );
      if (success) {
        const orderId = `RDM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        setOrderConfirmed({
          id: orderId,
          item: selectedReward,
        });
        setSelectedReward(null);
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner: Civic Points & Spendable Coins Overview */}
      <div className="bg-white rounded-xl p-5 sm:p-7 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Civic Rewards &amp; Resolution Rankings
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              Earn <strong>Civic Coins</strong> and <strong>Civic Points</strong> by reporting and verifying municipal issues. Spend coins on official apparel and gear while keeping your civic reputation permanently safe.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>How Points &amp; Coins Work (Rules &amp; Guide)</span>
              </button>
            </div>
          </div>

          {/* Dual Balance / Metrics Pills */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {/* Coins Balance Pill (Spendable Wallet) */}
            <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl flex items-center gap-3 shrink-0 min-w-[170px]">
              <div className="w-11 h-11 rounded-lg bg-amber-200 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-lg shadow-xs">
                <Coins className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <span className="text-[11px] text-amber-900 font-semibold block uppercase tracking-wider">Spendable Coins</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-amber-950 font-mono">
                    {currentCoins}
                  </span>
                  <span className="text-[10px] text-amber-800 font-bold uppercase">COINS</span>
                </div>
                <span className="text-[10px] text-amber-700 block mt-0.5">
                  Wallet for Catalog Rewards
                </span>
              </div>
            </div>

            {/* Points Standing Pill (Permanent Reputation) */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-3 shrink-0 min-w-[170px]">
              <div className="w-11 h-11 rounded-lg bg-slate-200 border border-slate-300 text-slate-800 flex items-center justify-center font-bold text-lg shadow-xs">
                <Trophy className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block uppercase tracking-wider">Civic Points</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {currentPoints}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">PTS</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Level {user?.level || 1} • {currentProblemsResolved} Verified Fixes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation: Rankings vs Redeem Rewards */}
      <div className="flex items-center space-x-6 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('rankings')}
          className={`pb-3 text-sm font-bold transition-colors border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
            activeTab === 'rankings'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Resolution Rankings &amp; Leaderboards</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rewards')}
          className={`pb-3 text-sm font-bold transition-colors border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
            activeTab === 'rewards'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Redeem Rewards ({CITIZEN_REWARDS_CATALOG.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: RESOLUTION RANKINGS (Officer vs Ward vs Citizen)        */}
      {/* ============================================================== */}
      {activeTab === 'rankings' && (
        <div className="space-y-6">
          {/* Category Switcher: Officer vs Ward vs Citizen */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRankingType('officer')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  rankingType === 'officer'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${rankingType === 'officer' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>Officer Rankings</span>
              </button>

              <button
                type="button"
                onClick={() => setRankingType('ward')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  rankingType === 'ward'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Building2 className={`w-4 h-4 ${rankingType === 'ward' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>Ward Rankings</span>
              </button>

              <button
                type="button"
                onClick={() => setRankingType('citizen')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  rankingType === 'citizen'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Users className={`w-4 h-4 ${rankingType === 'citizen' ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>Citizen Rankings</span>
              </button>
            </div>
          </div>

          {/* ========================================================== */}
          {/* VIEW A: MUNICIPAL OFFICERS RESOLUTION RANKINGS             */}
          {/* ========================================================== */}
          {rankingType === 'officer' && (
            <div className="space-y-6">
              {/* Scope Selector: Local Division, District, State, National */}
              <div className="w-full bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                <div className="w-full border-b border-slate-200 flex items-center">
                  <button
                    type="button"
                    onClick={() => setRankingScope('local')}
                    className={`flex-1 py-3 px-1.5 sm:px-3 text-[11px] sm:text-xs font-bold transition-all border-b-2 -mb-px flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                      rankingScope === 'local'
                        ? 'border-slate-900 text-slate-900 bg-slate-50/60'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50/30'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${rankingScope === 'local' ? 'text-rose-600' : 'text-slate-400'}`} />
                    <span className="truncate">Local Division (Central Zone)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRankingScope('district')}
                    className={`flex-1 py-3 px-1.5 sm:px-3 text-[11px] sm:text-xs font-bold transition-all border-b-2 -mb-px flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                      rankingScope === 'district'
                        ? 'border-slate-900 text-slate-900 bg-slate-50/60'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50/30'
                    }`}
                  >
                    <Building className={`w-3.5 h-3.5 shrink-0 ${rankingScope === 'district' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="truncate">City-wide (Jalandhar)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRankingScope('state')}
                    className={`flex-1 py-3 px-1.5 sm:px-3 text-[11px] sm:text-xs font-bold transition-all border-b-2 -mb-px flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                      rankingScope === 'state'
                        ? 'border-slate-900 text-slate-900 bg-slate-50/60'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50/30'
                    }`}
                  >
                    <Flame className={`w-3.5 h-3.5 shrink-0 ${rankingScope === 'state' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className="truncate">State</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRankingScope('india')}
                    className={`flex-1 py-3 px-1.5 sm:px-3 text-[11px] sm:text-xs font-bold transition-all border-b-2 -mb-px flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                      rankingScope === 'india'
                        ? 'border-slate-900 text-slate-900 bg-slate-50/60'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50/30'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 shrink-0 ${rankingScope === 'india' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="truncate">National (India)</span>
                  </button>
                </div>
              </div>

              {/* Scope Header Card */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between flex-wrap gap-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">
                    {rankingScope === 'local' && 'Local Maintenance Division Squad: Central Zone (Ward 2)'}
                    {rankingScope === 'district' && 'District Engineering Directorate: Jalandhar Municipal Corporation'}
                    {rankingScope === 'state' && `${selectedState} Department of Local Government Engineering Registry`}
                    {rankingScope === 'india' && 'National Municipal Works & Engineering Honor Roll'}
                  </span>
                </div>
                {rankingScope === 'state' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Jurisdiction State:</span>
                    <select
                      value={selectedState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="text-xs font-bold bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-xs cursor-pointer"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500 uppercase">
                    Ranked by Problems Resolved
                  </span>
                )}
              </div>

              {/* Podium for Top 3 Resolution Officers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {currentOfficerLeaderboard[1] && (
                  <div className="bg-white rounded-lg p-5 border border-slate-300 flex flex-col items-center text-center shadow-xs order-2 md:order-1 relative">
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 text-slate-700 font-bold flex items-center justify-center text-sm mb-2.5 shadow-xs">
                      #2
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{currentOfficerLeaderboard[1].name}</h3>
                    <span className="text-xs text-slate-500">{currentOfficerLeaderboard[1].designation}</span>
                    <span className="text-[11px] font-mono text-slate-400 mt-0.5">{currentOfficerLeaderboard[1].department}</span>

                    <div className="my-3 px-4 py-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-center">
                      <div className="text-xl font-black font-mono">{currentOfficerLeaderboard[1].solvedCount}</div>
                      <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Problems Resolved</div>
                    </div>

                    <span className="text-[11px] text-slate-600 font-mono">
                      On-Time SLA: <strong>{currentOfficerLeaderboard[1].onTimeSlaPercent}%</strong>
                    </span>
                  </div>
                )}

                {currentOfficerLeaderboard[0] && (
                  <div className="bg-slate-900 text-white rounded-lg p-6 border border-amber-500/50 flex flex-col items-center text-center shadow-md order-1 md:order-2 relative -mt-2">
                    <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider shadow">
                      👑 Top Resolution Officer
                    </div>
                    <div className="w-12 h-12 rounded-full bg-amber-400 border-2 border-amber-300 text-slate-950 font-black flex items-center justify-center text-base mb-2.5 shadow">
                      #1
                    </div>
                    <span className="text-[10px] uppercase font-mono text-amber-300 font-bold tracking-wider">
                      Municipal Lead
                    </span>
                    <h3 className="font-bold text-base text-white mt-1">{currentOfficerLeaderboard[0].name}</h3>
                    <span className="text-xs text-slate-300 mt-0.5">{currentOfficerLeaderboard[0].designation}</span>
                    <span className="text-[11px] font-mono text-slate-400">{currentOfficerLeaderboard[0].department}</span>

                    <div className="my-3 px-5 py-2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-center">
                      <div className="text-2xl font-black font-mono">{currentOfficerLeaderboard[0].solvedCount}</div>
                      <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Verified Problems Resolved</div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                      <span>SLA: <strong className="text-amber-300">{currentOfficerLeaderboard[0].onTimeSlaPercent}%</strong></span>
                      <span>•</span>
                      <span>Satisfaction: <strong className="text-emerald-400">{currentOfficerLeaderboard[0].satisfactionPercent}%</strong></span>
                    </div>
                  </div>
                )}

                {currentOfficerLeaderboard[2] && (
                  <div className="bg-white rounded-lg p-5 border border-slate-300 flex flex-col items-center text-center shadow-xs order-3 relative">
                    <div className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-800 font-bold flex items-center justify-center text-sm mb-2.5 shadow-xs">
                      #3
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{currentOfficerLeaderboard[2].name}</h3>
                    <span className="text-xs text-slate-500">{currentOfficerLeaderboard[2].designation}</span>
                    <span className="text-[11px] font-mono text-slate-400 mt-0.5">{currentOfficerLeaderboard[2].department}</span>

                    <div className="my-3 px-4 py-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-center">
                      <div className="text-xl font-black font-mono">{currentOfficerLeaderboard[2].solvedCount}</div>
                      <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Problems Resolved</div>
                    </div>

                    <span className="text-[11px] text-slate-600 font-mono">
                      On-Time SLA: <strong>{currentOfficerLeaderboard[2].onTimeSlaPercent}%</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Officer Table */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4 w-14">Rank</th>
                        <th className="py-3 px-4">Officer &amp; Designation</th>
                        <th className="py-3 px-4">Division / Zone</th>
                        <th className="py-3 px-4 text-center">Problems Resolved</th>
                        <th className="py-3 px-4 text-center">On-Time SLA %</th>
                        <th className="py-3 px-4 text-right">Service Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentOfficerLeaderboard.map((row) => (
                        <tr
                          key={`${row.employeeId}-${row.rank}`}
                          className={`hover:bg-slate-50 transition ${
                            row.isCurrentUser ? 'bg-emerald-50/70 font-semibold border-l-4 border-emerald-600' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">
                            {row.rank <= 3 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[11px]">
                                #{row.rank}
                              </span>
                            ) : (
                              `#${row.rank}`
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="text-slate-900">{row.name}</div>
                                <div className="text-[11px] font-normal text-slate-500">
                                  {row.designation} • {row.department}
                                </div>
                              </div>
                              {row.isCurrentUser && (
                                <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {row.wardOrDivision}, {row.district}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-black text-emerald-700 text-base">
                            {row.solvedCount}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-700 font-semibold">
                            {row.onTimeSlaPercent}%
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            {row.servicePoints} PTS
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* VIEW B: MUNICIPAL WARD RESOLUTION RANKINGS                 */}
          {/* ========================================================== */}
          {rankingType === 'ward' && (
            <div className="space-y-4">
              {/* Metric Sort Controls */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                      Municipal Ward Resolution Performance Ranking
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Comparing all 5 municipal wards in Jalandhar by grievance resolution velocity and community action.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-md border border-slate-200 text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 px-2">Sort by:</span>
                  <button
                    type="button"
                    onClick={() => setWardSortMetric('rate')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      wardSortMetric === 'rate'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Highest Resolution Rate %
                  </button>
                  <button
                    type="button"
                    onClick={() => setWardSortMetric('speed')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      wardSortMetric === 'speed'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Fastest Fix Speed
                  </button>
                  <button
                    type="button"
                    onClick={() => setWardSortMetric('count')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      wardSortMetric === 'count'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Most Problems Resolved
                  </button>
                </div>
              </div>

              {/* Podiums for Top 3 Wards */}
              {sortedWards.length >= 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* #2 Ward */}
                  <div className="bg-white rounded-lg p-5 border border-slate-300 flex flex-col items-center text-center shadow-xs order-2 md:order-1 relative">
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 text-slate-700 font-bold flex items-center justify-center text-sm mb-2.5 shadow-xs">
                      #2
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{sortedWards[1].ward_name}</h3>
                    <span className="text-xs text-slate-500">{sortedWards[1].zone}</span>

                    <div className="my-3 px-3 py-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <div className="text-lg font-black font-mono">{sortedWards[1].resolution_rate_percent}%</div>
                      <div className="text-[10px] uppercase font-bold text-emerald-700">Resolution Rate</div>
                    </div>

                    <div className="text-[11px] text-slate-600 font-mono space-y-0.5">
                      <div><strong>{sortedWards[1].resolved_reports}</strong> fixes of {sortedWards[1].total_reports} reported</div>
                      <div>Speed: <strong>{sortedWards[1].avg_resolution_hours}h</strong> avg</div>
                    </div>
                  </div>

                  {/* #1 Ward */}
                  <div className="bg-slate-900 text-white rounded-lg p-6 border border-amber-500/50 flex flex-col items-center text-center shadow-md order-1 md:order-2 relative -mt-2">
                    <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider shadow">
                      👑 Top Municipal Ward
                    </div>
                    <div className="w-12 h-12 rounded-full bg-amber-400 border-2 border-amber-300 text-slate-950 font-black flex items-center justify-center text-base mb-2.5 shadow">
                      #1
                    </div>
                    <span className="text-[10px] uppercase font-mono text-amber-300 font-bold tracking-wider">
                      Resolution Leader
                    </span>
                    <h3 className="font-bold text-base text-white mt-1">{sortedWards[0].ward_name}</h3>
                    <span className="text-xs text-slate-300 mt-0.5">{sortedWards[0].zone}</span>

                    <div className="my-3 px-4 py-2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      <div className="text-2xl font-black font-mono">{sortedWards[0].resolution_rate_percent}%</div>
                      <div className="text-[10px] uppercase font-bold text-amber-300">Resolution Rate</div>
                    </div>

                    <div className="text-xs text-slate-300 font-mono space-y-0.5">
                      <div><strong className="text-amber-300">{sortedWards[0].resolved_reports}</strong> verified hazard fixes</div>
                      <div>Speed: <strong className="text-emerald-400">{sortedWards[0].avg_resolution_hours}h</strong> avg response</div>
                    </div>
                  </div>

                  {/* #3 Ward */}
                  <div className="bg-white rounded-lg p-5 border border-slate-300 flex flex-col items-center text-center shadow-xs order-3 relative">
                    <div className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-800 font-bold flex items-center justify-center text-sm mb-2.5 shadow-xs">
                      #3
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{sortedWards[2].ward_name}</h3>
                    <span className="text-xs text-slate-500">{sortedWards[2].zone}</span>

                    <div className="my-3 px-3 py-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <div className="text-lg font-black font-mono">{sortedWards[2].resolution_rate_percent}%</div>
                      <div className="text-[10px] uppercase font-bold text-emerald-700">Resolution Rate</div>
                    </div>

                    <div className="text-[11px] text-slate-600 font-mono space-y-0.5">
                      <div><strong>{sortedWards[2].resolved_reports}</strong> fixes of {sortedWards[2].total_reports} reported</div>
                      <div>Speed: <strong>{sortedWards[2].avg_resolution_hours}h</strong> avg</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ward Table */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4 w-14">Rank</th>
                        <th className="py-3 px-4">Municipal Ward &amp; Zone</th>
                        <th className="py-3 px-4 text-center">Reports Filed</th>
                        <th className="py-3 px-4 text-center">Verified Fixes</th>
                        <th className="py-3 px-4 text-center">Resolution Rate %</th>
                        <th className="py-3 px-4 text-center">Turnaround Speed</th>
                        <th className="py-3 px-4 text-right">Active Community</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedWards.map((ward, idx) => {
                        const isUserHomeWard = ward.ward_id === 'ward_2';
                        return (
                          <tr
                            key={ward.ward_id}
                            className={`hover:bg-slate-50 transition ${
                              isUserHomeWard ? 'bg-amber-50/80 font-semibold border-l-4 border-amber-500' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                              {idx < 3 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[11px]">
                                  #{idx + 1}
                                </span>
                              ) : (
                                `#${idx + 1}`
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="text-slate-900">{ward.ward_name}</div>
                                  <div className="text-[11px] font-normal text-slate-500">{ward.zone}</div>
                                </div>
                                {isUserHomeWard && (
                                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                    Your Ward
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                              {ward.total_reports}
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700">
                              {ward.resolved_reports}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="inline-flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900">
                                  {ward.resolution_rate_percent}%
                                </span>
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 hidden sm:block">
                                  <div
                                    className="h-full bg-emerald-600 rounded-full"
                                    style={{ width: `${ward.resolution_rate_percent}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                              {ward.avg_resolution_hours}h avg
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                              {ward.active_citizens} scouts
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span>Help your ward stay in the Top 3: Report potholes and hazards with live geotagged photos!</span>
                  <Link to="/report" className="font-bold text-slate-900 hover:text-slate-700 underline">
                    Report a Hazard in Your Ward →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* VIEW C: CITIZEN COMMUNITY LEADERBOARD                      */}
          {/* ========================================================== */}
          {rankingType === 'citizen' && (
            <div className="space-y-6">
              {/* Scope Selector: Local Ward, District, State, National */}
              <div className="w-full bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                <div className="w-full border-b border-slate-200 flex items-center">
                  <button
                    type="button"
                    onClick={() => setRankingScope('local')}
                    className={`flex-1 py-3 px-1.5 sm:px-3 text-[11px] sm:text-xs font-bold transition-all border-b-2 -mb-px flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                      rankingScope === 'local'
                        ? 'border-slate-900 text-slate-900 bg-slate-50/60'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50/30'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${rankingScope === 'local' ? 'text-rose-600' : 'text-slate-400'}`} />
                    <span className="truncate">My Ward (Ward 2)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRankingScope('district')}
                    className={`flex-1 py-3 px-1.5 sm:px-3 text-[11px] sm:text-xs font-bold transition-all border-b-2 -mb-px flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                      rankingScope === 'district'
                        ? 'border-slate-900 text-slate-900 bg-slate-50/60'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50/30'
                    }`}
                  >
                    <Building className={`w-3.5 h-3.5 shrink-0 ${rankingScope === 'district' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="truncate">City-wide (Jalandhar)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRankingScope('state')}
                    className={`flex-1 py-3 px-1.5 sm:px-3 text-[11px] sm:text-xs font-bold transition-all border-b-2 -mb-px flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                      rankingScope === 'state'
                        ? 'border-slate-900 text-slate-900 bg-slate-50/60'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50/30'
                    }`}
                  >
                    <Flame className={`w-3.5 h-3.5 shrink-0 ${rankingScope === 'state' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className="truncate">State</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRankingScope('india')}
                    className={`flex-1 py-3 px-1.5 sm:px-3 text-[11px] sm:text-xs font-bold transition-all border-b-2 -mb-px flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                      rankingScope === 'india'
                        ? 'border-slate-900 text-slate-900 bg-slate-50/60'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50/30'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 shrink-0 ${rankingScope === 'india' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="truncate">National (India)</span>
                  </button>
                </div>
              </div>

              {/* Scope Header Card */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between flex-wrap gap-2.5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-700 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">
                    {rankingScope === 'local' && 'Local Ward Standing: Ward 2 - Civil Lines (Community Neighbors)'}
                    {rankingScope === 'district' && 'District Directorate: Jalandhar Civic Community'}
                    {rankingScope === 'state' && `${selectedState} State Civic Contributor Honor Roll`}
                    {rankingScope === 'india' && 'Bharat Civic Champions (National Standing)'}
                  </span>
                </div>
                {rankingScope === 'state' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Jurisdiction State:</span>
                    <select
                      value={selectedState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="text-xs font-bold bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-xs cursor-pointer"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500 uppercase">
                    Ranked by Community Points
                  </span>
                )}
              </div>

              {/* Podium Display (Top 3 Citizens) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {currentCitizenLeaderboard[1] && (
                  <div className="bg-white rounded-lg p-5 border border-slate-300 flex flex-col items-center text-center shadow-xs order-2 md:order-1 relative">
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 text-slate-700 font-bold flex items-center justify-center text-sm mb-2.5 shadow-xs">
                      #2
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{currentCitizenLeaderboard[1].name}</h3>
                    <span className="text-xs text-slate-500 mt-0.5">{currentCitizenLeaderboard[1].ward}, {currentCitizenLeaderboard[1].district}</span>
                    <div className="my-3 px-3 py-1 rounded bg-slate-100 text-slate-800 font-mono text-sm font-bold">
                      {currentCitizenLeaderboard[1].points} PTS
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      {currentCitizenLeaderboard[1].solvedCount} Verified Community Fixes
                    </span>
                  </div>
                )}

                {currentCitizenLeaderboard[0] && (
                  <div className="bg-slate-900 text-white rounded-lg p-6 border border-amber-500/50 flex flex-col items-center text-center shadow-md order-1 md:order-2 relative -mt-2">
                    <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider shadow">
                      👑 Top Civic Contributor
                    </div>
                    <div className="w-12 h-12 rounded-full bg-amber-400 border-2 border-amber-300 text-slate-950 font-black flex items-center justify-center text-base mb-2.5 shadow">
                      #1
                    </div>
                    <span className="text-[10px] uppercase font-mono text-amber-300 font-bold tracking-wider">
                      Division Leader
                    </span>
                    <h3 className="font-bold text-base text-white mt-1">{currentCitizenLeaderboard[0].name}</h3>
                    <span className="text-xs text-slate-400 mt-0.5">{currentCitizenLeaderboard[0].ward}, {currentCitizenLeaderboard[0].district}</span>
                    <div className="my-3 px-4 py-1.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono text-base font-black">
                      {currentCitizenLeaderboard[0].points} PTS
                    </div>
                    <span className="text-xs text-amber-200 font-bold">
                      {currentCitizenLeaderboard[0].solvedCount} Resolved Civic Hazards
                    </span>
                  </div>
                )}

                {currentCitizenLeaderboard[2] && (
                  <div className="bg-white rounded-lg p-5 border border-slate-300 flex flex-col items-center text-center shadow-xs order-3 relative">
                    <div className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-800 font-bold flex items-center justify-center text-sm mb-2.5 shadow-xs">
                      #3
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{currentCitizenLeaderboard[2].name}</h3>
                    <span className="text-xs text-slate-500 mt-0.5">{currentCitizenLeaderboard[2].ward}, {currentCitizenLeaderboard[2].district}</span>
                    <div className="my-3 px-3 py-1 rounded bg-slate-100 text-slate-800 font-mono text-sm font-bold">
                      {currentCitizenLeaderboard[2].points} PTS
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      {currentCitizenLeaderboard[2].solvedCount} Verified Community Fixes
                    </span>
                  </div>
                )}
              </div>

              {/* Citizen Leaderboard Table */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4 w-14">Rank</th>
                        <th className="py-3 px-4">Citizen Contributor</th>
                        <th className="py-3 px-4">Ward &amp; District</th>
                        <th className="py-3 px-4 text-center">Verified Fixes</th>
                        <th className="py-3 px-4 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentCitizenLeaderboard.map((row) => (
                        <tr
                          key={`${row.phoneMasked}-${row.rank}`}
                          className={`hover:bg-slate-50 transition ${
                            row.isCurrentUser ? 'bg-amber-50/80 font-semibold border-l-4 border-amber-500' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">
                            {row.rank <= 3 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[11px]">
                                #{row.rank}
                              </span>
                            ) : (
                              `#${row.rank}`
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="text-slate-900">{row.name}</div>
                                <div className="text-[11px] font-normal text-slate-500 font-mono">
                                  {row.phoneMasked} • {row.badge} Contributor
                                </div>
                              </div>
                              {row.isCurrentUser && (
                                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {row.ward}, {row.district}
                          </td>
                          <td className="py-3 px-4 text-center text-emerald-700 font-bold">
                            {row.solvedCount}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            {row.points} PTS
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!user && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <span>Want to see your civic rank and verified contributions on this leaderboard?</span>
                    <Link to="/login?redirect=/rewards" className="font-bold text-slate-900 underline hover:text-slate-800">
                      Sign In with Mobile OTP →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CITIZEN REWARDS CATALOG                                  */}
      {/* ============================================================== */}
      {activeTab === 'rewards' && (
        <div className="space-y-5">
          {/* Header Info & Rules Link Box - Crisp Municipal Civic Layout */}
          <div className="bg-white border-l-4 border-l-amber-500 border border-slate-300 rounded p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Municipal Citizen Rewards Store
                </h2>
              </div>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                Spend your spendable <strong>Civic Coins</strong> to claim official merchandise, utility passes, and certificates.
                <br className="hidden sm:inline" />
                <span className="text-emerald-700 font-medium"> 🛡️ Rule: Claiming rewards deducts <strong>Coins only</strong> — your permanent Civic Reputation Points and Leaderboard Rank are <strong>100% safe and never reduced</strong>!</span>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(true)}
                className="px-3 py-2 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-semibold text-xs transition-none shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
                <span>Coin &amp; Point Rules</span>
              </button>
              <div className="text-xs bg-slate-900 text-white px-3.5 py-2 rounded font-mono font-bold shadow-xs flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-black">{currentCoins}</span> Coins
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CITIZEN_REWARDS_CATALOG.map((item) => {
              const canAfford = currentCoins >= item.coins;
              const progressPct = Math.min(100, Math.round((currentCoins / item.coins) * 100));

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenRedeemModal(item)}
                  className="bg-white rounded border border-slate-300 hover:border-slate-900 transition-none overflow-hidden flex flex-col h-full shadow-xs cursor-pointer group"
                >
                  <div className="flex flex-col flex-1">
                    <div className="relative h-48 sm:h-52 w-full bg-slate-100 overflow-hidden border-b border-slate-200 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-slate-900/95 text-amber-400 text-xs font-mono font-bold px-2.5 py-1 rounded-md shadow border border-slate-700 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.coins} Coins</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col">
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1" title={item.name}>
                        {item.name}
                      </h3>
                      <div className="text-[11px] font-mono text-slate-500 line-clamp-1">
                        {item.specs}
                      </div>

                      <div className="pt-3 mt-auto">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span>Progress: {currentCoins} / {item.coins} coins</span>
                          <span className="font-bold text-slate-800">{progressPct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full transition-all duration-500 ${
                              canAfford ? 'bg-amber-500' : 'bg-slate-300'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 mt-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRedeemModal(item);
                      }}
                      className={`w-full py-2.5 px-4 rounded-md font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{canAfford ? `Claim for ${item.coins} Coins` : `View Details (${item.coins} Coins)`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* REDEMPTION & REWARD DETAIL MODAL                               */}
      {/* ============================================================== */}
      {selectedReward && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 overflow-y-auto"
          onClick={() => setSelectedReward(null)}
        >
          <div
            className="bg-white rounded border border-slate-300 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Gift className="w-5 h-5 text-slate-700 shrink-0" />
                <h3 className="font-bold text-base text-slate-900 truncate">
                  Reward Details &amp; Redemption
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReward(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-lg font-bold shrink-0 ml-2"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto overflow-x-hidden">
              <div className="relative w-full h-52 sm:h-56 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <img
                  src={selectedReward.image}
                  alt={selectedReward.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-slate-900/95 text-amber-400 text-xs font-mono font-bold px-3 py-1.5 rounded-md shadow border border-slate-700 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{selectedReward.coins} Coins</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-slate-900 leading-snug">
                  {selectedReward.name}
                </h4>
                {selectedReward.specs && (
                  <div className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-mono text-slate-600">
                    {selectedReward.specs}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Description
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedReward.description}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Reward Cost:</span>
                  <span className="font-mono font-bold text-amber-700 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    <span>{selectedReward.coins} Civic Coins</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Your Spendable Wallet:</span>
                  <span className="font-mono font-bold text-slate-900">{currentCoins} Coins</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Permanent Reputation:</span>
                  <span className="font-mono font-medium text-slate-700">{currentPoints} Points (Level {user?.level || 1})</span>
                </div>

                <div className="pt-2 border-t border-slate-200/80">
                  {user ? (
                    currentCoins >= selectedReward.coins ? (
                      <div className="space-y-1.5">
                        <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span>Sufficient Coins! Balance after redemption: {currentCoins - selectedReward.coins} Coins</span>
                        </div>
                        <p className="text-[11px] text-slate-500 bg-emerald-50/60 p-2 rounded border border-emerald-200/60 leading-normal">
                          🛡️ <strong>Reputation Protection Guarantee:</strong> Only <strong>{selectedReward.coins} Coins</strong> will be deducted. Your Civic Reputation Points ({currentPoints} pts) will remain 100% intact!
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-700 font-medium">
                        You need <strong>{selectedReward.coins - currentCoins} more coins</strong> to redeem this item. Earn coins by submitting verified reports or verifying fixes. Your points ({currentPoints} pts) remain safe.
                      </div>
                    )
                  ) : (
                    <div className="text-xs text-blue-700 flex items-center justify-between gap-2">
                      <span>Please sign in to view your coins balance and claim rewards.</span>
                      <Link to="/login" className="font-bold underline text-blue-900 hover:text-blue-950">
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {selectedReward.sizes && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Select Size:</label>
                  <div className="flex items-center gap-2">
                    {selectedReward.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold border transition ${
                          selectedSize === s
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedReward(null)}
                className="px-4 py-2 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition"
              >
                Close
              </button>
              {user && currentCoins >= selectedReward.coins ? (
                <button
                  type="button"
                  disabled={isRedeeming}
                  onClick={handleConfirmRedeem}
                  className="px-5 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isRedeeming ? 'Deducting Coins...' : `Confirm & Deduct ${selectedReward.coins} Coins`}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-5 py-2 rounded-md bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs cursor-not-allowed flex items-center gap-1.5"
                >
                  <Coins className="w-4 h-4" />
                  <span>{!user ? 'Sign In Required' : `Need ${selectedReward.coins - currentCoins} More Coins`}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ORDER CONFIRMATION RECEIPT MODAL                                */}
      {/* ============================================================== */}
      {orderConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
          <div className="bg-white rounded border border-slate-300 p-6 max-w-md w-full shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-300">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <h3 className="font-bold text-lg text-slate-900">
              Merchandise Order Dispatched!
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your coins have been safely redeemed. Your official civic merchandise is being processed by the Municipal Corporation Logistics Cell.
            </p>

            <div className="p-3.5 bg-slate-50 rounded border border-slate-300 text-left text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-bold text-slate-900">{orderConfirmed.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Item:</span>
                <span className="font-bold text-slate-900">{orderConfirmed.item.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Coins Deducted:</span>
                <span className="font-bold text-red-600">-{orderConfirmed.item.coins} Coins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Civic Reputation Points:</span>
                <span className="font-bold text-emerald-600">0 PTS Deducted (Intact)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-700">Authenticated • Processing</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOrderConfirmed(null)}
              className="w-full py-2.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
            >
              Done &amp; Return to Catalog
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CIVIC ECONOMY & REWARD RULES MODAL                             */}
      {/* ============================================================== */}
      {isRulesModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 overflow-y-auto"
          onClick={() => setIsRulesModalOpen(false)}
        >
          <div
            className="bg-white rounded border border-slate-300 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Award className="w-5 h-5 text-amber-600 shrink-0" />
                <h3 className="font-bold text-base text-slate-900">
                  Civic Economy &amp; Reward System Rules
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-lg font-bold shrink-0 ml-2"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto text-xs text-slate-700 leading-relaxed">
              {/* Core Philosophy Banner */}
              <div className="bg-slate-50 border-l-4 border-l-amber-500 border border-slate-300 rounded p-4 space-y-2">
                <h4 className="font-bold text-slate-950 text-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>The Dual Currency Architecture</span>
                </h4>
                <p className="text-slate-800 text-xs leading-relaxed">
                  Civic Connect separates your <strong>citizen standing</strong> from your <strong>spendable wallet balance</strong>. You never lose your civic level or municipal leaderboard standing when purchasing rewards!
                </p>
              </div>

              {/* Coins vs Points Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Civic Coins Card */}
                <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">🪙 Civic Coins (Spendable)</h5>
                      <span className="text-[11px] text-amber-700 font-medium">Your Municipal Wallet</span>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
                    <li>Earned alongside points for active community contributions.</li>
                    <li><strong>Redeemable:</strong> Spent in the catalog for apparel, bottles, certificates, and fast-track passes.</li>
                    <li><strong>Deduction:</strong> Deducted upon claiming items in the shop.</li>
                    <li><strong>Penalty:</strong> Deducted (-50 coins) if a report is marked as fake.</li>
                  </ul>
                </div>

                {/* Civic Points Card */}
                <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">⚡ Civic Points (Reputation)</h5>
                      <span className="text-[11px] text-blue-700 font-medium">Your Citizen Honor &amp; Rank</span>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
                    <li>Measures lifetime contribution, citizen level, and badges.</li>
                    <li>Determines your rank on Ward, District, and State Leaderboards.</li>
                    <li><strong>100% Protected:</strong> Points are NEVER deducted when buying rewards.</li>
                    <li><strong>Deduction Rule:</strong> Points decrease ONLY if a submitted report is investigated and verified as fake or fraudulent.</li>
                  </ul>
                </div>
              </div>

              {/* Earning & Penalty Matrix Table */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Action &amp; Reward Matrix
                </h5>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                        <th className="py-2.5 px-3">Civic Action</th>
                        <th className="py-2.5 px-3 text-emerald-700">⚡ Points Awarded</th>
                        <th className="py-2.5 px-3 text-amber-700">🪙 Coins Awarded</th>
                        <th className="py-2.5 px-3 text-slate-600">Impact on Standing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900">Submit Verified Civic Report</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-700">+10 PTS</td>
                        <td className="py-2 px-3 font-mono font-bold text-amber-700">+10 Coins</td>
                        <td className="py-2 px-3 text-slate-500">Increases rank &amp; level</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900">Confirm Resolution on Site ("Yes, Fixed")</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-700">+20 PTS</td>
                        <td className="py-2 px-3 font-mono font-bold text-amber-700">+20 Coins</td>
                        <td className="py-2 px-3 text-slate-500">Helps close ticket with bonus</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900">Add Corroborating Evidence / Note</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-700">+5 PTS</td>
                        <td className="py-2 px-3 font-mono font-bold text-amber-700">+5 Coins</td>
                        <td className="py-2 px-3 text-slate-500">Helps officers locate hazard</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900">Upvote Existing Community Report</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-700">+2 PTS</td>
                        <td className="py-2 px-3 font-mono font-bold text-amber-700">+2 Coins</td>
                        <td className="py-2 px-3 text-slate-500">Raises priority for dispatch</td>
                      </tr>
                      <tr className="bg-amber-50/40">
                        <td className="py-2 px-3 font-medium text-slate-900">Redeem Merchandise / Pass / Reward</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-700">0 PTS (Intact!)</td>
                        <td className="py-2 px-3 font-mono font-bold text-red-600">-Item Cost Coins</td>
                        <td className="py-2 px-3 text-emerald-700 font-medium">Rank &amp; level preserved 100%</td>
                      </tr>
                      <tr className="bg-red-50/50">
                        <td className="py-2 px-3 font-medium text-red-900 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>Fake / Fraudulent Report Penalty</span>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-red-700">-50 PTS Penalty</td>
                        <td className="py-2 px-3 font-mono font-bold text-red-700">-50 Coins Penalty</td>
                        <td className="py-2 px-3 text-red-700">Demotes civic standing &amp; badge</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Anti-Fraud Notice */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Municipal Integrity Protection</span>
                </div>
                <p>
                  Each submitted report is geofenced with EXIF timestamp and validated by Municipal Field Engineers. False alarms, prank reports, or duplicate spam automatically trigger a <strong>-50 Point and -50 Coin penalty</strong> to ensure civic accountability.
                </p>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                className="px-5 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                I Understand the Rules
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
