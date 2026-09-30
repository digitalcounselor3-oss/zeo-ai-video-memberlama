import React from 'react';
import { Clock, Layers } from 'lucide-react';
import { VideoDuration, SceneCount } from '../types';

interface DurationAndSceneSelectorProps {
  duration: VideoDuration;
  onChangeDuration: (d: VideoDuration) => void;
  sceneCount: SceneCount;
  onChangeSceneCount: (s: SceneCount) => void;
}

const DURATIONS: VideoDuration[] = ['10 detik', '15 detik', '20 detik', '30 detik'];
const SCENE_OPTIONS: SceneCount[] = ['1 Scene', '2 Scene', '3 Scene', 'Otomatis'];

export const DurationAndSceneSelector: React.FC<DurationAndSceneSelectorProps> = ({
  duration,
  onChangeDuration,
  sceneCount,
  onChangeSceneCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 3. Durasi Video */}
      <section id="duration-selection-section" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Durasi Video</span>
          </h2>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            {duration}
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Sesuaikan panjang video untuk retensi audiens di feed.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DURATIONS.map((dur) => {
            const isSelected = duration === dur;
            return (
              <button
                key={dur}
                id={`duration-btn-${dur.replace(/\s+/g, '-').toLowerCase()}`}
                type="button"
                onClick={() => onChangeDuration(dur)}
                className={`py-2.5 px-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all border text-center flex items-center justify-center ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-100/80'
                }`}
              >
                {dur}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Jumlah Scene */}
      <section id="scene-selection-section" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Jumlah Scene</span>
          </h2>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            {sceneCount}
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Pembagian potongan sudut pandang & transisi dalam video.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SCENE_OPTIONS.map((scene) => {
            const isSelected = sceneCount === scene;
            return (
              <button
                key={scene}
                id={`scene-btn-${scene.replace(/\s+/g, '-').toLowerCase()}`}
                type="button"
                onClick={() => onChangeSceneCount(scene)}
                className={`py-2.5 px-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all border text-center flex items-center justify-center ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-100/80'
                }`}
              >
                {scene}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
