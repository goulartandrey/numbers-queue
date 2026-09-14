export enum NumberType {
  NORMAL = "normal",
  PRIORITY = "priority",
}

export interface CreateNumberDto {
  name: string;
  cpf: string;
  type: NumberType;
}

export interface PanelData {
  current: string | null;
  lastCalls: string[];
}

export interface PendingItem {
  id: string;
  name: string;
  cpf: string;
  type: string;
  queueNumber: string;
  createdAt: string;
}
