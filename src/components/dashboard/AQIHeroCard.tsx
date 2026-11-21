import React from 'react';
import { Check, Info, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getAQIBadgeConfig, getHeroDisplayLocation } from './heroConfig';

export const AQIHeroCard: React.FC = () => {
  const { currentCity, userProfile, uiStateMode } = useApp();

  if (uiStateMode === 'loading') {
    return (
      <div className="w-full bg-white dark:bg-[#182228] border border-brand-border dark:border-slate-800 rounded-2xl p-6 animate-pulse min-h-[235px]">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="flex gap-4">
          <div className="w-13 h-13 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const aqi = currentCity.aqi;
  const category = currentCity.category;
  const { badgeColor, badgeBg, badgeBorder, adviceText } = getAQIBadgeConfig(aqi);

  const pm25Value =
    currentCity.pm2_5 !== undefined && currentCity.pm2_5 !== null
      ? `${currentCity.pm2_5} µg/m³`
      : currentCity.pollutants?.find((p) => p.code === 'PM2.5')?.value
        ? `${currentCity.pollutants.find((p) => p.code === 'PM2.5')?.value} µg/m³`
        : 'Unavailable';

  const pm10Value =
    currentCity.pm10 !== undefined && currentCity.pm10 !== null
      ? `${currentCity.pm10} µg/m³`
      : currentCity.pollutants?.find((p) => p.code === 'PM10')?.value
        ? `${currentCity.pollutants.find((p) => p.code === 'PM10')?.value} µg/m³`
        : 'Unavailable';

  const displayLocationTitle = getHeroDisplayLocation(currentCity, userProfile);

  return (
    <section
      aria-label={`Current air quality for ${displayLocationTitle}`}
      className="w-full min-h-[175px] sm:min-h-[220px] md:aspect-[1024/341] md:max-h-[310px] rounded-2xl md:rounded-[20px] overflow-hidden border border-brand-border/70 dark:border-[#28353E] shadow-subtle relative transition-all group shrink-0 select-none"
    >
      {/* Full City Skyline Image */}
      <img
        src="/assets/airsaathi/airsaathi-city-skyline-hero.webp"
        alt=""
        role="presentation"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        draggable="false"
        onDragStart={(e) => e.preventDefault()}
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
      />

      {/* Left-side readability gradient wash */}
      <div
        className="absolute inset-0 pointer-events-none dark:hidden"
        style={{
          background:
            'linear-gradient(90deg, rgba(246,249,251,0.96) 0%, rgba(246,249,251,0.92) 55%, rgba(246,249,251,0.65) 80%, rgba(246,249,251,0.15) 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          background:
            'linear-gradient(90deg, rgba(15,23,27,0.96) 0%, rgba(15,23,27,0.92) 55%, rgba(15,23,27,0.70) 80%, rgba(15,23,27,0.20) 100%)',
        }}
      />

      {/* Card Content Overlay */}
      <div className="relative z-10 h-full p-3.5 sm:p-5 md:p-6 flex flex-col justify-between">
        <div className="sr-only">
          {displayLocationTitle}: Air quality is {category} with an AQI of {aqi}. Fine particulate PM2.5 is {pm25Value}, coarse particulate PM10 is {pm10Value}. Health advice: {adviceText}.
        </div>

        {/* Top Header: Location + US AQI Standard Label */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-heading font-extrabold text-[14px] sm:text-[15px] md:text-[17px] text-[#113832] dark:text-white tracking-tight">
              {displayLocationTitle}
            </span>
            <span className="text-slate-400 dark:text-slate-400 font-bold">•</span>
            <span className="text-[11px] sm:text-[12px] font-semibold text-[#087C73] dark:text-emerald-300">
              <span className="hidden sm:inline">US AQI — </span>Open-Meteo estimate
            </span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
            <Info aria-hidden="true" className="w-3 h-3 text-[#087C73]" />
            <span>Modelled data (~45 km grid)</span>
          </div>
        </div>

        {/* Middle: Severity icon + Category & AQI Value + Pollutants */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 my-auto">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundColor: badgeColor }}
          >
            {aqi > 200 ? (
              <ShieldAlert aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white stroke-[2.5]" />
            ) : aqi > 100 ? (
              <AlertTriangle aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white stroke-[2.5]" />
            ) : (
              <Check aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white stroke-[3.5]" />
            )}
          </div>

          <div className="flex flex-col justify-center">
            <span className="font-sans font-bold text-[17px] sm:text-[19px] md:text-[23px] text-brand-text dark:text-white leading-none tracking-tight">
              {category}
            </span>
            <span className="font-sans font-extrabold text-[15px] sm:text-[16px] md:text-[18px] text-brand-text dark:text-white mt-1 leading-none tracking-tight">
              AQI {aqi}
            </span>
          </div>

          {/* Real Pollutant Indicators with 100% visible high-contrast vertical divider pipe */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l-2 border-[#087C73] dark:border-emerald-400">
            <div className="bg-white/90 dark:bg-slate-900/90 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-slate-200/80 dark:border-slate-800 text-left shadow-xs">
              <span className="block text-[9.5px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                PM2.5
              </span>
              <span className="font-bold text-[11.5px] sm:text-[13px] text-slate-800 dark:text-white">
                {pm25Value}
              </span>
            </div>
            <div className="bg-white/90 dark:bg-slate-900/90 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-slate-200/80 dark:border-slate-800 text-left shadow-xs">
              <span className="block text-[9.5px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                PM10
              </span>
              <span className="font-bold text-[11.5px] sm:text-[13px] text-slate-800 dark:text-white">
                {pm10Value}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Contextual Recommendation Pill & Spatial Disclosure */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div
            className="inline-flex items-center px-3 py-1 sm:px-3.5 sm:py-1 rounded-full border text-[11px] sm:text-[11.5px] md:text-[12.5px] font-medium text-brand-text shadow-xs self-start"
            style={{
              backgroundColor: badgeBg,
              borderColor: badgeBorder,
            }}
          >
            <span>{adviceText}</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-2 sm:gap-2.5 px-3 py-1 rounded-xl sm:rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-white/80 dark:border-slate-700/80 shadow-xs text-[11px] font-bold text-[#0A4D45] dark:text-emerald-300 flex-wrap">
            <span>Global CAMS Atmospheric Model • Not a direct street sensor</span>
            {currentCity.attribution && (
              <span className="hidden md:inline border-l-2 border-[#087C73] dark:border-emerald-400 pl-2 text-[#0A4D45] dark:text-emerald-300 font-medium">
                {currentCity.attribution}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
