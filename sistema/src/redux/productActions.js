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
        // 🔓 ELIMINADO EL FILTRO .eq('disponible', true) 
        // Ahora descargamos TODO para poder mostrar los productos "Agotados"
        .order('fecha', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map(item => ({
        id: item.id,
        name: item.nombre,
        nombre: item.nombre, 
        description: item.descripcion,
        
        // ✅ CRUCIAL: Mantenemos el valor real (true o false) para que la Card sepa qué hacer
        disponible: item.disponible,
        categoria: item.categoria, 

        precio_original: Number(item.precio_original),
        precio_oferta: Number(item.precio_oferta),
        precio: Number(item.precio_oferta || item.precio_original),

        images: item.imagen_url
          ? [item.imagen_url]
          : ['/default-image.png'],
        
        imagen_url: item.imagen_url,
        rating: [{ rating: 4 }],
        createdAt: item.fecha,
      }));

      return formattedData;

    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);