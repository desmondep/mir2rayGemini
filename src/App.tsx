/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Power, RefreshCcw, Zap, SkipForward, Server, Shield, Activity, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
interface VpnConfig {
  id: string;
  name: string;
  type: string;
  ping: number | null;
  status: 'untested' | 'good' | 'bad';
}

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [configs, setConfigs] = useState<VpnConfig[]>([]);
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState('');
  
  const currentConfig = configs.length > 0 ? configs[currentConfigIndex] : null;

  // Simulate Giving New Configs (fetch sub)
  const handleGiveNewConfigs = () => {
    setIsProcessing(true);
    setProcessMessage('در حال دریافت و تست کانفیگ‌های جدید...');
    
    // Simulate network delay
    setTimeout(() => {
      const mockConfigs: VpnConfig[] = [
        { id: '1', name: '🇩🇪 Germany-VIP (Auto)', type: 'vless', ping: 120, status: 'good' },
        { id: '2', name: '🇫🇷 France-Premium', type: 'vmess', ping: 145, status: 'good' },
        { id: '3', name: '🇳🇱 Netherlands-Fast', type: 'trojan', ping: 180, status: 'good' },
        { id: '4', name: '🇺🇸 USA-Tunnel', type: 'vless', ping: 250, status: 'untested' },
        { id: '5', name: '🇬🇧 UK-Core', type: 'vmess', ping: 512, status: 'bad' },
      ];
      setConfigs(mockConfigs);
      setCurrentConfigIndex(0);
      setIsProcessing(false);
    }, 2000);
  };

  // Simulate Optimize
  const handleOptimize = () => {
    if (configs.length === 0) return;
    setIsProcessing(true);
    setProcessMessage('در حال پینگ‌گیری موازی و بهینه‌سازی...');
    
    setTimeout(() => {
      const optimized = [...configs]
        .map(c => ({
          ...c,
          ping: c.ping ? c.ping - Math.floor(Math.random() * 30) : 100 + Math.floor(Math.random() * 200),
        }))
        .filter(c => (c.ping || 0) < 500)
        .sort((a, b) => (a.ping || 999) - (b.ping || 999));
        
      setConfigs(optimized);
      setCurrentConfigIndex(0);
      setIsProcessing(false);
    }, 1500);
  };

  const handleNextConfig = () => {
    if (configs.length > 0) {
      setCurrentConfigIndex((prev) => (prev + 1) % configs.length);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans dir-rtl">
      {/* Background ambient accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/20 rounded-2xl mb-4 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Mir2Ray <span className="text-indigo-400">Web</span></h1>
          <p className="text-slate-400 text-sm">نسخه تحت وب داشبورد Mir2Ray (سه‌دکمه‌ای)</p>
        </div>

        {/* Main Connection Card */}
        <motion.div 
          layout
          className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        >
          {isConnected && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent pointer-events-none" 
            />
          )}

          <div className="flex flex-col items-center space-y-8 pt-4">
            
            {/* Status Indicator */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium tracking-wider uppercase text-slate-500">وضعیت اتصال</span>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950 border border-slate-800">
                <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${isConnected ? 'bg-teal-400 text-teal-400' : 'bg-rose-500 text-rose-500'}`} />
                <span className={`text-sm font-medium ${isConnected ? 'text-teal-400' : 'text-rose-500'}`}>
                  {isConnected ? 'متصل' : 'قطع'}
                </span>
              </div>
            </div>

            {/* Big Power Button */}
            <button
              disabled={configs.length === 0}
              onClick={() => setIsConnected(!isConnected)}
              className={`relative group w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                ${isConnected 
                  ? 'bg-teal-500/20 border-2 border-teal-500/50 text-teal-400 hover:bg-teal-500/30 shadow-[0_0_40px_rgba(20,184,166,0.3)]' 
                  : 'bg-slate-800/50 border-2 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'}
              `}
            >
              <Power className={`w-12 h-12 transition-transform duration-300 ${isConnected ? 'scale-110 drop-shadow-[0_0_10px_rgba(20,184,166,0.8)]' : ''}`} />
            </button>

            {/* Current Config Info */}
            <div className="w-full text-center space-y-1">
              {currentConfig ? (
                <>
                  <p className="font-semibold text-lg text-slate-200" dir="ltr">{currentConfig.name}</p>
                  <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3" /> {currentConfig.ping}ms | {currentConfig.type.toUpperCase()}
                  </p>
                </>
              ) : (
                <p className="text-slate-500">کانفیگی موجود نیست. دکمه دریافت را بزنید.</p>
              )}
            </div>

          </div>
        </motion.div>

        {/* The Three Buttons UI (Give, Optimize, Next) */}
        <div className="grid grid-cols-3 gap-3">
          
          <button 
            onClick={handleGiveNewConfigs}
            disabled={isProcessing}
            className="flex flex-col items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 disabled:opacity-50 border border-indigo-500/20 rounded-2xl p-4 transition-colors"
          >
            <RefreshCcw className={`w-6 h-6 text-indigo-400 ${isProcessing && 'animate-spin'}`} />
            <span className="text-xs font-medium text-indigo-300">دریافت کانفیگ</span>
          </button>

          <button 
            onClick={handleOptimize}
            disabled={configs.length === 0 || isProcessing}
            className="flex flex-col items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 border border-amber-500/20 rounded-2xl p-4 transition-colors"
          >
            <Zap className="w-6 h-6 text-amber-400" />
            <span className="text-xs font-medium text-amber-300">بهینه‌سازی</span>
          </button>

          <button 
            onClick={handleNextConfig}
            disabled={configs.length === 0}
            className="flex flex-col items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded-2xl p-4 transition-colors"
          >
            <SkipForward className="w-6 h-6 text-slate-300" />
            <span className="text-xs font-medium text-slate-400 text-center">سرور بعدی</span>
          </button>
          
        </div>

        {/* Logs/Process Message */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center text-sm text-indigo-400 bg-indigo-950/50 py-2 rounded-lg border border-indigo-900/50"
            >
              {processMessage}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
