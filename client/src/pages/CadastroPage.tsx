import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Mail, Lock, Phone, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck, Eye, EyeOff, Moon, Sun } from 'lucide-react';

export const CadastroPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, theme, toggleTheme } = useApp();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nome.trim() || !email.trim() || !senha) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
      return;
    }

    if (senha.length < 6) {
      setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (senha !== confirmSenha) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    const res = await register({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      telefone: telefone.trim(),
      cargo_pretendido: 'Aguardando Classificação do Master',
      senha
    });
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setErrorMsg(res.error || 'Erro ao realizar cadastro.');
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

      <div className="w-full max-w-lg">
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white dark:bg-slate-800 shadow-md border-2 border-orange-200/80 dark:border-slate-700 p-2 mb-3">
            <img
              src="/logo-4andar.png"
              alt="4ANDAR"
              className="h-full w-full object-contain rounded-full"
            />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Solicitação de Cadastro <span className="text-brand-600">•</span> 4ANDAR
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Preencha seus dados para solicitação de acesso. O Administrador Master atribuirá sua função (Secretaria, Aluno ou Professor) e liberará sua conta.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-950/5 border border-orange-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-amber-500 to-brand-600" />

          {submitted ? (
            /* Success State */
            <div className="text-center py-6 animate-fadeIn">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                Cadastro Enviado com Sucesso! 🎉
              </h3>

              <div className="my-5 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-left space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  <span>Aguardando Aprovação do Administrador Master</span>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  Sua conta foi registrada com o status <strong>Pendente</strong>. O Administrador Master (<strong>Thiago Lafite</strong>) receberá seu pedido no painel e irá:
                </p>
                <ul className="text-xs text-amber-800 list-disc list-inside space-y-1 pl-1">
                  <li>Atribuir sua função no sistema: <strong>Secretaria</strong>, <strong>Aluno</strong> ou <strong>Professor</strong>.</li>
                  <li>Liberar e configurar suas permissões de acesso aos módulos.</li>
                </ul>
              </div>

              <p className="text-xs text-slate-500 mb-6">
                Assim que seu cadastro for aprovado, basta entrar no sistema com seu e-mail e senha cadastrados.
              </p>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md shadow-brand-600/20 transition-all cursor-pointer"
              >
                Voltar para a Página de Login
              </button>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-rose-800 flex items-start gap-2.5 text-xs font-medium animate-fadeIn">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Nome Completo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  E-mail *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  WhatsApp / Telefone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Senha e Confirmação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Senha (mínimo 6) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmSenha}
                      onChange={(e) => setConfirmSenha(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Informative Note */}
              <div className="rounded-xl bg-orange-50/70 border border-orange-200/60 p-3 text-[11px] text-slate-600 leading-relaxed">
                ℹ️ <strong>Como funciona a liberação:</strong> Ao enviar seu cadastro, ele ficará pendente até que o <strong>Administrador Master (Thiago Lafite)</strong> aprove e defina sua atribuição (Secretaria, Aluno ou Professor) e configure suas permissões.
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-brand-600 hover:from-orange-700 hover:to-brand-700 text-white text-sm font-bold shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Enviar Solicitação de Cadastro</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Já tem uma conta? Fazer Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
