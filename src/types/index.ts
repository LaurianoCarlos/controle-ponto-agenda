export interface Cliente {
  id: string;
  nome: string;
  apelido?: string;
  telefone: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
}

export interface Agendamento {
  id: string;
  clienteId: string;
  data: string;
  hora: string;
  servico: string;
  observacoes?: string;
}

export interface Ponto {
  id: string;
  data: string;
  entrada: Date;
  saida?: Date;
  entradaAlmoco?: Date;
  saidaAlmoco?: Date;
} 