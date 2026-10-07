import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserStats {
  xp: number;
}

const STATS_STORAGE_KEY = '@fooddex_user_stats';

export const calculateLevel = (xp: number) => {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
};

export const getXpForLevel = (level: number) => {
  return Math.pow(level - 1, 2) * 50;
};

export const getRankInfo = (level: number) => {
  if (level < 6) return { title: 'Novato del Sabor', icon: 'account-outline' };
  if (level < 16) return { title: 'Explorador Culinario', icon: 'compass-outline' };
  if (level < 31) return { title: 'Cazador de Antojos', icon: 'crosshairs' };
  if (level < 51) return { title: 'Gourmet Aficionado', icon: 'silverware-fork-knife' };
  if (level < 81) return { title: 'Crítico Experto', icon: 'glasses' };
  if (level < 100) return { title: 'Maestro Degustador', icon: 'chef-hat' };
  return { title: 'Leyenda Gastronómica', icon: 'crown' };
};

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>({ xp: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STATS_STORAGE_KEY);
      if (stored) {
        setStats(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading stats', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const addXp = async (amount: number) => {
    try {
      const stored = await AsyncStorage.getItem(STATS_STORAGE_KEY);
      const currentStats = stored ? JSON.parse(stored) : { xp: 0 };
      const newXp = currentStats.xp + amount;
      const newStats = { xp: newXp };
      
      await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));
      setStats(newStats);
      
      const oldLevel = calculateLevel(currentStats.xp);
      const newLevel = calculateLevel(newXp);
      return newLevel > oldLevel;
    } catch (e) {
      console.error('Error saving stats', e);
      return false;
    }
  };

  return {
    stats,
    isLoading,
    addXp,
    level: calculateLevel(stats.xp),
    rank: getRankInfo(calculateLevel(stats.xp)),
  };
}
