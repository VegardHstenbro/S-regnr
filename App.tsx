
import React, { useState, useEffect } from 'react';
import { Settings, Search, Code, List, ShieldCheck, User as UserIcon, LogOut } from 'lucide-react';
import VehicleLookup from './components/VehicleLookup';
import SettingsView from './components/SettingsView';
import PluginSource from './components/PluginSource';
import AuditLogView from './components/AuditLogView';
import { PluginSettings, AuditLog, UserState } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'demo' | 'code' | 'settings' | 'logs'>('demo');
  const [user, setUser] = useState<UserState>({
    isLoggedIn: false,
    hasSubscription: false,
  });
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<PluginSettings>({
    svvApiKey: 'demo_key_123',
    maskinportenClientId: '',
    maskinportenPrivateKey: '',
    issuer: 'https://maskinporten.no/',
    audience: 'https://maskinporten.no/',
    scope: 'svv:kjoretoy/kjoretoyopplysninger',
    cacheTtl: 24,
    dailyQuota: 5000,
    subscriptionProductId: '101',
    svvOwnerEndpoint: 'https://www.vegvesen.no/ws/no/vegvesen/kjoretoy/felles/enkeltoppslag/eierdata',
    ownerCacheTtl: 600, // 10 minutes in seconds
  });

  const handleLogin = () => {
    setUser({ ...user, isLoggedIn: true, email: 'ola@nordmann.no' });
  };

  const handleLogout = () => {
    setUser({ isLoggedIn: false, hasSubscription: false });
  };

  const handlePurchase = () => {
    setUser({ ...user, hasSubscription: true });
  };

  const addLog = (log: Omit<AuditLog, 'id'>) => {
    const newLog = { ...log, id: Math.random().toString(36).substr(2, 9) };
    setLogs(prev => [newLog, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-blue-400 w-8 h-8" />
            <div>
              <h1 className="font-bold text-xl leading-none">sokregnr</h1>
              <p className="text-xs text-slate-400">WP Subscription Developer Suite</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex gap-1 bg-slate-800 p-1 rounded-lg">
            <TabButton 
              active={activeTab === 'demo'} 
              onClick={() => setActiveTab('demo')}
              icon={<Search size={18} />}
              label="Live Demo"
            />
            <TabButton 
              active={activeTab === 'code'} 
              onClick={() => setActiveTab('code')}
              icon={<Code size={18} />}
              label="Plugin Source"
            />
            <TabButton 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
              icon={<Settings size={18} />}
              label="WP Admin"
            />
            <TabButton 
              active={activeTab === 'logs'} 
              onClick={() => setActiveTab('logs')}
              icon={<List size={18} />}
              label="Audit Logs"
            />
          </nav>

          <div className="flex items-center gap-4">
            {user.isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-white">{user.email}</div>
                  <div className={`text-[10px] uppercase font-black ${user.hasSubscription ? 'text-green-400' : 'text-slate-400'}`}>
                    {user.hasSubscription ? 'Aktivt Søkepass' : 'Ingen abonnement'}
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                  title="Logg ut"
                >
                  <LogOut size={18} className="text-slate-400" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 transition-all"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Vipps_Logo.svg/2000px-Vipps_Logo.svg.png" className="h-3 brightness-0 invert" alt="Vipps" />
                Logg inn
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {activeTab === 'demo' && (
          <VehicleLookup 
            user={user} 
            onLog={addLog} 
            settings={settings} 
            onLogin={handleLogin} 
            onPurchase={handlePurchase} 
          />
        )}
        {activeTab === 'code' && (
          <PluginSource />
        )}
        {activeTab === 'settings' && (
          <SettingsView settings={settings} onSave={setSettings} />
        )}
        {activeTab === 'logs' && (
          <AuditLogView logs={logs} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm font-medium">
            Profesjonell WP-utvidelse for SVV Oppslag & WooCommerce Subscriptions
          </p>
          <div className="flex justify-center gap-4 mt-2">
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Vipps_Logo.svg/2000px-Vipps_Logo.svg.png" className="h-4 opacity-50 grayscale" alt="Vipps" />
             <img src="https://woocommerce.com/wp-content/themes/woo/images/logo-woocommerce.svg" className="h-4 opacity-50 grayscale" alt="WooCommerce" />
          </div>
        </div>
      </footer>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-sm' 
        : 'text-slate-400 hover:text-white hover:bg-slate-700'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default App;
