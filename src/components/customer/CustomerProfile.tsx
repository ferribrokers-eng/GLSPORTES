import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const CustomerProfile: React.FC = () => {
  const { cliente, refreshUserData } = useAuth();

  const [nome, setNome] = useState(cliente?.nome || '');
  const [whatsapp, setWhatsapp] = useState(cliente?.whatsapp || '');
  const [documento, setDocumento] = useState(cliente?.documento || '');
  const [cep, setCep] = useState(cliente?.cep || '');
  const [endereco, setEndereco] = useState(cliente?.endereco || '');
  const [cidade, setCidade] = useState(cliente?.cidade || '');
  const [uf, setUf] = useState(cliente?.uf || '');
  const [aceitaMarketing, setAceitaMarketing] = useState(Boolean(cliente?.aceita_marketing));

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (cliente) {
      setNome(cliente.nome || '');
      setWhatsapp(cliente.whatsapp || '');
      setDocumento(cliente.documento || '');
      setCep(cliente.cep || '');
      setEndereco(cliente.endereco || '');
      setCidade(cliente.cidade || '');
      setUf(cliente.uf || '');
      setAceitaMarketing(Boolean(cliente.aceita_marketing));
    }
  }, [cliente]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente?.id || !isSupabaseConfigured) return;

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(false);

    try {
      const { error } = await supabase
        .from('clientes')
        .update({
          nome: nome.trim(),
          whatsapp: whatsapp.trim(),
          documento: documento.trim() || null,
          cep: cep.trim() || null,
          endereco: endereco.trim() || null,
          cidade: cidade.trim() || null,
          uf: uf.trim() || null,
          aceita_marketing: aceitaMarketing,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', cliente.id);

      if (error) throw error;

      await refreshUserData();
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao atualizar dados.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="border-b border-[#1D2026] pb-4">
        <h2 className="text-lg font-bold font-sport uppercase text-white flex items-center gap-2">
          <User className="w-5 h-5 text-[#58E707]" />
          Meus Dados Cadastrais
        </h2>
        <p className="text-xs text-[#A7ADB5] mt-0.5">
          Mantenha seus dados atualizados para emissão de pedidos e envio correto de mercadorias.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-[#58E707]/15 border border-[#58E707]/40 rounded-xl flex items-center gap-2.5 text-[#58E707] text-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>Dados atualizados com sucesso!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-[#0A0B0D] text-white px-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase mb-1">
              WhatsApp
            </label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full bg-[#0A0B0D] text-white px-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase mb-1">
              CPF ou CNPJ
            </label>
            <input
              type="text"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              className="w-full bg-[#0A0B0D] text-white px-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase mb-1">
              CEP
            </label>
            <input
              type="text"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              className="w-full bg-[#0A0B0D] text-white px-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase mb-1">
            Endereço Completo
          </label>
          <input
            type="text"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="w-full bg-[#0A0B0D] text-white px-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase mb-1">
              Cidade
            </label>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="w-full bg-[#0A0B0D] text-white px-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase mb-1">
              UF
            </label>
            <input
              type="text"
              maxLength={2}
              value={uf}
              onChange={(e) => setUf(e.target.value.toUpperCase())}
              className="w-full bg-[#0A0B0D] text-white px-3 py-2.5 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none uppercase text-center"
            />
          </div>
        </div>

        {/* WhatsApp marketing LGPD */}
        <div className="p-3 bg-[#0A0B0D] rounded-xl border border-[#1D2026] flex items-start gap-3">
          <input
            type="checkbox"
            id="mkt-edit"
            checked={aceitaMarketing}
            onChange={(e) => setAceitaMarketing(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded accent-[#58E707] cursor-pointer"
          />
          <label htmlFor="mkt-edit" className="text-[11px] text-[#A7ADB5] leading-snug cursor-pointer">
            Autorizo a GL Sports a me enviar novidades e notificações de promoções via WhatsApp.
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="py-2.5 px-6 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(88,231,7,0.3)] cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};
