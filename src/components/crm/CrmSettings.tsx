import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Settings, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { CONFIG } from '../../config';

export const CrmSettings: React.FC = () => {
  const [siteUrl, setSiteUrl] = useState('https://glsports.com.br');
  const [googleUrl, setGoogleUrl] = useState('https://g.page/r/COLE-AQUI/review');
  const [whatsappLoja, setWhatsappLoja] = useState('5513997011514');
  const [pixChave, setPixChave] = useState('(13) 99701-1514');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    const fetchConfigs = async () => {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.from('configuracoes').select('*');
        if (!error && data) {
          data.forEach((item) => {
            if (item.chave === 'site_url') setSiteUrl(item.valor);
            if (item.chave === 'avaliacao_google_url') setGoogleUrl(item.valor);
            if (item.chave === 'whatsapp_loja') setWhatsappLoja(item.valor);
            if (item.chave === 'pix_chave') setPixChave(item.valor);
          });
        }
      } catch (err) {
        console.warn('Erro ao carregar configurações:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return;

    setIsSaving(true);
    setFeedback(null);
    try {
      const items = [
        { chave: 'site_url', valor: siteUrl.trim() },
        { chave: 'avaliacao_google_url', valor: googleUrl.trim() },
        { chave: 'whatsapp_loja', valor: whatsappLoja.trim() },
        { chave: 'pix_chave', valor: pixChave.trim() },
      ];

      for (const it of items) {
        await supabase
          .from('configuracoes')
          .upsert(it, { onConflict: 'chave' });
      }

      setFeedback({ type: 'ok', text: 'Configurações salvas com sucesso!' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'err', text: err.message || 'Erro ao salvar configurações.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#A7ADB5] gap-3">
        <Loader2 className="w-8 h-8 text-[#58E707] animate-spin" />
        <span className="text-xs">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="border-b border-[#1D2026] pb-4">
        <h2 className="text-xl font-bold font-sport uppercase text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#58E707]" />
          Configurações da Loja & CRM
        </h2>
        <p className="text-xs text-[#A7ADB5] mt-0.5">
          Parâmetros globais para links de avaliação, WhatsApp oficial e chave Pix.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
            feedback.type === 'ok'
              ? 'bg-[#58E707]/15 border-[#58E707]/40 text-[#58E707]'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedback.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase mb-1">
            URL do Site Oficial (site_url)
          </label>
          <input
            type="url"
            required
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            className="w-full bg-[#0A0B0D] text-white p-3 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase mb-1">
            Link para Avaliação Google (avaliacao_google_url)
          </label>
          <input
            type="url"
            required
            value={googleUrl}
            onChange={(e) => setGoogleUrl(e.target.value)}
            className="w-full bg-[#0A0B0D] text-white p-3 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase mb-1">
            Número do WhatsApp da Loja (whatsapp_loja)
          </label>
          <input
            type="text"
            required
            value={whatsappLoja}
            onChange={(e) => setWhatsappLoja(e.target.value)}
            className="w-full bg-[#0A0B0D] text-white p-3 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#A7ADB5] uppercase mb-1">
            Chave Pix da Loja (para recebimento de sinal)
          </label>
          <input
            type="text"
            required
            value={pixChave}
            onChange={(e) => setPixChave(e.target.value)}
            className="w-full bg-[#0A0B0D] text-white p-3 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none font-mono"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="py-3 px-6 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] font-extrabold uppercase rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(88,231,7,0.3)]"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Salvar Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
