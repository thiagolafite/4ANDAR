import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Clock, AlertCircle, ArrowRight, Sparkles, Moon, Sun } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, currentUser, theme, toggleTheme } = useApp();

  // Se já estiver logado, redireciona diretamente para o sistema
  React.useEffect(() => {
    if (isAuthenticated && currentUser) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  const [identifier, setIdentifier] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !senha) {
      setErrorMsg('Informe seu e-mail/usuário e sua senha.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setPendingNotice(null);

    try {
      const res = await login(identifier.trim(), senha);
      setLoading(false);

      if (res && res.success) {
        navigate('/');
      } else if (res && res.status === 'pendente') {
        setPendingNotice(res.error || 'Seu cadastro está aguardando aprovação do Administrador Master (Thiago Lafite).');
      } else {
        setErrorMsg(res?.error || 'Credenciais inválidas. Verifique seu login e senha.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Erro inesperado ao realizar login.');
    }
  };

  const handleQuickMasterLogin = async () => {
    setIdentifier('thiagolafite');
    setSenha('admin123');
    setErrorMsg(null);
    setPendingNotice(null);
    setLoading(true);
    try {
      const res = await login('thiagolafite', 'admin123');
      setLoading(false);
      if (res && res.success) {
        navigate('/');
      } else {
        setErrorMsg(res?.error || 'Erro ao entrar como Administrador Master.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Erro inesperado ao entrar como Master.');
    }
  };

  return (
    <div className="min-h-screen bg-radial from-[#fff8f0] via-[#fffdfa] to-[#fdeddc] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 select-none relative transition-colors duration-200">
      {/* Floating Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:border-brand-400 transition-all cursor-pointer"
          title={theme === 'dark' ? 'Mudar para Modo Claro (☀️)' : 'Mudar para Modo Noturno (🌙)'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600" />
          )}
          <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Noturno'}</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Top Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-white dark:bg-slate-800 shadow-md border-2 border-orange-200/80 dark:border-slate-700 p-2 mb-4 hover:scale-105 transition-transform">
            <img
              src="/logo-4andar.png"
              alt="4ANDAR"
              className="h-full w-full object-contain rounded-full"
            />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            4ANDAR <span className="text-brand-600 font-extrabold">•</span> Gestão Escolar
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Acesse sua conta para gerenciar turmas, presenças e aulas
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-950/5 border border-orange-100 relative overflow-hidden">
          {/* Subtle Golden Glow Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-amber-500 to-brand-600" />

          {/* Pending Approval Notice */}
          {pendingNotice && (
            <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-900 animate-fadeIn">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Aguardando Aprovação</h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">{pendingNotice}</p>
                  <p className="text-[11px] text-amber-700/90 mt-2 italic">
                    O Administrador Master (Thiago Lafite) precisa definir suas permissões antes de liberar o acesso.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorMsg && (
            <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-800 flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Login / Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                E-mail ou Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="thiagolafite ou seu@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Senha
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-brand-600 hover:from-orange-700 hover:to-brand-700 text-white text-sm font-bold shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Master Admin Fast Fill Preset */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickMasterLogin}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer group"
            >
              <Sparkles className="h-4 w-4 text-amber-600 group-hover:scale-110 transition-transform" />
              <span>Entrar como Administrador Master (Thiago Lafite)</span>
            </button>
          </div>

          {/* Link to Register */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500">
              Ainda não tem cadastro?{' '}
              <Link
                to="/cadastro"
                className="font-bold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Cadastre-se e solicite acesso
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Controle de Acessos & Permissões Seguras • 4ANDAR</span>
        </div>
      </div>
    </div>
  );
};
