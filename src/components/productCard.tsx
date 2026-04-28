"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/store/useCart';

export function ProductCard({ produto }: { produto: any }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [quantidade, setQuantidade] = useState(1);
  const adicionarItem = useCart((state) => state.adicionarItem);

  const handleAdd = () => {
    adicionarItem({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco
    }, quantidade);
    setModalAberto(false);
    setQuantidade(1);
  };

  return (
    <>
      <div 
        onClick={() => setModalAberto(true)}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col"
      >
        <div className="relative aspect-square bg-white p-4">
          {produto.url_imagem ? (
            <Image src={produto.url_imagem.replace('.co//storage', '.co/storage')} alt={produto.nome} fill className="object-contain p-2" sizes="(max-width: 768px) 50vw, 25vw" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-xs">Sem Imagem</div>
          )}
        </div>
        <div className="p-3 flex-1 flex flex-col justify-between">
          <h2 className="text-sm font-semibold text-gray-700 line-clamp-2 h-10 mb-2">{produto.nome}</h2>
          <span className="text-lg font-bold text-green-600">
            R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>

      {/* Modal do Produto */}
      {modalAberto && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 leading-tight">{produto.nome}</h3>
            <p className="text-2xl font-bold text-green-600 mb-6">R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</p>
            
            <div className="flex items-center justify-between mb-8 bg-gray-100 rounded-xl p-2 border">
              <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="w-12 h-12 text-2xl font-bold text-gray-600 bg-white rounded-lg shadow-sm">-</button>
              <span className="text-xl font-bold">{quantidade}</span>
              <button onClick={() => setQuantidade(quantidade + 1)} className="w-12 h-12 text-2xl font-bold text-gray-600 bg-white rounded-lg shadow-sm">+</button>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setModalAberto(false)} className="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl">Cancelar</button>
              <button onClick={handleAdd} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow-md">Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}