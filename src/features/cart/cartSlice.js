import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    total: 0,       // Cantidad total de productos
    cartItems: [],  // CAMBIO CLAVE: Ahora es un ARRAY para soportar extras y precios únicos
  },
  reducers: {
    addToCart: (state, action) => {
      // El payload ahora es el objeto completo: { id, name, precio, extras, quantity... }
      const item = action.payload;
      
      // Buscamos si ya existe exactamente el mismo producto con los mismos extras
      const existingItem = state.cartItems.find((i) => i.id === item.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        // Agregamos el nuevo producto (con sus extras y precio calculado)
        state.cartItems.push({ ...item, quantity: 1 });
      }
      state.total += 1;
    },

    // Quitar una unidad del producto
    removeFromCart: (state, action) => {
      const { productId } = action.payload; // Aquí productId es el ID único (con extras)
      const existingItem = state.cartItems.find((i) => i.id === productId);

      if (existingItem) {
        existingItem.quantity -= 1;
        state.total -= 1;
        if (existingItem.quantity <= 0) {
          state.cartItems = state.cartItems.filter((i) => i.id !== productId);
        }
      }
    },

    // Eliminar completamente un producto del carrito
    deleteItemFromCart: (state, action) => {
      const { productId } = action.payload;
      const existingItem = state.cartItems.find((i) => i.id === productId);
      
      if (existingItem) {
        state.total -= existingItem.quantity;
        state.cartItems = state.cartItems.filter((i) => i.id !== productId);
      }
    },

    // Vaciar todo el carrito
    clearCart: (state) => {
      state.cartItems = [];
      state.total = 0;
    },
  },
});

export const { addToCart, removeFromCart, deleteItemFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;