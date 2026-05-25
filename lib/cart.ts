export type CartItem = {
  id: string;          // 💡 Ajusté en string pour correspondre aux modèles de l'API
  cartId: string;      // Rendu obligatoire pour sécuriser les actions de suppression
  name: string;
  price: number;
  qty: number;
  size: string;        // Rendu obligatoire pour éviter les indéfinis lors de la création de la clé
  image?: string;      // Prise en compte de l'image pour l'affichage de la miniature dans la page panier
};

// Helper pour éviter les erreurs lors du rendu côté serveur (SSR)
function isBrowser() {
  return typeof window !== "undefined";
}

// Déclenche l'actualisation synchrone des badges et composants sur le site
function dispatchCartUpdate() {
  if (isBrowser()) {
    window.dispatchEvent(new Event("cart-updated"));
  }
}

export function getCart(): CartItem[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch (e) {
    console.error("Erreur lecture localStorage:", e);
    return [];
  }
}

export function addToCart(product: Omit<CartItem, "qty" | "cartId">) {
  if (!isBrowser()) return;

  const cart = getCart();
  const generatedCartId = `${product.id}-${product.size}`;

  // On cherche si la même combinaison (Produit + Taille) est déjà présente
  const existing = cart.find((item) => item.cartId === generatedCartId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      ...product,
      qty: 1,
      cartId: generatedCartId
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  dispatchCartUpdate();
}

/**
 * Supprime un élément précis du panier en se basant sur son identifiant unique de ligne (id-taille)
 * pour éviter de supprimer accidentellement les autres tailles du même produit.
 */
export function removeFromCart(cartId: string) {
  if (!isBrowser()) return;

  const cart = getCart().filter((item) => item.cartId !== cartId);
  localStorage.setItem("cart", JSON.stringify(cart));
  dispatchCartUpdate();
}

/**
 * Ajuste manuellement la quantité d'une ligne du panier (utile pour les boutons +/- de la page Panier)
 */
export function updateQuantity(cartId: string, newQty: number) {
  if (!isBrowser()) return;
  if (newQty <= 0) {
    removeFromCart(cartId);
    return;
  }

  const cart = getCart().map((item) => {
    if (item.cartId === cartId) {
      return { ...item, qty: newQty };
    }
    return item;
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  dispatchCartUpdate();
}

export function clearCart() {
  if (!isBrowser()) return;
  localStorage.removeItem("cart");
  dispatchCartUpdate();
}