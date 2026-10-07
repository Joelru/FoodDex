import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FoodCard } from '../types';
import { CATEGORIES } from '../constants/Categories';

interface Props {
  card: FoodCard;
  index: number;
  onPress: () => void;
}

export default function FoodCardItem({ card, index, onPress }: Props) {
  const categoryInfo = CATEGORIES[card.categoria];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY, index]);

  const dateStr = new Date(card.fecha_captura).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });

  return (
    <Animated.View 
      style={[
        styles.cardWrapper,
        { 
          opacity: fadeAnim,
          transform: [{ translateY }]
        }
      ]}
    >
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={onPress}
        style={[styles.cardContainer, { backgroundColor: categoryInfo.color }]}
      >
        <View style={styles.innerBorder}>
          <View style={styles.cardHeader}>
            <Text style={styles.title} numberOfLines={1}>
              {card.nombre_plato || '???'}
            </Text>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name={categoryInfo.iconName as any} size={14} color="#333" />
            </View>
          </View>

          <View style={styles.imageWrapper}>
            {card.image_uri ? (
              <Image source={{ uri: card.image_uri }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name={categoryInfo.iconName as any} size={30} color="#ccc" />
              </View>
            )}
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{dateStr}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <View style={styles.statMiniBox}>
                <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
                <Text style={styles.statValue}>{card.calificacion > 0 ? card.calificacion : '?'}</Text>
              </View>
              
              <View style={styles.statMiniBox}>
                {card.precio > 0 ? Array(card.precio).fill(0).map((_, i) => (
                  <MaterialCommunityIcons key={i} name="currency-usd" size={12} color="#4CAF50" />
                )) : <Text style={[styles.statValue, {color: '#999'}]}>?</Text>}
              </View>

              <View style={styles.statMiniBox}>
                <MaterialCommunityIcons 
                  name={card.volveria_a_comer_aqui ? 'heart' : 'heart-broken'} 
                  size={12} 
                  color={card.volveria_a_comer_aqui ? '#E91E63' : '#9E9E9E'} 
                />
              </View>
            </View>
            
            <View style={styles.restaurantRow}>
              <MaterialCommunityIcons name="storefront-outline" size={12} color="#555" />
              <Text style={styles.restaurantText} numberOfLines={1}>
                {card.nombre_restaurante || 'Desconocido'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: '31%', // Prevents stretching when there's only 1 card
    marginHorizontal: '1.16%', // Distribute evenly
    marginBottom: 8,
  },
  cardContainer: {
    height: 160,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  innerBorder: {
    flex: 1,
    backgroundColor: '#FFFBEA',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#333',
    padding: 4,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: '#333',
    flex: 1,
    textTransform: 'uppercase',
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  imageWrapper: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: '#fff',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dateBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    borderTopLeftRadius: 4,
  },
  dateText: {
    fontFamily: 'VT323_400Regular',
    color: '#fff',
    fontSize: 10,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  statsContainer: {
    marginTop: 4,
    padding: 2,
    backgroundColor: '#fff',
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#333',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 2,
    marginBottom: 2,
  },
  statMiniBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: 'VT323_400Regular',
    fontSize: 14,
    color: '#333',
    marginLeft: 2,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 12,
    color: '#555',
    marginLeft: 4,
    flex: 1,
    textAlign: 'center',
  },
});
