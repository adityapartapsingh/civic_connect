import React from 'react';
import { IssueCategory } from '../../types';
import { CATEGORIES } from '../../utils/constants';
import {
  AlertTriangle,
  Trash2,
  Lightbulb,
  Droplets,
  Waves,
  Activity,
  TreePine,
  Footprints,
  HelpCircle,
  Clock,
  Check,
} from 'lucide-react';

interface CategoryPickerProps {
  selectedCategory: IssueCategory | null;
  onSelect: (category: IssueCategory) => void;
}

const iconMap: Record<string, React.ElementType> = {
  AlertTriangle,
  Trash2,
  Lightbulb,
  Droplets,
  Waves,
  Activity,
  TreePine,
  Footprints,
  HelpCircle,
};

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  selectedCategory,
  onSelect,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-800">
          Select Issue Category <span className="text-red-500">*</span>
        </label>
        <span className="text-xs text-slate-500 font-medium">Auto-assigns SLA & Ward team</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComponent = iconMap[cat.icon] || HelpCircle;

          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`relative flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all duration-200 group ${
                isSelected
                  ? 'border-brand-600 bg-brand-50/70 shadow-sm ring-2 ring-brand-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80'
              }`}
            >
              {/* Checkmark badge */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              <div
                className={`p-2.5 rounded-xl mb-2 transition-colors ${
                  isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                }`}
                style={{ color: isSelected ? '#ffffff' : cat.color }}
              >
                <IconComponent className="w-5 h-5" />
              </div>

              <div className="font-bold text-xs text-slate-900 group-hover:text-brand-700 transition-colors">
                {cat.label}
              </div>

              <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{cat.slaDefaultHours}h SLA</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
