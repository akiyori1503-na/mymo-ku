import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, AuthState, DailyTask, SnackbarState, SnackbarType } from './types';

interface AppContextType {
  authState: AuthState;
  transactions: Transaction[];
  dailyTasks: DailyTask[];
  snackbar: SnackbarState;
  isTransitioning: boolean;
  login: (phone: string, name: string) => void;
  logout: () => void;
  signup: (name: string, phone: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'status'>) => void;
  addCoins: (amount: number) => void;
  claimTaskReward: (taskId: string) => void;
  useSpin: () => boolean;
  showSnackbar: (message: string, type?: SnackbarType) => void;
  hideSnackbar: () => void;
}

const INITIAL_TASKS: DailyTask[] = [
  { id: 'task_1', title: 'Lakukan 2 transaksi', reward: 25, target: 2, current: 0, isClaimed: false, type: 'transaction' },
  { id: 'task_2', title: 'Lakukan top up', reward: 15, target: 1, current: 0, isClaimed: false, type: 'topup' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('mymo_auth');
    return saved ? JSON.parse(saved) : { user: null, isAuthenticated: false };
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('mymo_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(() => {
    const saved = localStorage.getItem('mymo_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    localStorage.setItem('mymo_auth', JSON.stringify(authState));
  }, [authState]);

  useEffect(() => {
    localStorage.setItem('mymo_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('mymo_tasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  const showSnackbar = (message: string, type: SnackbarType = 'success') => {
    setSnackbar({ isOpen: true, message, type });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, isOpen: false }));
  };

  const login = (phone: string, name: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      // Mock login
      const user: User = {
        id: '1',
        name: name || 'User Mymo',
        phone,
        balance: 500000,
        coins: 1250,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`
      };
      setAuthState({ user, isAuthenticated: true });
      setIsTransitioning(false);
      showSnackbar(`Selamat datang kembali, ${user.name}!`);
    }, 1500);
  };

  const signup = (name: string, phone: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        phone,
        balance: 0,
        coins: 0,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
        spinsLeft: 3,
        lastSpinDate: new Date().toDateString()
      };
      setAuthState({ user, isAuthenticated: true });
      setIsTransitioning(false);
      showSnackbar('Akun berhasil dibuat!');
    }, 1500);
  };

  const logout = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAuthState({ user: null, isAuthenticated: false });
      setIsTransitioning(false);
      showSnackbar('Berhasil keluar akun', 'info');
    }, 1000);
  };

  const addTransaction = (t: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    if (!authState.user) return;

    const newTransaction: Transaction = {
      ...t,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      status: 'success'
    };

    setTransactions([newTransaction, ...transactions]);

    // Auto reward logic: +10 for every transaction/topup, 0 for transfer
    let autoCoins = 0;
    if (t.type !== 'transfer' && t.type !== 'game_reward') {
      autoCoins = 10;
    }

    // Update balance and coins
    const balanceChange = t.type === 'topup' || t.type === 'game_reward' ? t.amount : -t.amount;
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { 
        ...prev.user, 
        balance: prev.user.balance + balanceChange,
        coins: prev.user.coins + autoCoins
      } : null
    }));

    // Show notification
    const actionName = t.type === 'topup' ? 'Top up' : 
                     t.type === 'transfer' ? 'Transfer' : 
                     t.type === 'pulsa' ? 'Isi pulsa' : 'Pembayaran';
    
    showSnackbar(`${actionName} berhasil! ${autoCoins > 0 ? `(+${autoCoins} koin)` : ''}`);

    // Update daily tasks progress
    setDailyTasks(prev => prev.map(task => {
      if (task.isClaimed) return task;
      
      if (task.type === 'transaction') {
        return { ...task, current: Math.min(task.target, task.current + 1) };
      }
      
      if (task.type === 'topup' && t.type === 'topup') {
        return { ...task, current: Math.min(task.target, task.current + 1) };
      }
      
      return task;
    }));
  };

  const addCoins = (amount: number) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, coins: prev.user.coins + amount } : null
    }));
    showSnackbar(`Selamat! Kamu mendapatkan ${amount} koin!`);
  };

  const claimTaskReward = (taskId: string) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (task && task.current >= task.target && !task.isClaimed) {
      addCoins(task.reward);
      setDailyTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, isClaimed: true } : t
      ));
      // addCoins already shows snackbar
    }
  };

  const useSpin = (): boolean => {
    if (!authState.user) return false;
    
    const today = new Date().toDateString();
    const user = authState.user;
    
    let currentSpins = user.spinsLeft ?? 3;
    if (user.lastSpinDate !== today) {
      currentSpins = 3;
    }
    
    if (currentSpins <= 0) {
      showSnackbar('Limit spin harian sudah habis!', 'error');
      return false;
    }
    
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { 
        ...prev.user, 
        spinsLeft: currentSpins - 1,
        lastSpinDate: today
      } : null
    }));
    
    return true;
  };

  return (
    <AppContext.Provider value={{ 
      authState, 
      transactions, 
      dailyTasks, 
      snackbar,
      isTransitioning,
      login, 
      logout, 
      signup, 
      addTransaction, 
      addCoins,
      claimTaskReward,
      useSpin,
      showSnackbar,
      hideSnackbar
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
