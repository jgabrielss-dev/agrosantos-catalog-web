"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ITEMS_POR_PAGINA = 10;

export default function GerenciadorPedidos() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [temMais, setTemMais] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('PENDENTE');

  const buscarPedidos = async (resetar = false) => {
    if (resetar) {
      setCarregando(true);
    } else {
      setCarregandoMais(true);
    }

    const paginaAtual = resetar ? 0 : pagina;
    const de = paginaAtual * ITEMS_POR_PAGINA;
    const ate = de + ITEMS_POR_PAGINA - 1;

    let query = supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false })
      .range(de, ate);

    // Aplica o filtro de status, a menos que "TODOS" esteja selecionado
    if (filtroStatus !== 'TODOS') {
      query = query.eq('status', filtroStatus);
    }

    const { data } = await query;

    const novosPedidos = data || [];

    if (resetar) {
      setPedidos(novosPedidos);
    } else {
      setPedidos((prev) => [...prev, ...novosPedidos]);
    }

    // Se vieram menos itens que o limite, significa que a lista do banco acabou
    setTemMais(novosPedidos.length === ITEMS_POR_PAGINA);
    setPagina(paginaAtual + 1);
    setCarregando(false);
    setCarregandoMais(false);
  };

  const atualizarStatus = async (id: string, novoStatus: string) => {
    // Atualização Otimista: Muda a UI na hora para não perder a posição do scroll
    setPedidos((prev) => prev.map((p) => p.id === id ? { ...p, status: novoStatus } : p));
    
    await supabase
      .from('pedidos')
      .update({ status: novoStatus })
      .eq('id', id);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    // Dispara a busca quando o scroll chegar a 10px do final da caixa
    if (scrollHeight - scrollTop <= clientHeight + 10 && temMais && !carregando && !carregandoMais) {
      buscarPedidos(false);
    }
  };

  // Re-executa a busca toda vez que o filtro for alterado
  useEffect(() => {
    buscarPedidos(true);
  }, [filtroStatus]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Gestão de Pedidos</h2>
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Menu Dropdown para Filtro de Status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="text-sm font-bold p-2 rounded-lg border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-gray-700 shadow-sm"
          >
            <option value="TODOS">🧾 TODOS OS PEDIDOS</option>
            <option value="PENDENTE">🟡 APENAS PENDENTES</option>
            <option value="CONCLUÍDO">🟢 APENAS CONCLUÍDOS</option>
            <option value="CANCELADO">🔴 APENAS CANCELADOS</option>
          </select>

          <button 
            onClick={() => buscarPedidos(true)}
            className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 shadow-sm"
          >
            {carregando ? 'Atualizando...' : 'Atualizar Lista'}
          </button>
        </div>
      </div>

      <div 
        className="grid gap-4 max-h-[600px] overflow-y-auto pr-2"
        onScroll={handleScroll}
      >
        {pedidos.map((pedido) => (
          <div key={pedido.id} className={`p-5 rounded-xl border-2 transition-all ${pedido.status === 'PENDENTE' ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-100 bg-white'}`}>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-3 h-3 rounded-full ${pedido.status === 'PENDENTE' ? 'bg-yellow-500' : pedido.status === 'CONCLUÍDO' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <h3 className="font-bold text-gray-900 uppercase text-sm">{pedido.cliente_nome}</h3>
                </div>
                <p className="text-xs text-gray-500">📞 {pedido.cliente_telefone}</p>
                <p className="text-[10px] text-gray-400 mt-1">Data: {new Date(pedido.created_at).toLocaleString('pt-BR')}</p>
              </div>
              
              <div className="flex flex-col md:items-end justify-between">
                <span className="text-xl font-black text-gray-800">R$ {Number(pedido.total).toFixed(2).replace('.', ',')}</span>
                <select 
                  value={pedido.status}
                  onChange={(e) => atualizarStatus(pedido.id, e.target.value)}
                  className="mt-2 text-xs font-bold p-2 rounded-lg border bg-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="PENDENTE">🟡 PENDENTE</option>
                  <option value="CONCLUÍDO">🟢 CONCLUÍDO</option>
                  <option value="CANCELADO">🔴 CANCELADO</option>
                </select>
              </div>
            </div>

            {/* LISTA DE ITENS DO PEDIDO */}
            <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Itens do Pedido:</p>
              <div className="space-y-1">
                {pedido.itens.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-xs text-gray-700">
                    <span>{item.quantidade}x <span className="font-medium">{item.nome}</span></span>
                    <span className="text-gray-400">R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {pedidos.length === 0 && !carregando && (
          <div className="text-center py-10 text-gray-400 italic">
            {filtroStatus === 'TODOS' 
              ? "Nenhum pedido registrado até o momento." 
              : `Nenhum pedido com status ${filtroStatus} encontrado.`}
          </div>
        )}

        {carregandoMais && (
          <div className="text-center py-4 text-sm font-bold text-blue-600 animate-pulse">
            Carregando mais pedidos...
          </div>
        )}
      </div>
    </div>
  );
}