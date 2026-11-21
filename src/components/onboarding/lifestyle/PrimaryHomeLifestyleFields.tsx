import React from 'react';
import { Bus, Home, Flame, Zap, ChevronDown } from 'lucide-react';
import type { CommuteMode, HomeType, CookingFuel, HeatingFuel } from '../../../types';

interface PrimaryHomeLifestyleFieldsProps {
  commuteMode: CommuteMode | '';
  onCommuteChange: (val: CommuteMode) => void;
  homeType: HomeType | '';
  onHomeTypeChange: (val: HomeType) => void;
  cookingFuel: CookingFuel | '';
  onCookingFuelChange: (val: CookingFuel) => void;
  heatingFuel: HeatingFuel | '';
  onHeatingFuelChange: (val: HeatingFuel) => void;
}

export const PrimaryHomeLifestyleFields: React.FC<PrimaryHomeLifestyleFieldsProps> = ({
  commuteMode,
  onCommuteChange,
  homeType,
  onHomeTypeChange,
  cookingFuel,
  onCookingFuelChange,
  heatingFuel,
  onHeatingFuelChange,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-5">
      {/* 1. Main Commute */}
      <div>
        <div className="flex items-start gap-2.5 mb-2 sm:mb-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E4F5EE] dark:bg-[#1C382D] text-[#087C73] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Bus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-[14px] sm:text-[15px] text-[#143B35] dark:text-white leading-tight">
              Main commute
            </h3>
            <p className="text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400">
              How do you usually travel?
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600 dark:text-sky-400">
            <Bus className="w-4 h-4" />
          </div>
          <select
            id="lifestyle-commute"
            aria-label="Main commute"
            value={commuteMode}
            onChange={(e) => onCommuteChange(e.target.value as CommuteMode)}
            className="w-full pl-10 pr-9 py-3 sm:py-3.5 rounded-xl border border-[#D0E7DE] dark:border-slate-700 bg-white dark:bg-[#1C2C28] text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#087C73]/30 appearance-none cursor-pointer"
          >
            <option value="">Select your commute</option>
            <option value="Walking">Walking</option>
            <option value="Bicycle">Bicycle</option>
            <option value="Bus">Bus</option>
            <option value="Metro or train">Metro or train</option>
            <option value="Car">Car</option>
            <option value="Motorcycle or scooter">Motorcycle or scooter</option>
            <option value="Work from home">Work from home</option>
            <option value="Other">Other</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. Home Type */}
      <div>
        <div className="flex items-start gap-2.5 mb-2 sm:mb-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E4F5EE] dark:bg-[#1C382D] text-[#087C73] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Home className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-[14px] sm:text-[15px] text-[#143B35] dark:text-white leading-tight">
              Home type
            </h3>
            <p className="text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400">
              What type of home do you live in?
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
            <Home className="w-4 h-4" />
          </div>
          <select
            id="lifestyle-hometype"
            aria-label="Home type"
            value={homeType}
            onChange={(e) => onHomeTypeChange(e.target.value as HomeType)}
            className="w-full pl-10 pr-9 py-3 sm:py-3.5 rounded-xl border border-[#D0E7DE] dark:border-slate-700 bg-white dark:bg-[#1C2C28] text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#087C73]/30 appearance-none cursor-pointer"
          >
            <option value="">Select home type</option>
            <option value="Apartment">Apartment</option>
            <option value="Independent house">Independent house</option>
            <option value="Shared accommodation">Shared accommodation</option>
            <option value="Other">Other</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Cooking Fuel */}
      <div>
        <div className="flex items-start gap-2.5 mb-2 sm:mb-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E4F5EE] dark:bg-[#1C382D] text-[#087C73] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-[14px] sm:text-[15px] text-[#143B35] dark:text-white leading-tight">
              Cooking fuel
            </h3>
            <p className="text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400">
              What do you use for cooking?
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-500 dark:text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <select
            id="lifestyle-cookingfuel"
            aria-label="Cooking fuel"
            value={cookingFuel}
            onChange={(e) => onCookingFuelChange(e.target.value as CookingFuel)}
            className="w-full pl-10 pr-9 py-3 sm:py-3.5 rounded-xl border border-[#D0E7DE] dark:border-slate-700 bg-white dark:bg-[#1C2C28] text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#087C73]/30 appearance-none cursor-pointer"
          >
            <option value="">Select cooking fuel</option>
            <option value="LPG or piped gas">LPG or piped gas</option>
            <option value="Electricity / induction">Electricity / induction</option>
            <option value="Biomass / wood">Biomass / wood</option>
            <option value="Kerosene">Kerosene</option>
            <option value="Other">Other</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 4. Heating Fuel */}
      <div>
        <div className="flex items-start gap-2.5 mb-2 sm:mb-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E4F5EE] dark:bg-[#1C382D] text-[#087C73] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-[14px] sm:text-[15px] text-[#143B35] dark:text-white leading-tight">
              Heating fuel
            </h3>
            <p className="text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400">
              What do you use for heating?
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-500 dark:text-sky-400">
            <Zap className="w-4 h-4" />
          </div>
          <select
            id="lifestyle-heatingfuel"
            aria-label="Heating fuel"
            value={heatingFuel}
            onChange={(e) => onHeatingFuelChange(e.target.value as HeatingFuel)}
            className="w-full pl-10 pr-9 py-3 sm:py-3.5 rounded-xl border border-[#D0E7DE] dark:border-slate-700 bg-white dark:bg-[#1C2C28] text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#087C73]/30 appearance-none cursor-pointer"
          >
            <option value="">Select heating fuel</option>
            <option value="Electric heater / heat pump">Electric heater / heat pump</option>
            <option value="LPG / natural gas">LPG / natural gas</option>
            <option value="Wood / biomass">Wood / biomass</option>
            <option value="Other fuel">Other fuel</option>
            <option value="No heating / Not applicable">No heating / Not applicable</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
