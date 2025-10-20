// src/customHook/useCategories.ts
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { IFirebaseCollection } from "../enum/firebaseCollection";

interface Category {
  id: string;
  label: string;
  value: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(
          collection(db, IFirebaseCollection.CATEGORY)
        );
        const categoriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];

        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
        setError("Erro ao carregar categorias");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
