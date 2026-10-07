import { useState, useEffect, useCallback } from 'react';
import { FoodCard } from '../types';
import * as Storage from '../storage';

export const useFoodCards = () => {
  const [cards, setCards] = useState<FoodCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await Storage.getCards();
      setCards(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const addCard = async (cardData: Omit<FoodCard, 'id'>) => {
    const newCard = await Storage.saveCard(cardData);
    setCards((prevCards) => [newCard, ...prevCards]);
    return newCard;
  };

  const removeCard = async (id: string) => {
    await Storage.deleteCard(id);
    setCards((prevCards) => prevCards.filter((c) => c.id !== id));
  };

  const editCard = async (id: string, updates: Partial<FoodCard>) => {
    const updatedCard = await Storage.updateCard(id, updates);
    if (updatedCard) {
      setCards((prevCards) => prevCards.map((c) => (c.id === id ? updatedCard : c)));
    }
    return updatedCard;
  };

  return {
    cards,
    isLoading,
    addCard,
    removeCard,
    editCard,
    reloadCards: loadCards,
  };
};
