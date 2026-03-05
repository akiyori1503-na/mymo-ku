export type TransactionType = 'topup' | 'transfer' | 'pulsa' | 'bill' | 'game_reward';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  recipient?: string;
  status: 'success' | 'pending' | 'failed';
}

export interface User {
  id: string;
  name: string;
  phone: string;
  balance: number;
  coins: number;
  avatar?: string;
  spinsLeft?: number;
  lastSpinDate?: string;
}

export interface DailyTask {
  id: string;
  title: string;
  reward: number;
  target: number;
  current: number;
  isClaimed: boolean;
  type: 'transaction' | 'topup';
}

export type SnackbarType = 'success' | 'error' | 'info';

export interface SnackbarState {
  isOpen: boolean;
  message: string;
  type: SnackbarType;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
