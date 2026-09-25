import React, { useState } from 'react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  User as UserIcon,
  Mail,
  Calendar,
  KeyRound,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Unlink,
} from 'lucide-react';
import api from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  const handleGenerateToken = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/telegram-token');
      setLinkToken(res.data.linkToken);
      refreshUser();
    } catch (err) {
      console.error('Failed to generate token', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (confirm('Are you sure you want to disconnect your Telegram account?')) {
      setUnlinkLoading(true);
      try {
        await api.post('/auth/unlink-telegram');
        setLinkToken(null);
        refreshUser();
      } catch (err) {
        console.error('Failed to unlink Telegram', err);
      } finally {
        setUnlinkLoading(false);
      }
    }
  };

  const handleCopyCommand = () => {
    if (!linkToken) return;
    navigator.clipboard.writeText(`/start ${linkToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      <Header title="Account Settings" />

      <main className="p-6 space-y-6 max-w-4xl w-full mx-auto">
        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">{user?.name}</h3>
              <p className="text-xs text-slate-400">Account Overview</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Email</p>
                <p className="font-mono text-slate-200">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Joined</p>
                <p className="font-mono text-slate-200">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Integration Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Telegram Bot Integration</h3>
                <p className="text-xs text-slate-400">
                  Link your Telegram account to save notes, links, and documents directly
                </p>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                user?.telegramUserId
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  user?.telegramUserId ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              {user?.telegramUserId ? 'Connected' : 'Not Connected'}
            </div>
          </div>

          {user?.telegramUserId ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-200">Account Linked</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Telegram User ID: {user.telegramUserId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleUnlink}
                  disabled={unlinkLoading}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Unlink</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
                <p className="font-semibold text-slate-200">💡 How to use SecureDrop Telegram Bot:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Send text notes or URL links to the bot anytime to auto-save.</li>
                  <li>Use <code className="text-indigo-400">/save &lt;text&gt; --expires 2h</code> to set expiration.</li>
                  <li>Send documents or photos to save them as downloadable files.</li>
                  <li>Use <code className="text-indigo-400">/list</code>, <code className="text-indigo-400">/search</code>, or <code className="text-indigo-400">/delete</code>.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                To link your Telegram account, click below to generate a unique pairing token:
              </p>

              <button
                onClick={handleGenerateToken}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Generating Token...' : 'Generate Telegram Link Token'}</span>
              </button>

              {linkToken && (
                <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 space-y-3 animate-in fade-in">
                  <p className="text-xs font-semibold text-slate-200">
                    🔑 Your Unique Link Command:
                  </p>

                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs font-mono text-indigo-300 select-all">
                      /start {linkToken}
                    </code>
                    <button
                      onClick={handleCopyCommand}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Open your Telegram Bot and send the command above to pair your account instantly.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
