export type PapelUsuario = 'master' | 'admin' | 'vendedor';
export type TipoCliente = 'pessoa' | 'time' | 'escola' | 'empresa' | 'igreja' | 'outro';
export type FunilVenda = 'times_empresas' | 'escolas' | 'varejo';
export type CanalPedido = 'site' | 'whatsapp' | 'loja';

export type PedidoStatus =
  | 'novo'
  | 'orcamento_enviado'
  | 'criando_arte'
  | 'arte_em_aprovacao'
  | 'aguardando_lista'
  | 'aguardando_sinal'
  | 'em_producao'
  | 'pronto'
  | 'enviado'
  | 'entregue'
  | 'cancelado';

export type EtapaProducao = 'impressao' | 'prensa' | 'costura' | 'conferencia';
export type MetodoPagamento = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'boleto' | 'outro';
export type ModalidadeEnvio = 'retirada' | 'correios' | 'transportadora' | 'motoboy';
export type TipoConexaoWhatsapp = 'cloud_api' | 'nao_oficial' | 'manual';
export type StatusMensagem = 'pendente' | 'enviada' | 'entregue' | 'lida' | 'falhou' | 'manual';

export interface Perfil {
  id: string;
  nome: string;
  papel: PapelUsuario;
  ativo: boolean;
  criado_em: string;
}

export interface Cliente {
  id: string;
  user_id?: string | null;
  tipo: TipoCliente;
  nome: string;
  email?: string | null;
  whatsapp?: string | null;
  documento?: string | null;
  cep?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  uf?: string | null;
  origem?: string | null;
  tags?: string[] | null;
  aceita_marketing?: boolean;
  criado_em: string;
  atualizado_em?: string;
}

export interface Pedido {
  id: string;
  numero: number;
  cliente_id: string;
  vendedor_id?: string | null;
  canal: CanalPedido;
  funil: FunilVenda;
  status: PedidoStatus;
  data_entrega?: string | null;
  prazo_producao?: string | null;
  sinal_percentual: number;
  valor_total: number;
  lista_confirmada_em?: string | null;
  entregue_em?: string | null;
  cancelado_em?: string | null;
  cancelado_motivo?: string | null;
  observacoes?: string | null;
  criado_em: string;
  atualizado_em: string;
  // Joins
  cliente?: Cliente;
  vendedor?: Perfil;
  itens?: PedidoItem[];
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  produto_id?: number | null;
  produto_nome: string;
  imagem_url?: string | null;
  tipo_peca: string;
  quantidade: number;
  preco_unitario: number;
  adicionais?: Record<string, any>;
}

export interface PedidoListaItem {
  id?: string;
  pedido_id?: string;
  item_id?: string | null;
  nome: string;
  numero: string;
  tamanho: string;
  observacao?: string | null;
}

export interface Orcamento {
  id: string;
  pedido_id: string;
  versao: number;
  valor_produtos: number;
  frete: number;
  desconto: number;
  valor_total: number;
  validade?: string | null;
  enviado_em?: string | null;
  aceito_em?: string | null;
  recusado_em?: string | null;
  criado_em: string;
}

export interface Arte {
  id: string;
  pedido_id: string;
  versao: number;
  arquivo_url: string;
  enviada_em: string;
  aprovada_em?: string | null;
  aprovada_por?: string | null;
  reprovada_em?: string | null;
  comentario_cliente?: string | null;
}

export interface Pagamento {
  id: string;
  pedido_id: string;
  valor: number;
  metodo: MetodoPagamento;
  comprovante_url?: string | null;
  confirmado_em?: string | null;
  registrado_por?: string | null;
  criado_em: string;
}

export interface Producao {
  pedido_id: string;
  etapa: EtapaProducao;
  iniciada_em: string;
  finalizada_em?: string | null;
}

export interface Envio {
  id: string;
  pedido_id: string;
  modalidade: ModalidadeEnvio;
  codigo_rastreio?: string | null;
  enviado_em: string;
  entregue_em?: string | null;
}

export interface PedidoEvento {
  id: number;
  pedido_id: string;
  status_anterior?: PedidoStatus | null;
  status_novo: PedidoStatus;
  autor?: string | null;
  criado_em: string;
}

export interface Tarefa {
  id: string;
  pedido_id?: string | null;
  cliente_id?: string | null;
  responsavel_id?: string | null;
  tipo: string;
  descricao: string;
  vence_em: string;
  concluida_em?: string | null;
  criado_em: string;
  // Joins
  pedido?: { numero: number };
  cliente?: { nome: string };
  responsavel?: { nome: string };
}

export interface WhatsappMensagem {
  id: string;
  conexao_id?: string | null;
  cliente_id?: string | null;
  pedido_id?: string | null;
  direcao: 'saida' | 'entrada';
  modelo_chave?: string | null;
  numero: string;
  texto: string;
  status: StatusMensagem;
  erro?: string | null;
  enviada_em?: string | null;
  criado_em: string;
  cliente?: { nome: string };
  pedido?: { numero: number };
}

export interface WhatsappConexao {
  id: string;
  nome: string;
  tipo: TipoConexaoWhatsapp;
  numero: string;
  ativa: boolean;
  padrao: boolean;
  config: Record<string, any>;
}

export interface MensagemModelo {
  id: string;
  chave: string;
  status_gatilho?: PedidoStatus | null;
  texto: string;
  template_meta?: string | null;
  ativo: boolean;
}

export interface Configuracao {
  chave: string;
  valor: string;
}

export const STATUS_LABELS: Record<PedidoStatus, string> = {
  novo: 'Recebido',
  orcamento_enviado: 'Orçamento Enviado',
  criando_arte: 'Criando Arte',
  arte_em_aprovacao: 'Arte em Aprovação',
  aguardando_lista: 'Aguardando Grade/Lista',
  aguardando_sinal: 'Aguardando Pagamento do Sinal',
  em_producao: 'Em Produção',
  pronto: 'Pronto para Envio',
  enviado: 'Pedido Enviado',
  entregue: 'Entregue com Sucesso',
  cancelado: 'Pedido Cancelado',
};

export const FUNIL_LABELS: Record<FunilVenda, string> = {
  times_empresas: 'Times & Empresas',
  escolas: 'Escolas & Turmas',
  varejo: 'Varejo / Geral',
};
