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

