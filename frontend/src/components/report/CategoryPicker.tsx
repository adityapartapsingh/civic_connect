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
        <label className="text-sm font-semibold text-slate-800">
          Issue Category <span className="text-red-500">*</span>
        </label>
        <span className="text-xs text-slate-500">Auto-routes to department</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComponent = iconMap[cat.icon] || HelpCircle;

          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`relative flex flex-col items-start p-3.5 rounded-lg border text-left transition-colors ${
                isSelected
                  ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                  : 'border-slate-300 hover:border-slate-400 bg-white'
              }`}
            >
              {/* Checkmark badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              <div
                className={`p-2 rounded mb-2 transition-colors ${
                  isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </div>

              <div className="font-semibold text-sm text-slate-900">
                {cat.label}
              </div>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{cat.slaDefaultHours}h SLA</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
