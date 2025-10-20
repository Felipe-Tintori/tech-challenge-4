// src/customHook/usePaymentMethods.ts
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { IFirebaseCollection } from "../enum/firebaseCollection";

interface PaymentMethod {
  id: string;
  label: string;
  value: string;
}

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(
          collection(db, IFirebaseCollection.METHOD)
        );
        const paymentMethodsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PaymentMethod[];

        setPaymentMethods(paymentMethodsData);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar métodos de pagamento:", err);
        setError("Erro ao carregar métodos de pagamento");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  return { paymentMethods, loading, error };
}
