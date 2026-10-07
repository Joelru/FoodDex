export type CategoryId = 'chatarra' | 'saludable' | 'dulce' | 'platos_finos' | 'casero' | 'bebidas';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface FoodCard {
  id: string;
  image_uri: string;
  nombre_plato?: string;
  nombre_restaurante?: string;
  categoria: CategoryId;
  calificacion: number; // 1 to 10
  precio: number; // 1 to 3
  volveria_a_comer_aqui: boolean;
  fecha_captura: string; // ISO 8601
  coordenadas?: Coordinates;
}
