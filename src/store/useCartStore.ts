import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. O Contrato do Produto no Carrinho
export interface ProdutoCarrinho {
  nome: string;
  preco: number;
  quantidade: number;
}

// 2. O Contrato do Cofre (O que ele guarda e o que ele faz)
interface CartState {
  items: ProdutoCarrinho[];
  addItem: (produto: Omit<ProdutoCarrinho, 'quantidade'>) => void;
  removeItem: (nome: string) => void;
  clearCart: () => void;
}

// 3. A Implementação do Cofre
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      // Lógica para adicionar ou somar quantidade se já existir
      addItem: (produto) => set((state) => {
        const itemExistente = state.items.find((item) => item.nome === produto.nome);
        
        if (itemExistente) {
          return {
            items: state.items.map((item) =>
              item.nome === produto.nome
                ? { ...item, quantidade: item.quantidade + 1 }
                : item
            ),
          };
        }
        
        return { items: [...state.items, { ...produto, quantidade: 1 }] };
      }),

      // Remove o item completamente, independente da quantidade
      removeItem: (nome) => set((state) => ({
        items: state.items.filter((item) => item.nome !== nome),
      })),

      // Esvazia o carrinho (útil após fechar a venda no WhatsApp)
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'agrosantos-carrinho', // Nome do arquivo invisível no LocalStorage do navegador
    }
  )
);