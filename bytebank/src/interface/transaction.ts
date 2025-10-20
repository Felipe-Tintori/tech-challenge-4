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
  createdAt: Date;
  status: string;
}
