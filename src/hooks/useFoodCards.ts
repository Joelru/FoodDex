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
    const subscription = import('react-native').then(({ DeviceEventEmitter }) => {
      return DeviceEventEmitter.addListener('cards_updated', loadCards);
    });
    return () => {
      subscription.then(sub => sub.remove());
    };
  }, [loadCards]);

  const emitUpdate = () => {
    import('react-native').then(({ DeviceEventEmitter }) => {
      DeviceEventEmitter.emit('cards_updated');
    });
  };

  const addCard = async (cardData: Omit<FoodCard, 'id'>) => {
    const newCard = await Storage.saveCard(cardData);
    setCards((prevCards) => [newCard, ...prevCards]);
    emitUpdate();
    return newCard;
  };

  const removeCard = async (id: string) => {
    await Storage.deleteCard(id);
    setCards((prevCards) => prevCards.filter((c) => c.id !== id));
    emitUpdate();
  };

  const editCard = async (id: string, updates: Partial<FoodCard>) => {
    const updatedCard = await Storage.updateCard(id, updates);
    if (updatedCard) {
      setCards((prevCards) => prevCards.map((c) => (c.id === id ? updatedCard : c)));
      emitUpdate();
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
