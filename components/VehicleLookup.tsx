
import React, { useState } from 'react';
import { Search, Car, Calendar, Gauge, Weight, FileCheck, User, Lock, AlertCircle, Hash, Tag, CreditCard, Info, ShieldCheck } from 'lucide-react';
import { VehicleData, OwnerData, PluginSettings, AuditLog, UserState } from '../types';
import { GoogleGenAI } from '@google/genai';

interface Props {
  user: UserState;
  onLog: (log: Omit<AuditLog, 'id'>) => void;
  settings: PluginSettings;
  onLogin: () => void;
  onPurchase: () => void;
}

const VehicleLookup: React.FC<Props> = ({ user, onLog, settings, onLogin, onPurchase }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VehicleData | null>(null);
  const [owner, setOwner] = useState<OwnerData | null>(null);
  const [ownerLoading, setOwnerLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    const regnrRegex = /^[A-Z]{2}[0-9]{5}$/;
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    const cleanQuery = query.trim().toUpperCase();
    const isRegnr = regnrRegex.test(cleanQuery);
    const isVin = vinRegex.test(cleanQuery);

    if (!isRegnr && !isVin) {
      setError('Ugyldig format. Bruk f.eks. EL12345 eller 17-tegns VIN.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setOwner(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Updated prompt to explicitly request flat string values to prevent React rendering errors
      const prompt = `Simulate a JSON response from Statens vegvesen for vehicle ${cleanQuery}. 
      Return a FLAT JSON object (no nested objects for values).
      Include keys: kjennemerke, vin, merke, modell, eu_kontroll_sist, eu_frister, motoreffekt, vekt, dekk_felg, first_reg_date. 
      Values should be simple strings in Norwegian. For 'vekt', just return a string like '1500 kg'. 
      Output ONLY raw JSON.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text || '{}');
      
      // Cleanup logic: Ensure all fields are strings to prevent React Error #31
      const sanitizedData: VehicleData = {
        kjennemerke: String(data.kjennemerke || ''),
        vin: String(data.vin || ''),
        merke: String(data.merke || ''),
        modell: String(data.modell || ''),
        eu_kontroll_sist: String(data.eu_kontroll_sist || ''),
        eu_frister: String(data.eu_frister || ''),
        motoreffekt: typeof data.motoreffekt === 'object' ? (data.motoreffekt.effekt || JSON.stringify(data.motoreffekt)) : String(data.motoreffekt || ''),
        vekt: typeof data.vekt === 'object' ? (data.vekt.egenvekt || JSON.stringify(data.vekt)) : String(data.vekt || ''),
        dekk_felg: String(data.dekk_felg || ''),
        first_reg_date: String(data.first_reg_date || ''),
      };

      setResult(sanitizedData);
      onLog({
        timestamp: new Date().toISOString(),
        userId: user.email || 'Anonym',
        regnrHash: btoa(cleanQuery).slice(0, 10),
        type: 'public'
      });
    } catch (err) {
      console.error('Search error:', err);
      setError('Kunne ikke hente data. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const lookupOwner = async () => {
    if (!user.hasSubscription) return;
    setOwnerLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Simulate a JSON response for owner of ${result?.kjennemerke}. JSON keys: navn, kommune, timestamp. Output ONLY raw JSON.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      setOwner(data);
      onLog({
        timestamp: new Date().toISOString(),
        userId: user.email || 'Premium User',
        regnrHash: btoa(result?.kjennemerke || '').slice(0, 10),
        type: 'owner'
      });
    } catch (err) {
      setError('Feil ved eieroppslag.');
    } finally {
      setOwnerLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Search Bar UI */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Kjøretøyoppslag</h2>
          <p className="text-slate-500">Tekniske spesifikasjoner og eierinfo via Statens vegvesen.</p>
          
          <form onSubmit={handleSearch} className="flex gap-2 mt-6">
            <div className="relative flex-1">
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                placeholder="REGNR eller VIN..."
                className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-black"
              />
              <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
            >
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <Search size={20} />}
              SØK
            </button>
          </form>
          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
        </div>
      </div>

      {result && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Technical Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white px-2 py-0.5 rounded text-sm font-black">N</div>
                  <h3 className="text-xl font-black text-white tracking-widest uppercase">{result.kjennemerke}</h3>
                  <span className="text-slate-400 font-bold ml-2">{result.merke} {result.modell}</span>
                </div>
                <div className="text-slate-500 text-[10px] font-mono tracking-wider">{result.vin}</div>
              </div>
              
              <div className="grid sm:grid-cols-2 p-8 gap-x-12 gap-y-8">
                <ResultItem icon={<Tag />} label="Fabrikat/Modell" value={`${result.merke} ${result.modell}`} />
                <ResultItem icon={<Calendar />} label="Første reg." value={result.first_reg_date} />
                <ResultItem icon={<Gauge />} label="Effekt" value={result.motoreffekt} />
                <ResultItem icon={<Weight />} label="Vekt" value={result.vekt} />
                <ResultItem icon={<FileCheck />} label="Siste EU" value={result.eu_kontroll_sist} />
                <ResultItem icon={<Car />} label="Dekkdim." value={result.dekk_felg} />
              </div>

              <div className="bg-amber-50 p-6 border-t border-amber-100 flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                  <Calendar size={24} />
                </div>
                <div>
                  <div className="text-xs font-black text-amber-800 uppercase tracking-wider">Neste frist EU-kontroll</div>
                  <div className="text-2xl font-black text-amber-900 leading-none mt-1">{result.eu_frister}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription / Owner Flow */}
          <div className="space-y-6">
            <div className={`rounded-2xl shadow-sm border p-6 h-full transition-all ${owner ? 'bg-white border-slate-200' : 'bg-slate-50 border-dashed border-slate-300'}`}>
              <div className="flex items-center gap-2 mb-6 text-slate-900">
                <User size={20} className="text-blue-600" />
                <h4 className="font-black text-lg">Eieropplysninger</h4>
              </div>

              {!user.isLoggedIn && (
                <div className="text-center space-y-6 py-4">
                  <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-slate-300 shadow-sm">
                    <Lock size={32} />
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-slate-800">Logg inn for eierinfo</p>
                    <p className="text-xs text-slate-500 leading-relaxed px-4">Du må være logget inn for å kjøpe "Søkepass" og se eierdata.</p>
                  </div>
                  <button 
                    onClick={onLogin}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 shadow-lg shadow-orange-100 transition-all"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Vipps_Logo.svg/2000px-Vipps_Logo.svg.png" className="h-4 brightness-0 invert" alt="Vipps" />
                    Logg inn med Vipps
                  </button>
                </div>
              )}

              {user.isLoggedIn && !user.hasSubscription && (
                <div className="text-center space-y-6 py-2">
                  <div className="bg-white p-4 rounded-2xl border border-blue-100 text-left">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-blue-600 uppercase">Abonnement</span>
                      <span className="text-lg font-black text-slate-900">149 kr/mnd</span>
                    </div>
                    <h5 className="font-black text-slate-800 mb-1">Søkepass Premium</h5>
                    <p className="text-[11px] text-slate-500 leading-normal">Ubegrenset tilgang til eieropplysninger via Maskinporten. Inkluderer teknisk data og historikk.</p>
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400">
                      <CreditCard size={10} /> 1 kr etableringsgebyr
                    </div>
                  </div>
                  <button 
                    onClick={onPurchase}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 shadow-lg shadow-orange-100 transition-all"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Vipps_Logo.svg/2000px-Vipps_Logo.svg.png" className="h-4 brightness-0 invert" alt="Vipps" />
                    Kjøp Søkepass
                  </button>
                  <div className="text-[9px] text-slate-400 text-left leading-tight italic">
                    Ved kjøp samtykker du til våre vilkår. 14 dagers angrefrist gjelder kun dersom tjenesten ikke er tatt i bruk. Abonnementet fornyes automatisk.
                  </div>
                </div>
              )}

              {user.hasSubscription && !owner && (
                <div className="text-center space-y-6 py-4">
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-left flex items-start gap-3">
                    <ShieldCheck className="text-green-600 shrink-0 mt-0.5" size={18} />
                    <div>
                      <div className="text-xs font-black text-green-800 uppercase">Premium aktiv</div>
                      <p className="text-[10px] text-green-700 leading-tight">Du har tilgang til å slå opp eier via Maskinporten.</p>
                    </div>
                  </div>
                  <button 
                    onClick={lookupOwner}
                    disabled={ownerLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all"
                  >
                    {ownerLoading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : 'Hent eierinfo'}
                  </button>
                </div>
              )}

              {owner && (
                <div className="space-y-4 animate-scaleUp">
                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-wider">Navn</div>
                    <div className="font-black text-slate-900 text-lg uppercase">{owner.navn}</div>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-wider">Kommune</div>
                    <div className="font-black text-slate-900">{owner.kommune}</div>
                  </div>
                  <div className="flex items-center gap-1.5 p-3 bg-slate-50 rounded-lg text-slate-500 text-[10px] font-medium uppercase tracking-tighter">
                    <Info size={12} /> Oppslag loggført: {new Date(owner.timestamp).toLocaleTimeString('no-NO')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ResultItem: React.FC<{ icon: React.ReactNode, label: string, value?: any }> = ({ icon, label, value }) => {
  // Enhanced value formatting to strictly prevent objects from being rendered as children
  const displayValue = React.useMemo(() => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') {
      // If it's a known object structure (like what caused the error), pick a readable key
      if (value.egenvekt) return `${value.egenvekt} kg`;
      if (value.effekt) return `${value.effekt} kW`;
      // Fallback to JSON string for safety
      return JSON.stringify(value);
    }
    return String(value) || '-';
  }, [value]);

  return (
    <div className="flex gap-4">
      <div className="text-blue-500 bg-blue-50 p-2.5 rounded-xl h-fit">{icon}</div>
      <div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</div>
        <div className="font-black text-slate-700 text-lg leading-tight">{displayValue}</div>
      </div>
    </div>
  );
};

export default VehicleLookup;
