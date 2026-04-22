import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import GerenciadorDestaques from './GerenciadorDestaques';
import GerenciadorAuditoria from './GerenciadorAuditoria';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// --- SERVER ACTIONS ---

async function autenticar(formData: FormData) {
  'use server';
  const senhaDigitada = formData.get('senha');
  if (senhaDigitada === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('agrosantos_auth', 'liberado', { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });
    redirect('/adm');
  }
}

async function fazerLogout() {
  'use server';
  const cookieStore = await cookies();
  cookieStore.delete('agrosantos_auth');
  redirect('/adm');
}

async function adicionarDestaque(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const contexto = formData.get('contexto') as string;
  
  // AQUI ESTÁ A MÁGICA: Usando a chave secreta do servidor para contornar o RLS
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );
  
  const { error } = await adminSupabase.from('vitrine').upsert({ produto_id: id, contexto: contexto });
  
  if (error) {
    console.error("Erro ao adicionar destaque:", error);
  }

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/');
  revalidatePath('/adm');
}

async function removerDestaque(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const contexto = formData.get('contexto') as string;
  
  // Usando a chave secreta do servidor
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { error } = await adminSupabase.from('vitrine').delete().match({ produto_id: id, contexto: contexto });

  if (error) {
    console.error("Erro ao remover destaque:", error);
  }

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/');
  revalidatePath('/adm');
}

async function atualizarProdutoManual(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const nome = formData.get('nome') as string;
  const preco = parseFloat(formData.get('preco') as string);
  const categoria = formData.get('categoria') as string;
  const file = formData.get('imagem_file') as File;

  const adminSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  // Prepara o objeto básico de atualização
  let updateData: any = {
    nome: nome.toUpperCase(),
    preco: preco,
    categoria: categoria.toUpperCase()
  };

  // Se o usuário selecionou um arquivo de imagem...
  if (file && file.size > 0) {
    // 1. Converte para buffer binário
    const fileBuffer = await file.arrayBuffer();
    
    // 2. Extrai a extensão e renomeia para o ID (ex: 302.jpg)
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${id}.${fileExt}`;

    // 3. Faz o upload forçando a substituição (upsert)
    const { error: uploadError } = await adminSupabase.storage
      .from('catalog-images')
      .upload(filePath, fileBuffer, { 
        upsert: true, 
        contentType: file.type 
      });

    if (uploadError) {
      console.error("Erro no upload da imagem:", uploadError);
    } else {
      // 4. Se deu certo, pega o link público e injeta no objeto de atualização
      const { data: publicUrlData } = adminSupabase.storage.from('catalog-images').getPublicUrl(filePath);
      
      // CACHE BUSTING: Adicionamos um timestamp na URL. 
      // Isso força o Next.js a invalidar o cache e baixar a nova imagem instantaneamente.
      updateData.url_imagem = `${publicUrlData.publicUrl}?v=${Date.now()}`;
    }
  }

  // 5. Salva no banco de dados (com ou sem a nova URL de imagem)
  await adminSupabase
    .from('produtos')
    .update(updateData)
    .eq('id', id);

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/');
  revalidatePath('/adm');
}

// --- PÁGINA ---

export default async function AdminPage(props: { searchParams: Promise<{ contexto?: string }> }) {
  const cookieStore = await cookies();
  if (cookieStore.get('agrosantos_auth')?.value !== 'liberado') {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <form action={autenticar} className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md">
          <h1 className="text-2xl font-bold text-white text-center mb-6">Acesso Restrito</h1>
          <input type="password" name="senha" placeholder="Senha mestre" className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white mb-6" required />
          <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-xl">Entrar</button>
        </form>
      </main>
    );
  }

  const searchParams = await props.searchParams;
  const contextoAtivo = searchParams?.contexto || 'GLOBAL';

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Busca as categorias únicas para popular o dropdown
  const { data: categoriasData } = await supabase.rpc('listar_categorias_unicas');
  const listaCategorias = categoriasData ? categoriasData.map((c: any) => c.categoria) : [];

  // Busca os produtos APENAS da vitrine selecionada no dropdown
  const { data: vitrineRaw } = await supabase
    .from('vitrine')
    .select('produtos(id, nome)')
    .eq('contexto', contextoAtivo);

  const produtosNaVitrine = vitrineRaw?.map((v: any) => v.produtos).filter(Boolean) || [];

  return (
    <main className="min-h-screen bg-gray-100 pb-20">
      <header className="bg-gray-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Painel de Controle</h1>
        <form action={fazerLogout}>
          <button type="submit" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-bold">Sair do Sistema</button>
        </form>
      </header>

      <div className="max-w-6xl mx-auto p-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Gestor de Vitrines Múltiplas
            </h2>
            <GerenciadorDestaques 
              produtosNaVitrine={produtosNaVitrine}
              adicionarAction={adicionarDestaque}
              removerAction={removerDestaque}
              categoriasDisponiveis={listaCategorias}
              contextoAtivo={contextoAtivo}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-200">
              <h2 className="text-md font-bold text-blue-900 mb-2">Motor ETL</h2>
              <a href="#" className="block text-center bg-blue-600 text-white py-2 rounded-lg text-sm font-bold">Abrir Nuvem</a>
            </div>
          </div>
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-2">
            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Auditoria de Produtos (Edição Manual)
            </h2>
            <p className="text-xs text-gray-500 mb-6">Altere preços, corrija nomes ou insira links manuais de imagens ignorando o ETL.</p>
            
            <GerenciadorAuditoria atualizarAction={atualizarProdutoManual} />
          </div>
        </div>
      </div>
    </main>
  );
}