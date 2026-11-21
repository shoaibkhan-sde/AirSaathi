import type {
  NavPage,
  UIStateMode,
  CityLocation,
  RecommendationItem,
  RoutineActivity,
  RoomGuidance,
  ChatMessage,
  UserProfile,
  AQICategory,
} from '../types';

export interface UserPreferences {
  name: string;
  householdType: 'individual' | 'family' | 'children' | 'vulnerable';
  hasPurifier: boolean;
  outdoorExerciseTime: 'morning' | 'afternoon' | 'evening' | 'none';
  notificationsEnabled: boolean;
  theme: 'light' | 'dark';
  onboardingCompleted: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

export interface ActionProposal {
  routineTitle: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  details: string;
}

export interface AppContextType {
  activePage: NavPage;
  setActivePage: (page: NavPage) => void;
  currentCity: CityLocation;
  setCurrentCity: (city: CityLocation) => void;
  availableCities: CityLocation[];
  selectCity: (city: CityLocation) => void;
  recommendations: RecommendationItem[];
  routines: RoutineActivity[];
  rooms: RoomGuidance[];
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isAssistantTyping: boolean;
  setIsAssistantTyping: (typing: boolean) => void;
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  uiStateMode: UIStateMode;
  setUiStateMode: (mode: UIStateMode) => void;
  userProfile: UserProfile | null;
  isOnboardingActive: boolean;
  saveUserProfile: (profile: UserProfile) => Promise<UserProfile>;
  completeOnboarding: () => void;
  updateUserProfile: (updates: Partial<UserProfile>, activeCity?: CityLocation) => void;
  retakeOnboarding: () => void;
  resetOnboarding: () => void;
  toasts: ToastMessage[];
  showToast: (
    title: string,
    message?: string,
    type?: 'success' | 'info' | 'warning' | 'error'
  ) => void;
  removeToast: (id: string) => void;
  getAQICategoryInfo: (aqi: number) => {
    category: AQICategory;
    color: string;
    bg: string;
    desc: string;
  };
  toggleCompleteRoutine: (id: string) => void;
  toggleSaveRoutine: (id: string) => void;
  toggleRoomAction: (roomId: string, actionId: string) => void;
  sendUserMessage: (text: string) => void;
  addRoutineFromProposal: (proposal: ActionProposal) => void;
}
