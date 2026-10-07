import { CategoryId } from '../types';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  iconName: string; // Used with MaterialCommunityIcons
  color: string;
}

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  chatarra: {
    id: 'chatarra',
    label: 'Chatarra',
    iconName: 'hamburger',
    color: '#FF6347', 
  },
  saludable: {
    id: 'saludable',
    label: 'Saludable',
    iconName: 'leaf',
    color: '#4CAF50', 
  },
  dulce: {
    id: 'dulce',
    label: 'Dulce',
    iconName: 'cupcake',
    color: '#E040FB', 
  },
  platos_finos: {
    id: 'platos_finos',
    label: 'Finos',
    iconName: 'glass-wine',
    color: '#333333', 
  },
  casero: {
    id: 'casero',
    label: 'Casero',
    iconName: 'bowl-mix',
    color: '#FFC107', 
  },
  bebidas: {
    id: 'bebidas',
    label: 'Bebidas',
    iconName: 'coffee',
    color: '#03A9F4', 
  },
};
