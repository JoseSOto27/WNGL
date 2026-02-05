import { createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../services/supabase';

// src/features/product/productActions.js
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) throw error;

const formattedData = (data || []).map(item => ({
  id: item.id,
  name: item.nombre,
  description: item.descripcion,
  
  // ✅ AQUÍ ESTABA EL FALLO: Agregamos la categoría que viene de la tabla
  categoria: item.categoria, 

  // ✅ ENVIAR AMBOS PRECIOS
  precio_original: Number(item.precio_original),
  precio_oferta: Number(item.precio_oferta),

  images: item.imagen_url
    ? [item.imagen_url]
    : ['/default-image.png'],

  rating: [{ rating: 4 }],
  createdAt: item.fecha,
}));

      return formattedData;

    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

