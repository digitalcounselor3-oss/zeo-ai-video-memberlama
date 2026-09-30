import React from 'react';
import {
  Film,
  Video,
  Mic,
  Smile,
  UserCheck,
  BookOpen,
  Landmark,
  HelpCircle,
  Heart,
  History,
  Hourglass,
  Globe,
  Volume2,
  Utensils,
  Layers,
  Music,
  School,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { CreativeVideoTypeMeta } from '../../creativeTypes';

interface CreativeTypeCardProps {
  item: CreativeVideoTypeMeta;
  onSelect: (item: CreativeVideoTypeMeta) => void;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  film: Film,
  video: Video,
  mic: Mic,
  smile: Smile,
  'user-check': UserCheck,
  'book-open': BookOpen,
  landmark: Landmark,
  'help-circle': HelpCircle,
  heart: Heart,
  history: History,
  hourglass: Hourglass,
  globe: Globe,
  'volume-2': Volume2,
  utensils: Utensils,
  layers: Layers,
  music: Music,
  school: School,
  compass: Compass,
};

export const CreativeTypeCard: React.FC<CreativeTypeCardProps> = ({ item, onSelect }) => {
  const IconComponent = iconMap[item.iconType] || Film;

  return (
    <div
      id={`card-creative-${item.id}`}
      onClick={() => onSelect(item)}
      className="group relative bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-violet-500 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.98]"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
          >
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200/80">
              {item.badge}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {item.category}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors flex items-center gap-1.5">
            <span>{item.title}</span>
          </h3>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-2">
            {item.desc}
          </p>
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-violet-600 group-hover:text-violet-700">
        <span className="group-hover:underline">Pilih Jenis Ini</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
