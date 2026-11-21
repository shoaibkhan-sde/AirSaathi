import { useContext } from 'react';
import { AppContext } from './AppContextInstance';
import type { AppContextType } from './AppContextTypes';

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
