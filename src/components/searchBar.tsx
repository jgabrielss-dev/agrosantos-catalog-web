"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from '@/store/useCart';
import { ShoppingCart } from 'lucide-react';

// Agora o componente EXIGE que quem o chamar, entregue a lista de categorias.
export function SearchBar({ categoriasDisponiveis }: { categoriasDisponiveis: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const queryAtual = searchParams.get("q") || "";
  const categoriaAtual = searchParams.get("categoria") || "";

  const [busca, setBusca] = useState(queryAtual);
  const [categoria, setCategoria] = useState(categoriaAtual);

  const { itens, setCartOpen } = useCart();
  const qtdItens = itens.reduce((acc, i) => acc + i.quantidade, 0);

  
  useEffect(() => {
    setBusca(queryAtual);
    setCategoria(categoriaAtual);
  }, [queryAtual, categoriaAtual]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); 
    const params = new URLSearchParams();

    if (busca.trim()) params.set("q", busca.trim());
    if (categoria) params.set("categoria", categoria);

    if (params.toString()) {
      router.push(`/?${params.toString()}`);
    } else {
      router.push(`/`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row w-full gap-2">
      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-800 md:w-1/3 cursor-pointer"
      >
        <option value="">Todas as Categorias</option>
        {/* Renderiza a lista dinâmica que veio do servidor */}
        {categoriasDisponiveis.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Digite o produto..."
        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-800"
      />
      
      <button
        type="submit"
        className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
      >
        Filtrar
      </button>
      <button type="button"
      onClick={() => setCartOpen(true)}
      className="relative p-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200"
      >
      <ShoppingCart size={24} />
      {qtdItens > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
      {qtdItens}
      </span>
      )}
      </button>
    </form>
  );
}