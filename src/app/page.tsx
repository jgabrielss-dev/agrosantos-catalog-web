export const dynamic = 'force-dynamic';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { SearchBar } from '@/components/searchBar';
import { ProductCard } from '@/components/productCard';
import { CartModal } from '@/components/cartModal';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function Home(props: { searchParams: Promise<{ q?: string, categoria?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || '';
  const categoria = searchParams?.categoria || '';
  
  const isBuscando = query !== '' || categoria !== '';

  const { data: categoriasData } = await supabase.rpc('listar_categorias_unicas');
  const listaCategorias = categoriasData ? categoriasData.map((c: any) => c.categoria) : [];

  let dbQuery = supabase.from('produtos').select('id, nome, preco, url_imagem').order('nome', { ascending: true });

  if (isBuscando) {
    if (categoria !== '' && query === '') {
      const { data: catVitrineData } = await supabase.from('vitrine').select('produto_id').eq('contexto', categoria.toUpperCase());
      const idsCategoria = catVitrineData ? catVitrineData.map(v => v.produto_id) : [];
      
      if (idsCategoria.length > 0) {
        dbQuery = dbQuery.in('id', idsCategoria);
      } else {
        dbQuery = dbQuery.in('id', ['VAZIO']);
      }
    } else {
      dbQuery = dbQuery.limit(60);
      const termoSanitizado = query.toUpperCase();
      dbQuery = dbQuery.ilike('nome', `%${termoSanitizado}%`);
      if (categoria) dbQuery = dbQuery.eq('categoria', categoria.toUpperCase());
    }
  } else {
    const { data: vitrineData } = await supabase.from('vitrine').select('produto_id').eq('contexto', 'GLOBAL');
    const idsDestaques = vitrineData ? vitrineData.map(v => v.produto_id) : [];
    
    if (idsDestaques.length > 0) {
      dbQuery = dbQuery.in('id', idsDestaques);
    } else {
      dbQuery = dbQuery.in('id', ['VAZIO']);
    }
  }
  const { data: produtos, error } = await dbQuery;

  if (error) {
    return <main className="p-10 text-red-500 text-center">Erro no banco: {error.message}</main>;
  }

  let tituloSecao = 'Produtos em Destaque';
  if (query && categoria) {
    tituloSecao = `Resultados para "${query}" em ${categoria}`;
  } else if (query) {
    tituloSecao = `Resultados para "${query}"`;
  } else if (categoria) {
    tituloSecao = `Destaques da Categoria: ${categoria}`;
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      
      {!isBuscando && (
        <section className="w-full bg-green-800 text-white min-h-[60vh] flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center">
            O Campo Mais Forte
          </h1>
          <p className="text-lg md:text-xl text-green-100 mb-8 text-center max-w-2xl">
            Encontre os melhores insumos e ferramentas agropecuárias de Alagoas direto no seu celular.
          </p>
          <div className="w-24 h-1 bg-green-400 rounded-full"></div>
        </section>
      )}

      <div className={`sticky top-0 z-[60] w-full px-4 transition-all ${!isBuscando ? '-mt-8 mb-8' : 'pt-6 mb-6'}`}>
        <div className="max-w-3xl mx-auto bg-white p-2 md:p-4 rounded-2xl shadow-xl border border-gray-100">
           <SearchBar categoriasDisponiveis={listaCategorias} />
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {tituloSecao}
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {produtos?.map((produto) => (
             <ProductCard key={produto.id} produto={produto} />
          ))}
        </div>

        {produtos?.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            {categoria !== '' && query === '' 
              ? `Os destaques de ${categoria} estão sendo preparados.` 
              : "Nenhum produto encontrado."}
          </div>
        )}
      </section>

      {/* MODAL DO CARRINHO FICA AQUI DENTRO DO MAIN */}
      <CartModal />
    </main>
  );
}