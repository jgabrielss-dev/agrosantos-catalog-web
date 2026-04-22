import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agrosantos | Catálogo Digital",
  description: "Encontre os melhores produtos agropecuários em Maceió e região.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* Cabeçalho Universal */}
        <header className="bg-white border-b sticky top-0 z-[60]">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                A
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-800">Agrosantos</span>
            </div>
            
            <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
              <a href="/" className="hover:text-green-600 transition-colors">Início</a>
              <a href="#" className="hover:text-green-600 transition-colors">Categorias</a>
              <a href="#" className="hover:text-green-600 transition-colors">Contato</a>
            </nav>

            <button className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold md:hidden">
              Menu
            </button>
          </div>
        </header>

        {/* Conteúdo Dinâmico (Aqui entra o seu page.tsx) */}
        <main>{children}</main>

        {/* Rodapé Universal */}
        <footer className="bg-white border-t mt-20 py-10">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-sm text-gray-500">
              © 2026 Agrosantos - Soluções Agropecuárias.
            </p>
            <p className="text-xs text-gray-400 mt-2">Maceió - Alagoas</p>
          </div>
        </footer>
      </body>
    </html>
  );
}