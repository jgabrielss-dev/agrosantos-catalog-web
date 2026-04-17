# Agrosantos Catalog - Web Interface

## 🚀 Missão
Este é o front-end do ecossistema Agrosantos. O objetivo deste repositório é consumir o banco de dados populado pelo [Pipeline ETL](https://github.com/jgabrielss-dev/agrosantos-data-pipeline) e entregar um catálogo de produtos de altíssima performance, com foco em estabilidade e velocidade de renderização em dispositivos móveis.

## 🛠️ Stack Técnica
- **Framework:** Next.js (App Router)
- **Linguagem:** TypeScript (Tipagem estática inegociável)
- **Estilização:** Tailwind CSS
- **BaaS / Banco de Dados:** Supabase (PostgreSQL)

## 🏗️ Decisões Arquiteturais

1. **Server-Side Rendering (SSR) Default:** O catálogo não utiliza abordagens tradicionais de Single Page Applications (SPA) com `useEffect` e telas de *loading*. A busca de dados (`fetch`) na tabela `produtos` do Supabase é feita diretamente em Server Components. Isso garante que o navegador do cliente receba o HTML já montado, zerando o *Layout Shift* e otimizando o SEO.

2. **Separação de Preocupações (Separation of Concerns):**
   Este front-end é estritamente "burro" em relação à origem dos dados. Ele não faz extração de planilhas nem processamento pesado. Ele confia plenamente na integridade da tabela `produtos` mantida pelo job assíncrono em Python do repositório de dados.

## 🔐 Configuração e Instalação

Para rodar este projeto localmente, você precisa espelhar a infraestrutura de nuvem.

**1. Instale as dependências:**
```bash
npm install

**2. Configure as variáveis de ambiente:**
Crie um arquivo .env.local na raiz do projeto. NUNCA utilize chaves service_role (Secret) neste repositório, pois variáveis NEXT_PUBLIC_ são expostas ao navegador.

Snippet de código
```bash
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_projeto
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_publica

**3. Inicie o servidor de desenvolvimento:**

´´´bash
npm run dev

O catálogo estará disponível em http://localhost:3000.

**📊 Roadmap**

[x] Sprint 3: Setup Next.js App Router, integração com Supabase Client e prova de conceito SSR.

[ ] Sprint 4: Implementação de barra de busca no banco e paginação para controle de carga (limite de banda).

[ ] Sprint 5: Refinamento de UI (Grid de cards e otimização de imagens).

Desenvolvido por João Gabriel | Análise e Desenvolvimento de Sistemas | Agrosantos Web
