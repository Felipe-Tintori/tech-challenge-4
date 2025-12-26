import { CategoryCollection } from "../enum/categoryCollection";

export interface ITransaction {
  id?: string;
  userId: string;
  category: CategoryCollection;
  categoryId: string;
  payment: string;
  paymentId: string;
  value: number;
  dataTransaction: string;
  comprovanteURL?: string | null;
  createdAt: string; // Mudando para string para serialização no Redux
  status: string;
}
