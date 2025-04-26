export interface Agendamento {
  id: string;
  nomeCliente: string;
  telefone: string;
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