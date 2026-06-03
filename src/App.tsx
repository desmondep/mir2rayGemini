import { useState, useEffect, useRef } from 'react';
import { Power, RefreshCcw, Zap, SkipForward, Server, Shield, Activity, Share2, Plus, Download, ChevronRight, Globe, ArrowUp, ArrowDown } from 'lucide-react';

// Types
interface VpnConfig {
  id: string;
  name: string;
  ping: number | null;
}

interface DnsTestResult {
  server: string;
  speed: number;
  jitter: number;
  accuracy: number;
}

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [configs, setConfigs] = useState<VpnConfig[]>([]);
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  
  const [isGiving, setIsGiving] = useState(false);
  const [giveProgress, setGiveProgress] = useState(0);
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeProgress, setOptimizeProgress] = useState(0);
  
  const [isTestingDNS, setIsTestingDNS] = useState(false);
  const [dnsProgress, setDnsProgress] = useState(0);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showDnsResults, setShowDnsResults] = useState(false);
  const [dnsResults, setDnsResults] = useState<DnsTestResult[]>([]);
  const [appliedDns, setAppliedDns] = useState<string>("System Default");

  const giveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasLongPressed = useRef(false);
  
  const [processState, setProcessState] = useState('Ready');

  const currentConfig = configs.length > 0 ? configs[currentConfigIndex] : null;

  useEffect(() => {
    setProcessState(configs.length === 0 ? 'Ready' : `${configs.length} Configs available`);
  }, [configs.length]);

  const handleGiveConfigs = (source = 'Miraali (default)') => {
    setShowSourceModal(false);
    if (isGiving || isOptimizing || isConnecting || isConnected || isTestingDNS) return;
    setIsGiving(true);
    setProcessState(`Fetching from ${source}...`);
    setGiveProgress(15);
    
    setTimeout(() => {
      setProcessState('Removing duplicates...');
      setGiveProgress(35);
    }, 800);
    
    setTimeout(() => {
      setProcessState('Testing latency...');
      setGiveProgress(60);
    }, 1600);

    setTimeout(() => {
      setProcessState('Testing download speed...');
      setGiveProgress(80);
    }, 2800);

    // new config logic
    setTimeout(() => {
      const newConfigs = Array.from({ length: 5 }).map((_, i) => ({
        id: `config-${Date.now()}-${i}`,
        name: `Server-${Math.random().toString(36).substring(7)}`,
        ping: Math.floor(Math.random() * 400) + 50,
      }));
      setConfigs(prev => [...prev, ...newConfigs]);
      setProcessState(`Imported: 5 | Tested: 5 | Download Pass: 5`);
      setGiveProgress(100);
      
      setTimeout(() => {
        setIsGiving(false);
        setGiveProgress(0);
        setProcessState(`${configs.length + 5} Configs ready`);
      }, 1500);
    }, 4200);
  };

  const handleGivePointerDown = () => {
    hasLongPressed.current = false;
    giveTimerRef.current = setTimeout(() => {
      hasLongPressed.current = true;
      setShowSourceModal(true);
    }, 600);
  };

  const handleGivePointerUp = () => {
    if (giveTimerRef.current) {
      clearTimeout(giveTimerRef.current);
      giveTimerRef.current = null;
    }
  };

  const handleGiveClick = () => {
    if (hasLongPressed.current) {
      hasLongPressed.current = false;
      return;
    }
    handleGiveConfigs();
  };

  const handleTestDNS = () => {
    if (isGiving || isOptimizing || isConnecting || isTestingDNS) return;
    setIsTestingDNS(true);
    
    setProcessState('Connecting to global & regional DNS servers...');
    setDnsProgress(15);

    setTimeout(() => {
      setProcessState('Testing resolution speed on top domains...');
      setDnsProgress(40);
    }, 1200);

    setTimeout(() => {
      setProcessState('Calculating jitter & verifying record accuracy...');
      setDnsProgress(75);
    }, 2500);

    setTimeout(() => {
      const mockResults: DnsTestResult[] = [
        { server: "Electro (IR)", speed: Math.floor(Math.random() * 20) + 15, jitter: Math.floor(Math.random() * 5) + 1, accuracy: 100 },
        { server: "Cloudflare", speed: Math.floor(Math.random() * 40) + 30, jitter: Math.floor(Math.random() * 10) + 5, accuracy: 100 },
        { server: "Radar (IR)", speed: Math.floor(Math.random() * 25) + 20, jitter: Math.floor(Math.random() * 8) + 2, accuracy: 100 },
        { server: "Google", speed: Math.floor(Math.random() * 50) + 40, jitter: Math.floor(Math.random() * 15) + 8, accuracy: 100 },
        { server: "Quad9", speed: Math.floor(Math.random() * 60) + 45, jitter: Math.floor(Math.random() * 12) + 6, accuracy: 100 },
        { server: "403.online", speed: Math.floor(Math.random() * 30) + 20, jitter: Math.floor(Math.random() * 10) + 2, accuracy: 100 },
        { server: "AdGuard", speed: Math.floor(Math.random() * 70) + 50, jitter: Math.floor(Math.random() * 15) + 10, accuracy: 100 },
        { server: "OpenDNS", speed: Math.floor(Math.random() * 60) + 50, jitter: Math.floor(Math.random() * 25) + 12, accuracy: 80 },
        { server: "NextDNS", speed: Math.floor(Math.random() * 80) + 60, jitter: Math.floor(Math.random() * 20) + 15, accuracy: 100 }
      ].sort((a,b) => a.speed - b.speed);
      
      setDnsResults(mockResults);
      setDnsProgress(100);
      setTimeout(() => {
        setIsTestingDNS(false);
        setDnsProgress(0);
        setShowDnsResults(true);
        setProcessState(`DNS Tests complete. Select a server.`);
      }, 1000);
    }, 4000);
  };

  const handleOptimize = () => {
    if (configs.length === 0) {
      setProcessState('List empty. Please Give Configs first.');
      return;
    }
    if (isGiving || isOptimizing || isConnecting || isTestingDNS) return;
    
    setIsOptimizing(true);
    setProcessState('Preparing optimization...');
    setOptimizeProgress(25);

    setTimeout(() => {
      setProcessState('Testing real latency...');
      setOptimizeProgress(50);
    }, 1000);

    setTimeout(() => {
      setProcessState('Testing download speed...');
      setOptimizeProgress(75);
    }, 2000);

    setTimeout(() => {
      const optimized = [...configs].map(c => ({
        ...c,
        ping: Math.floor(Math.random() * 300) + 50
      })).sort((a, b) => a.ping! - b.ping!);
      setConfigs(optimized);
      setCurrentConfigIndex(0);
      
      setProcessState(`Tested: ${configs.length} | Download Pass: ${configs.length}`);
      setOptimizeProgress(100);
      
      setTimeout(() => {
        setIsOptimizing(false);
        setOptimizeProgress(0);
        setProcessState(`Optimization complete. ${configs.length} Configs`);
      }, 1500);
    }, 3000);
  };

  const toggleConnect = () => {
    if (isGiving || isOptimizing || isConnecting || isTestingDNS) return;
    
    if (isConnected) {
      setProcessState(`${configs.length} Configs ready`);
      setIsConnected(false);
    } else {
      if (configs.length === 0) {
        setProcessState('List empty. Please Give Configs first.');
        return;
      }
      setIsConnecting(true);
      setProcessState('Connecting...');
      
      setTimeout(() => {
        setIsConnecting(false);
        setIsConnected(true);
        setProcessState(`Connected • Ping: ${currentConfig?.ping || 'Unknown'}ms`);
      }, 1500);
    }
  };

  const handleNextConfig = () => {
    if (configs.length === 0) return;
    if (configs.length === 1) {
      setProcessState('No other configs available to switch.');
      return;
    }
    setProcessState('Switching to next config...');
    setTimeout(() => {
      setCurrentConfigIndex(prev => (prev + 1) % configs.length);
      setProcessState(`Connected • Ping: ${configs[(currentConfigIndex + 1) % configs.length].ping || 'Unknown'}ms`);
    }, 800);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4">
      {/* Background blobs for premium feel */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-success/10 rounded-full blur-[100px] pointer-events-none opacity-50" />
      
      {/* Main App Container */}
      <div className="relative w-full max-w-[400px] bg-surface-dark/80 backdrop-blur-xl border border-border-dark rounded-3xl overflow-hidden shadow-2xl flex flex-col p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">Mir2Ray</h1>
          </div>
          <div className="flex items-center space-x-2 bg-surface-hover px-3 py-1.5 rounded-full border border-border-dark shadow-xs">
            <Server className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-medium text-gray-300">{configs.length}</span>
          </div>
        </div>

        {/* Main Status Area */}
        <div className="flex flex-col items-center justify-center py-8">
          <button
            onClick={toggleConnect}
            disabled={isGiving || isOptimizing || isConnecting || isTestingDNS}
            className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] ${
              isConnected 
                ? 'bg-success/10 shadow-[0_0_40px_rgba(16,185,129,0.2)]' 
                : isConnecting
                ? 'bg-accent/10 shadow-[0_0_40px_rgba(59,130,246,0.2)] animate-pulse'
                : 'bg-surface-hover shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-border-dark'
            }`}
          >
            {/* Status Rings */}
            {isConnected && (
              <div className="absolute inset-0 rounded-full border-2 border-success animate-[spin_4s_linear_infinite] opacity-30" style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }} />
            )}
            {isConnecting && (
              <div className="absolute inset-0 rounded-full border-2 border-accent animate-spin opacity-50" style={{ borderTopColor: 'transparent' }} />
            )}
            
            <Power className={`w-14 h-14 transition-colors duration-500 ${
              isConnected ? 'text-success' : isConnecting ? 'text-accent' : 'text-gray-400'
            }`} />
          </button>
          
          <div className="mt-8 text-center space-y-1">
            <h2 className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${
              isConnected ? 'text-success' : 'text-gray-100'
            }`}>
              {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
            </h2>
            <p className="text-sm text-gray-400 font-medium h-5">
              {processState}
            </p>
          </div>

          {isConnected && (
            <div className="w-full mt-6 bg-[#101A10] border border-border-dark rounded-2xl p-4 shadow-inner animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-center mb-3">
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Live IP</div>
                  <div className="text-xs font-bold text-success flex items-center space-x-1">
                    <Globe className="w-3 h-3 opacity-70" />
                    <span>{Math.floor(Math.random() * 255) + 1}.{Math.floor(Math.random() * 255)}.12.8</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Active DNS</div>
                  <div className="text-xs font-bold text-success flex items-center space-x-1 justify-end">
                    <Server className="w-3 h-3 opacity-70" />
                    <span>{appliedDns}</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#152215] rounded-xl p-3 flex justify-between items-center text-sm font-mono border border-success/10">
                <div className="flex items-center text-gray-300 space-x-2 w-1/2">
                  <div className="w-6 h-6 rounded-md bg-success/10 flex items-center justify-center">
                    <ArrowDown className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-xs">{Math.floor(Math.random() * 500) + 120}.5 KB/s</span>
                </div>
                <div className="w-[1px] h-6 bg-border-dark mx-2" />
                <div className="flex items-center text-gray-300 space-x-2 w-1/2 justify-end">
                  <span className="text-xs">{Math.floor(Math.random() * 100) + 10}.2 KB/s</span>
                  <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
                    <ArrowUp className="w-3 h-3 text-accent" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {/* Give Configs Button */}
          <button
            onPointerDown={handleGivePointerDown}
            onPointerUp={handleGivePointerUp}
            onPointerLeave={handleGivePointerUp}
            onClick={handleGiveClick}
            disabled={isGiving || isConnecting || isOptimizing || isConnected || isTestingDNS}
            className="relative overflow-hidden group bg-surface-hover border border-border-dark hover:border-accent/30 rounded-2xl p-4 flex flex-col items-start justify-between h-28 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Download className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-semibold text-gray-200">Get Configs</span>
              <span className="block text-xs text-gray-500 mt-0.5">Fetch latest</span>
            </div>
            {isGiving && (
              <div className="absolute bottom-0 left-0 h-1 bg-accent transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ width: `${giveProgress}%` }} />
            )}
          </button>

          {/* Optimize Button */}
          <button
            onClick={handleOptimize}
            disabled={isGiving || isConnecting || isOptimizing || isTestingDNS}
            className="relative overflow-hidden group bg-surface-hover border border-border-dark hover:border-success/30 rounded-2xl p-4 flex flex-col items-start justify-between h-28 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-semibold text-gray-200">Optimize</span>
              <span className="block text-xs text-gray-500 mt-0.5">Filter & speedtest</span>
            </div>
            {isOptimizing && (
              <div className="absolute bottom-0 left-0 h-1 bg-success transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{ width: `${optimizeProgress}%` }} />
            )}
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="space-y-2 mt-4">
          {isConnected && (
            <button
              onClick={handleNextConfig}
              className="w-full flex items-center justify-between p-4 bg-surface-hover border border-border-dark hover:border-gray-600 rounded-xl transition-all"
            >
              <div className="flex items-center space-x-3">
                <SkipForward className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-200">Switch to Next Config</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (isGiving || isOptimizing || isConnecting || isTestingDNS) return;
                setProcessState('Importing config from clipboard...');
                setTimeout(() => {
                  const newConfigs = Array.from({ length: 1 }).map((_, i) => ({
                    id: `imported-${Date.now()}-${i}`,
                    name: `Custom-${Math.random().toString(36).substring(7)}`,
                    ping: null,
                  }));
                  setConfigs(prev => [...prev, ...newConfigs]);
                  setProcessState('Config imported successfully!');
                }, 800);
              }}
              disabled={isGiving || isConnecting || isOptimizing || isTestingDNS}
              className="flex items-center justify-center space-x-2 p-3 bg-surface-hover border border-border-dark rounded-xl hover:bg-border-dark transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-300">Import</span>
            </button>

            <button
              onClick={handleTestDNS}
              disabled={isGiving || isConnecting || isOptimizing || isTestingDNS}
              className="relative overflow-hidden flex items-center justify-center space-x-2 p-3 bg-surface-hover border border-border-dark rounded-xl hover:bg-border-dark transition-colors disabled:opacity-50"
            >
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-300">Test DNS</span>
              {isTestingDNS && (
                <div className="absolute inset-0 bg-white/5 shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]" style={{ width: `${dnsProgress}%` }} />
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Source Selection Modal */}
      {showSourceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 animate-in fade-in duration-200">
          <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl w-full max-w-[320px] shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <h3 className="text-gray-100 font-semibold mb-4 text-base">Select Config Source</h3>
            <div className="space-y-2.5">
              {['List 1: Miraali', 'List 2: V2ray-config', 'List 3: 5ubscrpt10n', 'All: All combined'].map(source => (
                <button
                  key={source}
                  onClick={() => handleGiveConfigs(source)}
                  className="w-full h-11 bg-surface-hover text-gray-200 hover:bg-border-dark hover:text-white rounded-xl text-sm font-medium transition-colors"
                >
                  {source}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSourceModal(false)}
              className="w-full h-11 mt-4 text-gray-400 hover:text-gray-200 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* DNS Results Modal */}
      {showDnsResults && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl w-full max-w-[400px] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-100 font-semibold text-lg">DNS Test Summary</h3>
              <div className="text-xs text-gray-400">Click a row to apply</div>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-border-dark">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-hover text-gray-400 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-4 py-3">Server</th>
                    <th className="px-4 py-3 text-right">Speed</th>
                    <th className="px-4 py-3 text-right">Jitter</th>
                    <th className="px-4 py-3 text-right">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark">
                  {dnsResults.map((result, idx) => (
                    <tr 
                      key={result.server} 
                      onClick={() => {
                        setAppliedDns(result.server);
                        setShowDnsResults(false);
                        setProcessState(`Applied DNS: ${result.server}`);
                      }}
                      className="cursor-pointer hover:bg-surface-hover transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-200 flex items-center space-x-2">
                        {appliedDns === result.server && <Shield className="w-3 h-3 text-success" />}
                        <span className={appliedDns === result.server ? "text-success" : ""}>{result.server}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300">{result.speed}ms</td>
                      <td className="px-4 py-3 text-right text-gray-300">{result.jitter}ms</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${result.accuracy === 100 ? 'bg-success/10 text-success' : 'bg-orange-500/10 text-orange-400'}`}>
                          {result.accuracy}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowDnsResults(false)}
              className="w-full h-11 mt-6 bg-surface-hover border border-border-dark text-gray-200 hover:bg-border-dark rounded-xl text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
