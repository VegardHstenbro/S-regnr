
import React from 'react';
import { PluginSettings } from '../types';
import { Save, Key, Globe, Activity, ShoppingCart, Database } from 'lucide-react';

interface Props {
  settings: PluginSettings;
  onSave: (settings: PluginSettings) => void;
}

const SettingsView: React.FC<Props> = ({ settings, onSave }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onSave({ 
      ...settings, 
      [name]: (name === 'cacheTtl' || name === 'dailyQuota' || name === 'ownerCacheTtl') ? Number(value) : value 
    });
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Plugin Innstillinger</h2>
          <p className="text-slate-500">Konfigurer APIer og WooCommerce-koblinger.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md">
          <Save size={18} />
          Lagre endringer
        </button>
      </div>

      <div className="grid gap-6">
        {/* WooCommerce */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <ShoppingCart className="text-blue-500" size={20} />
            <h3 className="font-bold text-slate-800">WooCommerce Integrasjon</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Abonnement Produkt-ID (Søkepass)</label>
              <input 
                name="subscriptionProductId"
                type="text"
                value={settings.subscriptionProductId}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="F.eks. 101"
              />
              <p className="text-[10px] text-slate-400 mt-1 italic">Dette produktet i WC må være av typen 'Subscription' for full funksjonalitet.</p>
            </div>
          </div>
        </section>

        {/* API Basics */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <Key className="text-blue-500" size={20} />
            <h3 className="font-bold text-slate-800">Statens Vegvesen (SVV) API</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Enkeltoppslag API-nøkkel (Teknisk Data)</label>
              <input 
                name="svvApiKey"
                type="password"
                value={settings.svvApiKey}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Eieroppslag Endpoint (BASE URL)</label>
              <input 
                name="svvOwnerEndpoint"
                type="text"
                value={settings.svvOwnerEndpoint}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.vegvesen.no/ws/..."
              />
              <p className="text-[10px] text-slate-400 mt-1 italic">PROD: https://www.vegvesen.no/ws/no/vegvesen/kjoretoy/felles/enkeltoppslag/eierdata</p>
            </div>
          </div>
        </section>

        {/* Maskinporten */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <Globe className="text-purple-500" size={20} />
            <h3 className="font-bold text-slate-800">Maskinporten (Eierdata Auth)</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-600 mb-1">Client ID</label>
              <input 
                name="maskinportenClientId"
                type="text"
                value={settings.maskinportenClientId}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-600 mb-1">Private Key (PEM format)</label>
              <textarea 
                name="maskinportenPrivateKey"
                rows={3}
                value={settings.maskinportenPrivateKey}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-xs focus:ring-2 focus:ring-purple-500"
                placeholder="-----BEGIN PRIVATE KEY-----..."
              />
            </div>
          </div>
        </section>

        {/* Quotas */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <Activity className="text-orange-500" size={20} />
            <h3 className="font-bold text-slate-800">Kvoter & Caching</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Cache Teknisk Data (Timer)</label>
              <input 
                name="cacheTtl"
                type="number"
                value={settings.cacheTtl}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Cache Eierdata (Sekunder)</label>
              <input 
                name="ownerCacheTtl"
                type="number"
                value={settings.ownerCacheTtl}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-[10px] text-slate-400 mt-1 italic">Anbefalt: 600 sek (10 min)</p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-600 mb-1">Global Dagskvote (Søk)</label>
              <input 
                name="dailyQuota"
                type="number"
                value={settings.dailyQuota}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;
