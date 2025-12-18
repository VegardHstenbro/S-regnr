
import React from 'react';
import { AuditLog } from '../types';
import { Clock, User, Fingerprint, Shield, Trash2 } from 'lucide-react';

interface Props {
  logs: AuditLog[];
}

const AuditLogView: React.FC<Props> = ({ logs }) => {
  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Audit Logs</h2>
          <p className="text-slate-500">Loggførte oppslag de siste 30 dagene (GDPR-kompatibel).</p>
        </div>
        <button className="text-red-600 hover:text-red-700 text-sm font-bold flex items-center gap-2">
          <Trash2 size={16} />
          Slett alle logger
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest">
              <th className="px-6 py-4">Tidspunkt</th>
              <th className="px-6 py-4">Bruker</th>
              <th className="px-6 py-4">Hashed Regnr</th>
              <th className="px-6 py-4">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                  Ingen logger å vise. Start et søk for å generere trafikk.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <Clock size={14} className="text-slate-400" />
                    {new Date(log.timestamp).toLocaleString('no-NO')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-900 font-bold">
                      <User size={14} className="text-blue-500" />
                      {log.userId}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      <Fingerprint size={12} />
                      {log.regnrHash}...
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      log.type === 'owner' 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                        : 'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      {log.type === 'owner' ? 'Eieroppslag' : 'Teknisk'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100">
        <Shield size={14} />
        Dette loggsystemet bruker <code>wp_hash()</code> for å maskere kjennemerker i databasen i henhold til personvernhensyn.
      </div>
    </div>
  );
};

export default AuditLogView;
