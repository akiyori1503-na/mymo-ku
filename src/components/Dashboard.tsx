import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  Send, 
  History, 
  Smartphone, 
  Gamepad2, 
  Receipt, 
  Trophy, 
  User as UserIcon,
  LogOut,
  Settings,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  X,
  Wallet
} from 'lucide-react';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { TransactionType } from '../types';
import { Logo } from './Logo';

export const Dashboard: React.FC = () => {
  const { authState, transactions, dailyTasks, logout, addTransaction, addCoins, claimTaskReward, useSpin } = useApp();
  const { user } = authState;
  const [activeModal, setActiveModal] = useState<TransactionType | 'profile' | 'games' | 'rewards' | null>(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  
  // Spin Wheel State
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  if (!user) return null;

  const spinWheel = () => {
    if (isSpinning) return;
    if (!useSpin()) return;

    setIsSpinning(true);
    
    // 5 segments, each 72 degrees
    // Rewards: +10 (0), Try Again (1), +20 (2), +15 (3), +1 (4)
    const segments = [
      { label: '+10', value: 10 },
      { label: 'Try Again', value: 0 },
      { label: '+20', value: 20 },
      { label: '+15', value: 15 },
      { label: '+1', value: 1 },
    ];
    
    const randomIndex = Math.floor(Math.random() * segments.length);
    const extraDegrees = (randomIndex * 72) + 36; // Center of segment
    const totalRotation = rotation + (360 * 5) + (360 - (extraDegrees % 360));
    
    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const reward = segments[randomIndex];
      if (reward.value > 0) {
        addCoins(reward.value);
      } else {
        alert('Yah, coba lagi ya!');
      }
    }, 3000);
  };

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal || activeModal === 'profile' || activeModal === 'games') return;

    addTransaction({
      type: activeModal,
      amount: Number(amount),
      description: activeModal === 'transfer' ? `Transfer to ${recipient}` : 
                   activeModal === 'topup' ? 'Top up balance' :
                   activeModal === 'pulsa' ? `Pulsa for ${recipient}` : 'Bill payment',
      recipient: recipient || undefined
    });

    setActiveModal(null);
    setAmount('');
    setRecipient('');
  };

  const quickActions = [
    { icon: PlusCircle, label: 'Top Up', type: 'topup' as const, color: 'bg-emerald-500' },
    { icon: Send, label: 'Transfer', type: 'transfer' as const, color: 'bg-blue-500' },
    { icon: Smartphone, label: 'Pulsa', type: 'pulsa' as const, color: 'bg-orange-500' },
    { icon: Receipt, label: 'Bills', type: 'bill' as const, color: 'bg-purple-500' },
  ];

  const services = [
    { icon: Gamepad2, label: 'Games', type: 'games' as const, color: 'text-pink-500' },
    { icon: Trophy, label: 'Rewards', type: 'rewards' as const, color: 'text-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="mymo-gradient pt-8 pb-24 px-6 rounded-b-[40px] shadow-lg">
        <div className="flex justify-center mb-6">
          <Logo light className="opacity-80 scale-90" />
        </div>
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => setActiveModal('profile')}
            className="flex items-center gap-3 active:scale-95 transition-transform text-left"
          >
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/30 shadow-inner">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-inter uppercase tracking-wider">Welcome back,</p>
              <h2 className="text-white font-bold text-lg font-inter">{user.name}</h2>
            </div>
          </button>

          <button 
            onClick={() => setActiveModal('profile')}
            className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-mymo/5 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 text-xs font-inter uppercase tracking-widest mb-1">Total Balance</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight font-inter">
                  {formatCurrency(user.balance)}
                </h3>
              </div>
              <div className="bg-yellow-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-yellow-100">
                <Coins size={16} className="text-yellow-600" />
                <span className="text-yellow-700 font-bold text-sm">{formatNumber(user.coins)}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              {quickActions.map((action) => (
                <button 
                  key={action.label}
                  onClick={() => setActiveModal(action.type)}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200 transition-transform active:scale-90", action.color)}>
                    <action.icon size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="px-6 -mt-8 space-y-6">
        {/* Services Grid */}
        <div className="grid grid-cols-2 gap-4">
          {services.map((service) => (
            <button 
              key={service.label}
              onClick={() => setActiveModal(service.type)}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 transition-all active:bg-slate-50"
            >
              <service.icon size={20} className={service.color} />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{service.label}</span>
            </button>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <History size={18} className="text-mymo" />
              Recent Transactions
            </h4>
            <button className="text-xs font-bold text-mymo uppercase tracking-wider">See All</button>
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">No transactions yet</p>
              </div>
            ) : (
              transactions.slice(0, 5).map((t) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={t.id} 
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      t.type === 'topup' || t.type === 'game_reward' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                      {t.type === 'topup' || t.type === 'game_reward' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{t.description}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{new Date(t.date).toLocaleDateString()} • {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <p className={cn(
                    "font-bold text-sm",
                    t.type === 'topup' || t.type === 'game_reward' ? "text-emerald-600" : "text-slate-900"
                  )}>
                    {t.type === 'topup' || t.type === 'game_reward' ? '+' : '-'} {formatCurrency(t.amount)}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <Logo className="scale-75 origin-left" />
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <h3 className="text-xl font-bold text-slate-900 capitalize">
                      {activeModal === 'profile' ? 'My Profile' : 
                       activeModal === 'games' ? 'Mymo Games' : 
                       activeModal === 'rewards' ? 'Mymo Rewards' :
                       activeModal.replace('_', ' ')}
                    </h3>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-2 bg-slate-100 rounded-full text-slate-400">
                    <X size={20} />
                  </button>
                </div>

                {activeModal === 'profile' ? (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-lg mb-4">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-900">{user.name}</h4>
                      <p className="text-slate-500 text-sm">{user.phone}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Account Status</span>
                        <span className="text-emerald-600 font-bold">Verified</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Member Since</span>
                        <span className="text-slate-900 font-bold">March 2024</span>
                      </div>
                    </div>
                    <button 
                      onClick={logout}
                      className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2"
                    >
                      <LogOut size={20} />
                      Log Out
                    </button>
                  </div>
                ) : activeModal === 'games' ? (
                  <div className="space-y-6 flex flex-col items-center">
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-bold text-pink-900">Mymo Lucky Spin</h4>
                      <p className="text-pink-700/70 text-sm">
                        Sisa Spin Hari Ini: <span className="font-bold text-pink-600">{user.spinsLeft ?? 3}</span>
                      </p>
                    </div>

                    <div className="relative w-64 h-64 flex items-center justify-center">
                      {/* Pointer */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 text-pink-600">
                        <ArrowDownLeft size={32} className="rotate-[135deg] fill-current" />
                      </div>
                      
                      {/* The Wheel */}
                      <motion.div
                        animate={{ rotate: rotation }}
                        transition={{ 
                          type: "spring", 
                          damping: 20, 
                          stiffness: 20, 
                          restDelta: 0.001 
                        }}
                        className="w-full h-full rounded-full border-8 border-pink-100 shadow-xl overflow-hidden relative bg-white"
                      >
                        {[
                          { label: '+10', color: 'bg-pink-400' },
                          { label: 'Try Again', color: 'bg-slate-200' },
                          { label: '+20', color: 'bg-pink-500' },
                          { label: '+15', color: 'bg-pink-300' },
                          { label: '+1', color: 'bg-pink-200' },
                        ].map((segment, i) => (
                          <div
                            key={i}
                            className={cn(
                              "absolute top-0 left-0 w-full h-full origin-center",
                              segment.color
                            )}
                            style={{
                              clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 38%)',
                              transform: `rotate(${i * 72}deg)`
                            }}
                          >
                            <div 
                              className="absolute top-8 left-1/2 -translate-x-1/2 text-white font-black text-xs whitespace-nowrap"
                              style={{ transform: 'rotate(36deg)' }}
                            >
                              {segment.label}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                      
                      {/* Center Button */}
                      <button
                        onClick={spinWheel}
                        disabled={isSpinning || (user.spinsLeft ?? 3) <= 0}
                        className={cn(
                          "absolute z-10 w-16 h-16 rounded-full shadow-lg flex items-center justify-center font-black text-xs uppercase transition-all active:scale-90",
                          isSpinning || (user.spinsLeft ?? 3) <= 0
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-white text-pink-600 hover:bg-pink-50"
                        )}
                      >
                        {isSpinning ? '...' : 'SPIN'}
                      </button>
                    </div>

                    <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2">Hadiah Spin</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-[10px] text-slate-600">
                          <div className="w-2 h-2 rounded-full bg-pink-500" /> +20 Koin
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-600">
                          <div className="w-2 h-2 rounded-full bg-pink-400" /> +10 Koin
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-600">
                          <div className="w-2 h-2 rounded-full bg-pink-300" /> +15 Koin
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-600">
                          <div className="w-2 h-2 rounded-full bg-pink-200" /> +1 Koin
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeModal === 'rewards' ? (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-yellow-500 flex items-center justify-center text-white shadow-lg shadow-yellow-200">
                          <Trophy size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-yellow-900">Checklist Hari Ini</h4>
                          <p className="text-yellow-700/70 text-xs">Selesaikan tugas dan klaim koinmu!</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {dailyTasks.map((task) => (
                          <div key={task.id} className="bg-white p-4 rounded-2xl border border-yellow-100 flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-800">{task.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-yellow-500 transition-all duration-500" 
                                    style={{ width: `${(task.current / task.target) * 100}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">{task.current}/{task.target}</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              {task.isClaimed ? (
                                <div className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-bold uppercase">Claimed</div>
                              ) : (
                                <button 
                                  disabled={task.current < task.target}
                                  onClick={() => claimTaskReward(task.id)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all",
                                    task.current >= task.target 
                                      ? "bg-yellow-500 text-white shadow-lg shadow-yellow-200 active:scale-95" 
                                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                  )}
                                >
                                  Claim {task.reward}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2">Info Reward</p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-xs text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-mymo" />
                          Auto +10 koin setiap transaksi/top up
                        </li>
                        <li className="flex items-center gap-2 text-xs text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          0 koin untuk transfer
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleAction} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Amount (IDR)</label>
                      <input 
                        type="number" 
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mymo/20 focus:border-mymo text-2xl font-bold"
                        placeholder="0"
                      />
                    </div>

                    {(activeModal === 'transfer' || activeModal === 'pulsa') && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                          {activeModal === 'transfer' ? 'Recipient Account / Phone' : 'Phone Number'}
                        </label>
                        <input 
                          type="text" 
                          required
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mymo/20 focus:border-mymo"
                          placeholder={activeModal === 'transfer' ? "0812..." : "08..."}
                        />
                      </div>
                    )}

                    <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                      <span className="text-sm text-slate-500">Transaction Fee</span>
                      <span className="text-sm font-bold text-emerald-600">Free</span>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-4 mymo-gradient text-white font-bold rounded-2xl shadow-lg shadow-mymo/20 mt-4"
                    >
                      Confirm {activeModal.replace('_', ' ')}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Nav (Redesigned) */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <div className="flex flex-col items-center gap-3 pointer-events-auto">
          <button 
            onClick={() => setActiveModal('transfer')}
            className="w-16 h-16 rounded-3xl mymo-gradient text-white shadow-2xl shadow-mymo/40 flex items-center justify-center active:scale-90 transition-transform"
          >
            <Send size={32} />
          </button>
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/50 px-8 py-3 rounded-3xl shadow-xl flex items-center justify-center">
            <Logo className="scale-90" />
          </div>
        </div>
      </div>
    </div>
  );
};
