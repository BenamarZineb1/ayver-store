export type CartItem = {
  id: number;
  cartId?: string; // Identifiant unique pour le panier (ex: "123-M")
  name: string;
  price: number;
  qty: number;
  size?: string; // 💡 Prise en compte de la taille
};

// Helper safe pour vérifier si on est côté client (évite les erreurs SSR)
function isBrowser() {
  return typeof window !== "undefined";
}

export function getCart(): CartItem[] {
  if (!isBrowser()) return [];
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

export function addToCart(product: Omit<CartItem, "qty" | "cartId">) {
  if (!isBrowser()) return;

  const cart = getCart();

  // 💡 On cherche si le même produit AVEC la même taille existe déjà
  const existing = cart.find(
    (p) => p.id === product.id && p.size === product.size
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      ...product,
      qty: 1,
      cartId: `${product.id}-${product.size}` // Crée un ID unique basé sur produit + taille
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
}

// 💡 Mise à jour : on peut maintenant supprimer par l'ID de base,
// ou si on a plusieurs tailles, c'est encore mieux de filtrer plus précisément si besoin.
export function removeFromCart(id: number) {
  if (!isBrowser()) return;

  // Filtre en retirant l'item dont l'ID correspond
  const cart = getCart().filter((item) => item.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function clearCart() {
  if (!isBrowser()) return;
  localStorage.removeItem("cart");
}