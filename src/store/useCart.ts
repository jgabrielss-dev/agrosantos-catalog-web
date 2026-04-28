import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
}

interface CartStore {
  itens: CartItem[];
  isCartOpen: boolean;
  adicionarItem: (produto: Omit<CartItem, 'quantidade'>, quantidade: number) => void;
  removerItem: (id: string) => void;
  limparCarrinho: () => void;
  setCartOpen: (isOpen: boolean) => void;
  total: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      itens: [],
      isCartOpen: false,
      adicionarItem: (produto, quantidade) => {
        const itensAtuais = get().itens;
        const itemExistente = itensAtuais.find((i) => i.id === produto.id);
        
        if (itemExistente) {
          set({
            itens: itensAtuais.map((i) =>
              i.id === produto.id ? { ...i, quantidade: i.quantidade + quantidade } : i
            ),
          });
        } else {
          set({ itens: [...itensAtuais, { ...produto, quantidade }] });
        }
      },
      removerItem: (id) => {
        set({ itens: get().itens.filter((i) => i.id !== id) });
        // Se o carrinho esvaziar, fecha o modal automaticamente
        if (get().itens.length === 0) set({ isCartOpen: false });
      },
      limparCarrinho: () => set({ itens: [], isCartOpen: false }),
      setCartOpen: (isOpen) => {
        // Trava de segurança: não abre se estiver vazio
        if (isOpen && get().itens.length === 0) return;
        set({ isCartOpen: isOpen });
      },
      total: () => get().itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0),
    }),
    { name: 'agrosantos-cart' }
  )
);