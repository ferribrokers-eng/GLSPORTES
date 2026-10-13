import React, { useState, useMemo } from 'react';
import { PedidoListaItem } from '../../lib/supabaseTypes';
import { 
  Plus, Trash2, Clipboard, AlertTriangle, Check, 
  Save, CheckCircle2, Download 
} from 'lucide-react';

interface Props {
  initialRows: PedidoListaItem[];
  isReadOnly?: boolean;
  onSaveDraft?: (rows: PedidoListaItem[]) => Promise<void>;
  onConfirmList?: (rows: PedidoListaItem[]) => Promise<void>;
  onExportCsv?: () => void;
}

const AVAILABLE_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'Infantil 2', 'Infantil 4', 'Infantil 6', 'Infantil 8', 'Infantil 10', 'Infantil 12', 'Infantil 14', 'Infantil 16'];

export const UniformListSpreadsheet: React.FC<Props> = ({
  initialRows,
  isReadOnly = false,
  onSaveDraft,
  onConfirmList,
  onExportCsv,
}) => {
  const [rows, setRows] = useState<PedidoListaItem[]>(
    initialRows.length > 0
      ? initialRows
      : [{ nome: '', numero: '', tamanho: 'M', observacao: '' }]
  );

  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Detecta números repetidos na lista
  const duplicateNumbers = useMemo(() => {
    const counts: Record<string, number> = {};
    rows.forEach((r) => {
      const num = r.numero?.trim();
      if (num) {
        counts[num] = (counts[num] || 0) + 1;
      }
    });

    const duplicates = new Set<string>();
    Object.entries(counts).forEach(([num, count]) => {
      if (count > 1) duplicates.add(num);
    });
    return duplicates;
  }, [rows]);

  // Contagem por tamanho
  const sizeTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    rows.forEach((r) => {
      const size = r.tamanho?.trim() || 'Outro';
      totals[size] = (totals[size] || 0) + 1;
    });
    return totals;
  }, [rows]);

  const addRow = () => {
    setRows([...rows, { nome: '', numero: '', tamanho: 'M', observacao: '' }]);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) {
      setRows([{ nome: '', numero: '', tamanho: 'M', observacao: '' }]);
      return;
    }
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof PedidoListaItem, value: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  // Colar direto do Excel ou WhatsApp: "Nome; Número; Tamanho" ou colunas separadas por tab/vírgula
  const handleApplyPaste = () => {
    if (!pasteText.trim()) return;

    const lines = pasteText.split('\n');
    const parsedRows: PedidoListaItem[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Suporta separador por tab (\t), ponto e vírgula (;), ou vírgula (,)
      let parts: string[] = [];
      if (trimmed.includes('\t')) {
        parts = trimmed.split('\t');
      } else if (trimmed.includes(';')) {
        parts = trimmed.split(';');
      } else if (trimmed.includes(',')) {
        parts = trimmed.split(',');
      } else {
        parts = [trimmed];
      }

      const nome = parts[0]?.trim() || '';
      const numero = parts[1]?.trim() || '';
      const tamanhoRaw = parts[2]?.trim().toUpperCase() || 'M';
      const observacao = parts[3]?.trim() || '';

      // Tenta normalizar o tamanho
      const matchedSize = AVAILABLE_SIZES.find((s) => s.toUpperCase() === tamanhoRaw) || 'M';

      if (nome || numero) {
        parsedRows.push({
          nome,
          numero,
          tamanho: matchedSize,
          observacao,
        });
      }
    });

    if (parsedRows.length > 0) {
      setRows(parsedRows);
      setPasteModalOpen(false);
      setPasteText('');
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;
    setIsSaving(true);
    try {
      await onSaveDraft(rows);
      setSaveSuccess('Rascunho salvo com sucesso!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmList = async () => {
    if (!onConfirmList) return;
    if (duplicateNumbers.size > 0) {
      if (!window.confirm('Existem números repetidos na lista. Deseja confirmar mesmo assim?')) {
        return;
      }
    }
    setIsSaving(true);
    try {
      await onConfirmList(rows);
      setSaveSuccess('Grade de uniformes confirmada para a produção!');
      setTimeout(() => setSaveSuccess(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Alerta de números repetidos */}
      {duplicateNumbers.size > 0 && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>
            <strong>Atenção:</strong> Os seguintes números estão repetidos na equipe:{' '}
            <strong className="text-white">
              {Array.from(duplicateNumbers).join(', ')}
            </strong>. Verifique para evitar duplicidades no jogo.
          </span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 bg-[#58E707]/15 border border-[#58E707]/40 rounded-xl flex items-center gap-2 text-[#58E707] text-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Ações superiores e Total por Tamanho */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A0B0D] p-3 rounded-2xl border border-[#1D2026]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-[#58E707]">
            Grade da Equipe ({rows.length} peças)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={() => setPasteModalOpen(true)}
                className="py-1.5 px-3 bg-[#14161A] hover:bg-[#1D2026] border border-[#1D2026] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5 text-[#58E707]" />
                <span>Colar do Excel / Zap</span>
              </button>

              <button
                type="button"
                onClick={addRow}
                className="py-1.5 px-3 bg-[#14161A] hover:bg-[#1D2026] border border-[#1D2026] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#58E707]" />
                <span>Adicionar Linha</span>
              </button>
            </>
          )}

          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="py-1.5 px-3 bg-[#14161A] hover:bg-[#1D2026] border border-[#1D2026] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#026FF6]" />
              <span>Exportar CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Resumo de Quantidades por Tamanho */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 bg-[#14161A] rounded-xl border border-[#1D2026] text-xs">
        <span className="text-[11px] font-bold text-[#A7ADB5] uppercase">
          Total por Tamanho:
        </span>
        {Object.entries(sizeTotals).map(([size, count]) => (
          <span
            key={size}
            className="px-2 py-0.5 bg-[#0A0B0D] border border-[#1D2026] rounded text-[11px] text-white"
          >
            <strong className="text-[#58E707]">{size}:</strong> {count}
          </span>
        ))}
      </div>

      {/* Tabela de Nomes, Números e Tamanhos */}
      <div className="overflow-x-auto border border-[#1D2026] rounded-2xl bg-[#0A0B0D]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1D2026] bg-[#14161A] text-[#A7ADB5] font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3">Nome na Camiseta</th>
              <th className="py-2.5 px-3 w-28">Número</th>
              <th className="py-2.5 px-3 w-36">Tamanho</th>
              <th className="py-2.5 px-3">Observações (opcional)</th>
              {!isReadOnly && <th className="py-2.5 px-3 w-12 text-center">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1D2026]">
            {rows.map((row, idx) => {
              const isDuplicated = row.numero?.trim() && duplicateNumbers.has(row.numero.trim());

              return (
                <tr key={idx} className="hover:bg-[#14161A]/40 transition-colors">
                  <td className="py-2 px-3 text-center text-[#A7ADB5] font-mono text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={row.nome}
                      onChange={(e) => updateRow(idx, 'nome', e.target.value)}
                      placeholder="Ex: SILVA"
                      className="w-full bg-[#14161A] text-white px-2.5 py-1.5 rounded-lg border border-[#1D2026] focus:border-[#58E707] focus:outline-none disabled:opacity-80"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={row.numero}
                      onChange={(e) => updateRow(idx, 'numero', e.target.value)}
                      placeholder="Ex: 10"
                      className={`w-full bg-[#14161A] text-white px-2.5 py-1.5 rounded-lg border focus:outline-none text-center font-bold ${
                        isDuplicated
                          ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                          : 'border-[#1D2026] focus:border-[#58E707]'
                      }`}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <select
                      disabled={isReadOnly}
                      value={row.tamanho}
                      onChange={(e) => updateRow(idx, 'tamanho', e.target.value)}
                      className="w-full bg-[#14161A] text-white px-2.5 py-1.5 rounded-lg border border-[#1D2026] focus:border-[#58E707] focus:outline-none"
                    >
                      {AVAILABLE_SIZES.map((sz) => (
                        <option key={sz} value={sz}>
                          {sz}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={row.observacao || ''}
                      onChange={(e) => updateRow(idx, 'observacao', e.target.value)}
                      placeholder="Ex: Manga Longa, Goleiro..."
                      className="w-full bg-[#14161A] text-white px-2.5 py-1.5 rounded-lg border border-[#1D2026] focus:border-[#58E707] focus:outline-none disabled:opacity-80"
                    />
                  </td>
                  {!isReadOnly && (
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="text-[#A7ADB5] hover:text-rose-400 p-1 cursor-pointer"
                        title="Remover linha"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Botões de Ação */}
      {!isReadOnly && (
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          {onSaveDraft && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveDraft}
              className="w-full sm:w-auto py-2.5 px-4 bg-[#14161A] hover:bg-[#1D2026] border border-[#1D2026] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#A7ADB5]" />
              <span>Salvar Rascunho</span>
            </button>
          )}

          {onConfirmList && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleConfirmList}
              className="w-full sm:w-auto py-2.5 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(88,231,7,0.3)] cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Confirmar Grade / Lista</span>
            </button>
          )}
        </div>
      )}

      {/* Modal para Colar do Excel / WhatsApp */}
      {pasteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#14161A] border border-[#1D2026] rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
              <Clipboard className="w-5 h-5 text-[#58E707]" />
              Colar Lista do Excel ou WhatsApp
            </h3>
            <p className="text-xs text-[#A7ADB5]">
              Cole os dados da sua lista. Cada linha deve conter uma pessoa no formato:<br />
              <code className="text-[#58E707] bg-[#0A0B0D] px-1 py-0.5 rounded">Nome; Número; Tamanho</code> ou copiado direto das colunas do Excel.
            </p>

            <textarea
              rows={8}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Exemplo:&#10;Pedro; 10; G&#10;Lucas; 7; M&#10;Marcos; 1; GG"
              className="w-full bg-[#0A0B0D] text-white text-xs p-3 rounded-xl border border-[#1D2026] focus:border-[#58E707] focus:outline-none font-mono"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPasteModalOpen(false)}
                className="py-2 px-4 bg-[#0A0B0D] text-[#A7ADB5] hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyPaste}
                className="py-2 px-5 bg-[#58E707] hover:bg-[#69f219] text-[#0A0B0D] rounded-xl text-xs font-extrabold uppercase cursor-pointer"
              >
                Importar Lista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
