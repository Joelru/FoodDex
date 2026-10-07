import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { FoodCard } from '../types';

const STORAGE_KEY = '@fooddex_cards';

export const saveCard = async (cardData: Omit<FoodCard, 'id'>): Promise<FoodCard> => {
  try {
    const newCard: FoodCard = {
      ...cardData,
      id: Crypto.randomUUID(),
      fecha_captura: cardData.fecha_captura || new Date().toISOString(),
    };

    const existingCards = await getCards();
    const updatedCards = [newCard, ...existingCards];

    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
    return newCard;
  } catch (error) {
    console.error('Error saving card:', error);
    throw error;
  }
};

export const getCards = async (): Promise<FoodCard[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data !== null) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error getting cards:', error);
    return [];
  }
};

export const deleteCard = async (id: string): Promise<void> => {
  try {
    const existingCards = await getCards();
    const updatedCards = existingCards.filter(card => card.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
  } catch (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
};

export const updateCard = async (id: string, updates: Partial<FoodCard>): Promise<FoodCard | null> => {
  try {
    const existingCards = await getCards();
    const cardIndex = existingCards.findIndex(card => card.id === id);
    if (cardIndex === -1) return null;

    const updatedCard = { ...existingCards[cardIndex], ...updates };
    existingCards[cardIndex] = updatedCard;

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingCards));
    return updatedCard;
  } catch (error) {
    console.error('Error updating card:', error);
    throw error;
  }
};

export const clearAllCards = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing cards:', error);
    throw error;
  }
};
