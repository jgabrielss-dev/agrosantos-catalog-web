import { createClient } from '@supabase/supabase-js';

// Instancia o cliente do Supabase usando as chaves públicas
// O "!" no final diz ao TypeScript que temos certeza de que a variável existe
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// O Next.js permite que componentes do servidor sejam funções assíncronas
export default async function Home() {
  
  // A Sonda: Puxa os dados direto do banco antes de renderizar a tela
  const { data: produtos, error } = await supabase
    .from('produtos')
    .select('nome, preco')
    .limit(25);

  // Tratamento brutal de erro: se falhar, mostre na tela.
  if (error) {
    return <main className="p-10 text-red-500">Erro no banco: {error.message}</main>;
  }

  // Renderização HTML limpa e tática
  return (
    <main className="p-10 font-sans text-gray-900 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Agrosantos - Prova de Conceito (Catálogo)</h1>
      <ul className="space-y-2">
        {produtos?.map((produto, index) => (
          <li key={index} className="p-3 border border-gray-300 rounded shadow-sm">
            <span className="font-semibold">{produto.nome}</span> 
            <span className="ml-4 text-green-700">
              R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}