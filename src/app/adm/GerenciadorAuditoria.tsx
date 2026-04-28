"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GerenciadorAuditoria({ atualizarAction }: { atualizarAction: any }) {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<any | null>(null);

  const buscarParaAuditoria = async () => {
    if (!termo.trim()) return;
    setBuscando(true);
    setProdutoEditando(null);
    
    const { data } = await supabase
      .from('produtos')
      .select('*')
      .ilike('nome', `%${termo.toUpperCase()}%`)
      .limit(10);
    
    setResultados(data || []);
    setBuscando(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input 
          type="text" 
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscarParaAuditoria()}
          placeholder="Buscar produto para editar..." 
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={buscarParaAuditoria}
          className="bg-gray-800 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-black"
        >
          {buscando ? '...' : 'Buscar'}
        </button>
      </div>

      {!produtoEditando && resultados.length > 0 && (
        <div className="bg-gray-50 border rounded-xl overflow-hidden">
          {resultados.map((p) => (
            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b bg-white hover:bg-blue-50 transition-colors">
              <div className="flex flex-col mb-2 sm:mb-0">
                <span className="text-sm font-bold text-gray-800">{p.nome}</span>
                <span className="text-xs text-gray-500">ID: {p.id} | R$ {p.preco}</span>
              </div>
              <button 
                onClick={() => setProdutoEditando(p)}
                className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm"
              >
                EDITAR DADOS
              </button>
            </div>
          ))}
        </div>
      )}

      {produtoEditando && (
        <div className="bg-white p-5 rounded-xl border-2 border-blue-200 shadow-md">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-bold text-gray-800 uppercase text-sm">Modo de Edição</h3>
            <button onClick={() => setProdutoEditando(null)} className="text-gray-400 hover:text-red-500 font-bold text-xs">
              CANCELAR
            </button>
          </div>
          
          <form action={atualizarAction} onSubmit={() => setTimeout(() => setProdutoEditando(null), 500)} className="space-y-4">
            <input type="hidden" name="id" value={produtoEditando.id} />
            
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Nome do Produto</label>
              <input type="text" name="nome" defaultValue={produtoEditando.nome} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Preço (R$)</label>
                <input type="number" step="0.01" name="preco" defaultValue={produtoEditando.preco} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Categoria</label>
                <input type="text" name="categoria" defaultValue={produtoEditando.categoria} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border rounded-lg">
              <label className="block text-xs font-bold text-gray-600 mb-3">Imagem do Produto</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {produtoEditando.url_imagem ? (
                  <div className="shrink-0 bg-white p-1 border rounded-lg shadow-sm">
                    <img 
                      src={produtoEditando.url_imagem.replace('.co//storage', '.co/storage')} 
                      alt={produtoEditando.nome} 
                      className="w-20 h-20 object-contain rounded-md"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 w-20 h-20 flex items-center justify-center bg-gray-200 border rounded-lg shadow-sm">
                    <span className="text-[10px] text-gray-400 font-bold uppercase text-center leading-tight">Sem<br/>Foto</span>
                  </div>
                )}
                
                <div className="flex-1 w-full">
                  <input 
                    type="file" 
                    name="imagem_file" 
                    accept="image/png, image/jpeg, image/webp" 
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer transition-colors" 
                  />
                  <p className="text-[10px] text-gray-500 mt-2">
                    Faça o upload de uma nova imagem para substituir a atual.
                  </p>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
              SALVAR ALTERAÇÕES NO BANCO
            </button>
          </form>
        </div>
      )}
    </div>
  );
}