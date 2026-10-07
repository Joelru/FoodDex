import React, { useCallback, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFoodCards } from '../hooks/useFoodCards';
import { useUserStats, getXpForLevel } from '../hooks/useUserStats';
import FoodCardItem from '../components/FoodCardItem';
import Tutorial from '../components/Tutorial';
import { CATEGORIES } from '../constants/Categories';
import { CategoryId } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GalleryScreen() {
  const router = useRouter();
  const { cards, isLoading, reloadCards } = useFoodCards();
  const { stats, level, loadStats } = useUserStats();
  const [activeFilter, setActiveFilter] = useState<CategoryId | 'todas'>('todas');
  const revealAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      reloadCards();
      loadStats();
      // Reset animation when coming back
      revealAnim.setValue(0);
    }, [reloadCards, loadStats])
  );

  const handleFabPress = () => {
    Animated.timing(revealAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      router.push('/create');
    });
  };

  const filteredCards = cards.filter(card => 
    activeFilter === 'todas' ? true : card.categoria === activeFilter
  );

  const openViewer = (initialIndex: number) => {
    // Navigate to viewer and pass the index and filter so it knows the order
    router.push({
      pathname: '/viewer',
      params: { index: initialIndex, filter: activeFilter }
    });
  };

  const xpForNextLevel = getXpForLevel(level + 1);
  const progressPercent = Math.min(100, Math.max(0, (stats.xp / xpForNextLevel) * 100));

  if (isLoading && cards.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Barajando cartas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Tu FoodDex</Text>
        <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileBtn}>
          <MaterialCommunityIcons name="card-account-details-star-outline" size={32} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.miniProgressContainer}>
        <View style={styles.miniProgressHeader}>
          <Text style={styles.miniProgressLevel}>Nivel {level}</Text>
          <Text style={styles.miniProgressXp}>{stats.xp} / {xpForNextLevel} XP</Text>
        </View>
        <View style={styles.miniProgressBarBg}>
          <View style={[styles.miniProgressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterPill, activeFilter === 'todas' && styles.filterPillActive]}
            onPress={() => setActiveFilter('todas')}
          >
            <MaterialCommunityIcons 
              name="cards-playing-outline" 
              size={16} 
              color={activeFilter === 'todas' ? '#fff' : '#555'} 
              style={styles.filterIcon}
            />
            <Text style={[styles.filterText, activeFilter === 'todas' && styles.filterTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          
          {Object.values(CATEGORIES).map(cat => (
            <TouchableOpacity 
              key={cat.id}
              style={[
                styles.filterPill, 
                activeFilter === cat.id && [styles.filterPillActive, { backgroundColor: cat.color }]
              ]}
              onPress={() => setActiveFilter(cat.id)}
            >
              <MaterialCommunityIcons 
                name={cat.iconName as any} 
                size={16} 
                color={activeFilter === cat.id ? '#fff' : '#555'} 
                style={styles.filterIcon}
              />
              <Text style={[styles.filterText, activeFilter === cat.id && styles.filterTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Grid de Cartas */}
      {filteredCards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="cards-playing" size={80} color="#333" />
          <Text style={styles.emptyTitle}>Mazo Vacío</Text>
          <Text style={styles.emptySub}>
            {activeFilter === 'todas' 
              ? 'No tienes cartas aún. ¡Atrapa tu primera comida!' 
              : 'No tienes platillos de este elemento.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCards}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <FoodCardItem 
              card={item} 
              index={index} 
              onPress={() => openViewer(index)} 
            />
          )}
          numColumns={3}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row} 
        />
      )}

      {/* Animated Circular Reveal */}
      <Animated.View 
        style={[
          styles.revealCircle, 
          { 
            transform: [
              { 
                scale: revealAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 50] // Max scale to fill screen
                }) 
              }
            ],
            opacity: revealAnim.interpolate({
              inputRange: [0, 0.1, 1],
              outputRange: [0, 1, 1] // Ensure it's invisible at 0
            })
          }
        ]} 
        pointerEvents="none" 
      />

      {/* Botón Flotante */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleFabPress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="plus-thick" size={36} color="#333" />
      </TouchableOpacity>

      {/* Tutorial Overlay */}
      <Tutorial />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EAD6',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 8,
  },
  headerTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 36,
    color: '#333',
    textTransform: 'uppercase',
  },
  profileBtn: {
    padding: 8,
  },
  miniProgressContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  miniProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  miniProgressLevel: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#FF6347',
  },
  miniProgressXp: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: '#666',
  },
  miniProgressBarBg: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  miniProgressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0EAD6',
  },
  loadingText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
    color: '#333',
  },
  filterContainer: {
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  filterScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 3,
  },
  filterPillActive: {
    backgroundColor: '#333',
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#555',
    marginTop: 2,
  },
  filterTextActive: {
    color: '#fff',
  },
  row: {
    justifyContent: 'flex-start',
  },
  listContainer: {
    padding: 8,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 36,
    color: '#333',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  emptySub: {
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    backgroundColor: '#FF6347', // Tomato Red
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  revealCircle: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    backgroundColor: '#FF6347',
    borderRadius: 32,
    zIndex: 99, // Needs to cover the screen but be under the FAB
  },
});
