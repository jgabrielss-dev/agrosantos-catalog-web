"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GerenciadorDestaques({ 
  produtosNaVitrine, 
  adicionarAction, 
  removerAction,
  categoriasDisponiveis,
  contextoAtivo
}: any) {
  const router = useRouter();
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);

  const buscarNoCatalogo = async () => {
    if (!termo.trim()) return;
    setBuscando(true);
    
    // Se estivermos editando uma categoria específica, já filtra a busca por ela
    let query = supabase.from('produtos').select('id, nome, categoria').ilike('nome', `%${termo.toUpperCase()}%`);
    if (contextoAtivo !== 'GLOBAL') {
      query = query.eq('categoria', contextoAtivo);
    }
    
    const { data } = await query.limit(5);
    setResultados(data || []);
    setBuscando(false);
  };

  const mudarContexto = (novoContexto: string) => {
    router.push(`/adm?contexto=${novoContexto}`);
  };

  return (
    <div className="space-y-6">
      {/* SELETOR DE VITRINE */}
      <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Selecione a Vitrine para Editar:</label>
        <select 
          value={contextoAtivo}
          onChange={(e) => mudarContexto(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-green-500 font-bold text-gray-800"
        >
          <option value="GLOBAL">🌟 VITRINE PRINCIPAL (Home / Todas as Categorias)</option>
          {categoriasDisponiveis.map((cat: string) => (
            <option key={cat} value={cat}>📁 CATEGORIA: {cat}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BUSCA DE NOVOS PRODUTOS */}
        <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Pesquisar para Adicionar</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarNoCatalogo()}
              placeholder={contextoAtivo === 'GLOBAL' ? "Buscar no estoque todo..." : `Buscar em ${contextoAtivo}...`}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
            <button 
              onClick={buscarNoCatalogo}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black"
            >
              {buscando ? '...' : 'Buscar'}
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {resultados.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 bg-white rounded-lg border shadow-sm">
                <div className="flex flex-col overflow-hidden mr-2">
                  <span className="text-xs font-bold text-gray-700 truncate">{p.nome}</span>
                  <span className="text-[10px] text-gray-400">{p.categoria}</span>
                </div>
                <form action={adicionarAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="contexto" value={contextoAtivo} />
                  <button type="submit" className="text-green-600 text-xs font-black hover:underline whitespace-nowrap">
                    + FIXAR
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

        {/* LISTA DE DESTAQUES ATUAIS */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-xs font-bold text-blue-800 uppercase mb-3">
            Fixados em: {contextoAtivo} ({produtosNaVitrine.length})
          </p>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {produtosNaVitrine.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-white border border-blue-100 rounded-lg shadow-sm">
                <span className="text-xs font-bold text-gray-800 truncate pr-2">{p.nome}</span>
                <form action={removerAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="contexto" value={contextoAtivo} />
                  <button type="submit" className="text-red-500 text-[10px] font-black hover:bg-red-50 px-2 py-1 rounded">
                    X
                  </button>
                </form>
              </div>
            ))}
            {produtosNaVitrine.length === 0 && (
              <p className="text-center py-10 text-gray-400 text-xs italic border-2 border-dashed rounded-lg">
                Esta vitrine está vazia.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}