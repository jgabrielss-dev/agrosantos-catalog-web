"use client";

import { useState } from 'react';
import { useCart } from '@/store/useCart';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function CartModal() {
  const { itens, isCartOpen, setCartOpen, removerItem, total, limparCarrinho } = useCart();
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!isCartOpen) return null;

  const handleFinalizar = () => {
    if (!nomeCliente.trim() || !telefoneCliente.trim()) {
      alert("Por favor, preencha seu nome e um telefone válido para contato.");
      return;
    }
    setEnviando(true);

    const valorTotal = total();
    
    // 1. Fire and Forget: Salva no banco de dados em segundo plano (Agora com Telefone)
    supabase.from('pedidos').insert({
      cliente_nome: nomeCliente,
      cliente_telefone: telefoneCliente,
      itens: itens,
      total: valorTotal
    }).then(({ error }) => {
      if(error) console.error("Falha ao salvar auditoria de pedido", error);
    });

    // 2. Monta a string do WhatsApp
    let texto = `*Novo Pedido - Agrosantos*\n*Cliente:* ${nomeCliente}\n*Contato:* ${telefoneCliente}\n\n`;
    
    itens.forEach(i => {
      const totalItem = (i.preco * i.quantidade).toFixed(2).replace('.', ',');
      texto += `${i.quantidade}X ${i.id} - ${i.nome} = R$ ${totalItem}\n`;
    });
    
    texto += `\n*Total do Pedido: R$ ${valorTotal.toFixed(2).replace('.', ',')}*`;

    // 3. Disparo Imediato Síncrono (Evita bloqueio do navegador)
    const numeroZap = "558282030404";
    const url = `https://wa.me/${numeroZap}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');

    limparCarrinho();
    setEnviando(false);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-white flex flex-col h-[100dvh]">
      {/* CABEÇALHO */}
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">Seu Carrinho</h2>
        <button onClick={() => setCartOpen(false)} className="p-2 text-gray-500 font-bold">X Fechar</button>
      </div>

      {/* 2/3 SUPERIORES: LISTA DE ITENS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {itens.map((item) => (
          <div key={item.id} className="flex justify-between items-center bg-white p-4 border rounded-xl shadow-sm">
            <div className="flex-1 pr-4">
              <p className="text-sm font-bold text-gray-800 line-clamp-2">{item.nome}</p>
              <p className="text-xs text-gray-500 mt-1">ID: {item.id} | Unit: R$ {item.preco.toFixed(2).replace('.', ',')}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-bold text-green-600">
                R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
              </span>
              <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-2 py-1">
                <span className="text-sm font-bold">{item.quantidade}x</span>
                <button onClick={() => removerItem(item.id)} className="text-red-500 text-xs font-bold px-2">Remover</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 1/3 INFERIOR: CHECKOUT */}
      <div className="border-t bg-gray-50 p-6 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Nome / Fazenda</label>
            <input 
              type="text" 
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              placeholder="Ex: João da Silva" 
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Seu WhatsApp</label>
            <input 
              type="tel" 
              value={telefoneCliente}
              onChange={(e) => setTelefoneCliente(e.target.value)}
              placeholder="(82) 9..." 
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        
        <div className="flex justify-between items-end mb-6">
          <span className="text-gray-600 font-bold uppercase text-sm">Total do Pedido</span>
          <span className="text-3xl font-black text-green-700">R$ {total().toFixed(2).replace('.', ',')}</span>
        </div>

        <button 
          onClick={handleFinalizar}
          disabled={enviando}
          className="w-full bg-green-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-green-700 shadow-lg"
        >
          {enviando ? "Processando..." : "ENVIAR PEDIDO PELO WHATSAPP"}
        </button>
      </div>
    </div>
  );
}