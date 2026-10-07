import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, Linking, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFoodCards } from '../hooks/useFoodCards';
import { CATEGORIES } from '../constants/Categories';

const { width, height } = Dimensions.get('window');

function ViewerItem({ item, editCard, removeCard, goBack }: { item: any, editCard: (id: string, updates: any) => void, removeCard: (id: string) => Promise<void>, goBack: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.nombre_plato || '');
  const categoryInfo = CATEGORIES[item.categoria as keyof typeof CATEGORIES];
  const dateStr = new Date(item.fecha_captura).toLocaleString('es-ES', { 
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const handleSaveName = () => {
    setIsEditing(false);
    if (editName.trim() !== item.nombre_plato) {
      editCard(item.id, { nombre_plato: editName.trim() });
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Eliminar Tarjeta",
      "¿Estás seguro de que quieres eliminar esta carta de tu FoodDex? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            await removeCard(item.id);
            goBack();
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.pageContainer} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {item.image_uri ? (
        <Image source={{ uri: item.image_uri }} style={styles.fullImage} resizeMode="contain" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <MaterialCommunityIcons name={categoryInfo.iconName as any} size={80} color="#666" />
        </View>
      )}

      {/* Delete Button */}
      <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
        <Text style={styles.pixelTrashIcon}>🗑</Text>
      </TouchableOpacity>

      <View style={styles.overlay}>
        <View style={[styles.cardInfo, { borderColor: categoryInfo.color }]}>
          <View style={styles.infoHeader}>
            {isEditing ? (
              <TextInput 
                style={styles.titleInput}
                value={editName}
                onChangeText={setEditName}
                autoFocus
                onBlur={handleSaveName}
                onSubmitEditing={handleSaveName}
                autoCorrect={false}
                spellCheck={false}
                autoComplete="off"
                keyboardType="visible-password"
              />
            ) : (
              <TouchableOpacity style={styles.titleContainer} onPress={() => setIsEditing(true)}>
                <Text 
                  style={styles.title} 
                  adjustsFontSizeToFit 
                  numberOfLines={2}
                  minimumFontScale={0.5}
                >
                  {item.nombre_plato || 'Platillo Misterioso'}
                </Text>
                <MaterialCommunityIcons name="pencil" size={16} color="#999" style={styles.editIcon} />
              </TouchableOpacity>
            )}
            
            <View style={[styles.badge, { backgroundColor: categoryInfo.color }]}>
              <MaterialCommunityIcons name={categoryInfo.iconName as any} size={16} color="#fff" />
              <Text style={styles.badgeText}>{categoryInfo.label}</Text>
            </View>
          </View>

          {item.nombre_restaurante && (
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="storefront" size={16} color="#aaa" />
              <Text style={styles.metaText}>{item.nombre_restaurante}</Text>
            </View>
          )}

          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="calendar" size={16} color="#aaa" />
            <Text style={styles.metaText}>{dateStr}</Text>
          </View>

          {item.coordenadas && (
            <TouchableOpacity 
              style={styles.metaRow} 
              onPress={() => {
                const url = `https://www.google.com/maps/search/?api=1&query=${item.coordenadas.lat},${item.coordenadas.lng}`;
                Linking.openURL(url);
              }}
            >
              <MaterialCommunityIcons name="map-marker" size={16} color="#007BFF" />
              <Text style={[styles.metaText, {color: '#007BFF', textDecorationLine: 'underline'}]}>
                Ver en el mapa
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
              <Text style={styles.statValue}>{item.calificacion > 0 ? `${item.calificacion}/10` : 'S/C'}</Text>
            </View>
            <View style={styles.statBox}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {item.precio > 0 ? Array(item.precio).fill(0).map((_, i) => (
                  <MaterialCommunityIcons key={i} name="currency-usd" size={20} color="#4CAF50" />
                )) : <Text style={[styles.statValue, {fontSize: 20, color: '#999', marginLeft: 0}]}>Precio Misterioso</Text>}
              </View>
            </View>
            <View style={styles.statBox}>
              <MaterialCommunityIcons 
                name={item.volveria_a_comer_aqui ? 'heart' : 'heart-broken'} 
                size={24} 
                color={item.volveria_a_comer_aqui ? '#E91E63' : '#9E9E9E'} 
              />
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function ViewerScreen() {
  const router = useRouter();
  const { index, filter } = useLocalSearchParams<{ index: string; filter: string }>();
  const { cards, editCard, removeCard } = useFoodCards();
  const flatListRef = useRef<FlatList>(null);

  const filteredCards = cards.filter(card => 
    !filter || filter === 'todas' ? true : card.categoria === filter
  );

  const initialIndex = parseInt(index || '0', 10);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={filteredCards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ViewerItem 
            item={item} 
            editCard={editCard} 
            removeCard={removeCard} 
            goBack={() => router.back()} 
          />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.pixelCloseIcon}>X</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  pageContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  pixelCloseIcon: {
    fontFamily: 'VT323_400Regular',
    fontSize: 28,
    color: '#fff',
    marginTop: -4,
  },
  deleteButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6347',
  },
  pixelTrashIcon: {
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
    color: '#FF6347',
    marginTop: -2,
  },
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  cardInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'VT323_400Regular',
    fontSize: 28,
    color: '#333',
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  editIcon: {
    marginLeft: 6,
  },
  titleInput: {
    flex: 1,
    fontFamily: 'VT323_400Regular',
    fontSize: 28,
    color: '#333',
    textTransform: 'uppercase',
    borderBottomWidth: 2,
    borderBottomColor: '#FF6347',
    padding: 0,
    marginRight: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontFamily: 'VT323_400Regular',
    color: '#fff',
    marginLeft: 4,
    fontSize: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#666',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
    color: '#333',
    marginLeft: 4,
  },
});
