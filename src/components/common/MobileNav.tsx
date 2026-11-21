import React, { useState, useEffect } from 'react';
import {
  Home,
  Lightbulb,
  Wind,
  Leaf,
  Bot,
  Settings,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavPage } from '../../types';

export const MobileNav: React.FC = () => {
  const { activePage, setActivePage } = useApp();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  useEffect(() => {
    if (!moreMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moreMenuOpen]);

  const mainItems: {
    id: NavPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tips', label: 'Tips', icon: Lightbulb },
    { id: 'indoor', label: 'Indoor', icon: Wind },
  ];

  const moreItems: {
    id: NavPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'sustainability', label: 'Sustainability', icon: Leaf },
    { id: 'guide', label: 'Air Guide AI', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* More Menu Drawer */}
      {moreMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="More Sections"
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col justify-end md:hidden animate-fade-in"
        >
          <div className="bg-white dark:bg-[#182228] rounded-t-2xl p-5 border-t border-brand-border dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-brand-border dark:border-slate-800">
              <span className="font-heading font-bold text-[16px] text-brand-text dark:text-white">
                More Sections
              </span>
              <button
                type="button"
                onClick={() => setMoreMenuOpen(false)}
                aria-label="Close more navigation menu"
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 focus-visible:outline-none"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActivePage(item.id);
                      setMoreMenuOpen(false);
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-2.5 p-3 rounded-btn text-left text-[14px] font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-teal-light text-brand-teal font-semibold'
                        : 'text-brand-text dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-brand-teal" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#182228]/95 backdrop-blur-md border-t border-brand-border dark:border-[#28353E] py-2 px-3 flex items-center justify-around z-40 md:hidden shadow-lg"
      >
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePage(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
                isActive
                  ? 'text-brand-teal dark:text-emerald-400 font-semibold'
                  : 'text-brand-text-secondary dark:text-slate-400 hover:text-brand-text'
              }`}
            >
              <Icon
                aria-hidden="true"
                className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`}
              />
              <span className="text-[11px] mt-0.5">{item.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          type="button"
          onClick={() => setMoreMenuOpen(!moreMenuOpen)}
          aria-expanded={moreMenuOpen}
          aria-haspopup="dialog"
          aria-label="More sections"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            moreItems.some((i) => i.id === activePage)
              ? 'text-brand-teal dark:text-emerald-400 font-semibold'
              : 'text-brand-text-secondary dark:text-slate-400 hover:text-brand-text'
          }`}
        >
          <MoreHorizontal aria-hidden="true" className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[11px] mt-0.5">More</span>
        </button>
      </nav>
    </>
  );
};
