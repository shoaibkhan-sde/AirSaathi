import React from 'react';
import { Home, Lightbulb, Wind, Leaf, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavPage } from '../../types';

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage } = useApp();

  const navItems: {
    id: NavPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tips', label: 'Smart Tips', icon: Lightbulb },
    { id: 'indoor', label: 'Indoor Air', icon: Wind },
    { id: 'sustainability', label: 'Sustainability', icon: Leaf },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-[216px] lg:w-[228px] shrink-0 bg-white dark:bg-[#182228] border border-brand-border/80 dark:border-[#28353E] rounded-2xl md:rounded-[22px] flex flex-col justify-between h-full select-none transition-all duration-200 shadow-[0_2px_14px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* Top Section with Inset Padding (Branding + Navigation) */}
      <div className="pt-5 px-3.5 flex flex-col">
        {/* Brand Header using supplied exact leaf mark and razor-sharp native typography */}
        <button
          type="button"
          onClick={() => setActivePage('home')}
          aria-label="AirSaathi Home"
          className="w-full text-left px-2 py-1 mb-6 cursor-pointer group flex items-center gap-2.5 rounded-lg focus-visible:outline-none"
        >
          {/* Locked, non-draggable leaf logo */}
          <div className="w-9 h-9 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
            <img
              src="/assets/airsaathi/airsaathi-leaf-icon.png"
              alt=""
              role="presentation"
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
              className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-xs"
            />
          </div>

          {/* Native typography - razor-sharp at any resolution */}
          <div className="flex flex-col">
            <span className="font-sans font-bold text-[21px] md:text-[22px] text-[#0E4D48] dark:text-emerald-400 tracking-tight leading-none">
              AirSaathi
            </span>
            <span className="text-[11px] md:text-[11.5px] font-medium text-[#17242B] dark:text-slate-300 opacity-80 mt-1 leading-tight tracking-tight">
              Breathe Better. Live Healthier.
            </span>
          </div>
        </button>

        {/* Navigation List */}
        <nav aria-label="Main Navigation" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePage(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-btn text-[13px] font-medium transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-brand-teal-light text-brand-teal dark:bg-brand-teal-dark/60 dark:text-emerald-300 font-semibold'
                    : 'text-brand-text-secondary dark:text-slate-400 hover:text-brand-text dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`w-4 h-4 ${isActive ? 'text-brand-teal dark:text-emerald-400 stroke-[2.2]' : 'text-slate-400 dark:text-slate-500 stroke-[1.8]'}`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Scenic Park Illustration:
          - Sits directly flush against the left, right, and bottom edges of the outer panel (no inner padding/margin)
          - Locked & non-draggable
          - Clean spacing above it separating from navigation items */}
      <div className="mt-auto w-full block select-none overflow-hidden">
        <img
          src="/assets/airsaathi/airsaathi-sidebar-park-full.webp"
          alt=""
          role="presentation"
          loading="lazy"
          decoding="async"
          width="220"
          height="140"
          draggable="false"
          onDragStart={(e) => e.preventDefault()}
          className="w-full h-32 lg:h-36 object-cover object-bottom block select-none pointer-events-none border-t border-brand-border/40 dark:border-slate-800"
        />
      </div>
    </aside>
  );
};
