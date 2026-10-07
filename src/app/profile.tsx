import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStats, getXpForLevel } from '../hooks/useUserStats';
import { useFoodCards } from '../hooks/useFoodCards';
import { CATEGORIES } from '../constants/Categories';

export default function ProfileScreen() {
  const router = useRouter();
  const { stats, level, rank } = useUserStats();
  const { cards } = useFoodCards();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    loadProfileImage();
  }, []);

  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('@fooddex_profile_image');
      if (savedImage) setProfileImage(savedImage);
    } catch (e) {
      console.error('Error loading profile image:', e);
    }
  };

  const pickProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        await AsyncStorage.setItem('@fooddex_profile_image', uri);
      }
    } catch (e) {
      console.error('Error picking profile image:', e);
    }
  };

  const xpForNextLevel = getXpForLevel(level + 1);
  const progressPercent = Math.min(100, Math.max(0, (stats.xp / xpForNextLevel) * 100));

  const getBadges = () => {
    const badges = [];
    
    // Category badges (Requires 5 in category)
    if (cards.filter(c => c.categoria === 'chatarra').length >= 5) {
      badges.push({ id: 'chatarra', name: 'Maestro Chatarra', desc: 'Has registrado 5 platillos de comida chatarra.', icon: CATEGORIES.chatarra.iconName, color: CATEGORIES.chatarra.color });
    }
    if (cards.filter(c => c.categoria === 'saludable').length >= 5) {
      badges.push({ id: 'saludable', name: 'Alma Saludable', desc: 'Has registrado 5 platillos saludables.', icon: CATEGORIES.saludable.iconName, color: CATEGORIES.saludable.color });
    }
    if (cards.filter(c => c.categoria === 'dulce').length >= 5) {
      badges.push({ id: 'dulce', name: 'Rey del Azúcar', desc: 'Has registrado 5 postres o dulces.', icon: CATEGORIES.dulce.iconName, color: CATEGORIES.dulce.color });
    }
    if (cards.filter(c => c.categoria === 'platos_finos').length >= 5) {
      badges.push({ id: 'finos', name: 'Paladar Fino', desc: 'Has registrado 5 platos finos.', icon: CATEGORIES.platos_finos.iconName, color: CATEGORIES.platos_finos.color });
    }
    if (cards.filter(c => c.categoria === 'casero').length >= 5) {
      badges.push({ id: 'casero', name: 'Sazón de Hogar', desc: 'Has registrado 5 comidas caseras.', icon: CATEGORIES.casero.iconName, color: CATEGORIES.casero.color });
    }
    if (cards.filter(c => c.categoria === 'bebidas').length >= 5) {
      badges.push({ id: 'bebidas', name: 'Catador de Bebidas', desc: 'Has registrado 5 bebidas diferentes.', icon: CATEGORIES.bebidas.iconName, color: CATEGORIES.bebidas.color });
    }
    
    // Milestone badges
    if (cards.length >= 1) {
      badges.push({ id: 'primera', name: 'Primer Bocado', desc: 'Otorgada por guardar tu primera comida en la FoodDex.', icon: 'star', color: '#FFC107' });
    }
    if (cards.length >= 10) {
      badges.push({ id: 'coleccionista', name: 'Coleccionista', desc: 'Has alcanzado los 10 registros en tu FoodDex.', icon: 'cards-playing-outline', color: '#607D8B' });
    }
    if (cards.filter(c => !c.volveria_a_comer_aqui).length >= 5) {
      badges.push({ id: 'sobreviviente', name: 'Sobreviviente', desc: 'Has registrado 5 comidas que no volverías a probar jamás.', icon: 'skull-outline', color: '#9E9E9E' });
    }
    if (cards.filter(c => c.coordenadas).length >= 5) {
      badges.push({ id: 'trotamundos', name: 'Trotamundos', desc: 'Has guardado la ubicación de 5 comidas diferentes.', icon: 'earth', color: '#4CAF50' });
    }

    return badges;
  };

  const badges = getBadges();

    // ... existing getBadges
  const [selectedBadge, setSelectedBadge] = React.useState<any>(null);

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Profile */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.pixelBackIcon}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Perfil del Entrenador</Text>
        </View>

        <View style={styles.card}>
          {/* Bite Mark effect (Top Right Corner - Multiple overlapping dents) */}
          <View style={styles.biteCoverCorner} />

          <View style={styles.biteBlack1} />
          <View style={styles.biteBlack2} />
          <View style={styles.biteBlack3} />
          
          <View style={styles.biteBg1} />
          <View style={styles.biteBg2} />
          <View style={styles.biteBg3} />

          <View style={styles.biteCoverTop} />
          <View style={styles.biteCoverRight} />

          <TouchableOpacity style={styles.rankIconContainer} onPress={pickProfileImage} activeOpacity={0.8}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <MaterialCommunityIcons name={rank.icon as any} size={80} color="#FF6347" />
            )}
            <View style={styles.editIconBadge}>
              <MaterialCommunityIcons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.rankTitle}>{rank.title}</Text>
          <Text style={styles.levelText}>Nivel {level}</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.xpText}>{stats.xp} XP</Text>
              <Text style={styles.xpTextNext}>{xpForNextLevel} XP</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.xpSubtext}>Faltan {xpForNextLevel - stats.xp} XP para Nivel {level + 1}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{cards.length}</Text>
              <Text style={styles.statLabel}>Registros</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{badges.length}</Text>
              <Text style={styles.statLabel}>Medallas</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tus Medallas</Text>
        {badges.length === 0 ? (
          <View style={styles.emptyBadges}>
            <MaterialCommunityIcons name="medal-outline" size={48} color="#ccc" />
            <Text style={styles.emptyBadgesText}>Sigue registrando comidas para desbloquear medallas.</Text>
          </View>
        ) : (
          <View style={styles.badgesGrid}>
            {badges.map(badge => (
              <TouchableOpacity 
                key={badge.id} 
                style={styles.badgeItem}
                onPress={() => setSelectedBadge(badge)}
                activeOpacity={0.7}
              >
                <View style={[styles.badgeIconWrapper, { backgroundColor: badge.color }]}>
                  <MaterialCommunityIcons name={badge.icon as any} size={32} color="#fff" />
                </View>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Retro Badge Modal */}
      <Modal visible={!!selectedBadge} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {selectedBadge && (
            <View style={styles.modalCard}>
              <View style={[styles.modalIconWrapper, { backgroundColor: selectedBadge.color, width: 80, height: 80, borderRadius: 40 }]}>
                <MaterialCommunityIcons name={selectedBadge.icon as any} size={48} color="#fff" />
              </View>
              <Text style={styles.modalTitle}>{selectedBadge.name}</Text>
              <Text style={styles.modalText}>{selectedBadge.desc}</Text>
              
              <TouchableOpacity 
                style={styles.modalBtn} 
                onPress={() => setSelectedBadge(null)}
              >
                <Text style={styles.modalBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EAD6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
  },
  backBtn: {
    marginRight: 16,
    padding: 4,
  },
  pixelBackIcon: {
    fontFamily: 'VT323_400Regular',
    fontSize: 32,
    color: '#333',
    marginTop: -4,
  },
  title: {
    fontFamily: 'VT323_400Regular',
    fontSize: 32,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#333',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  rankIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0EAD6',
    borderWidth: 3,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 57,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#333',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  biteCoverCorner: {
    position: 'absolute',
    right: -3,
    top: -3,
    width: 10,
    height: 10,
    backgroundColor: '#F0EAD6',
    zIndex: 12,
  },
  biteBlack1: {
    position: 'absolute',
    right: 11,
    top: -21,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    zIndex: 10,
  },
  biteBlack2: {
    position: 'absolute',
    right: -5,
    top: -5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    zIndex: 10,
  },
  biteBlack3: {
    position: 'absolute',
    right: -21,
    top: 11,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    zIndex: 10,
  },
  biteBg1: {
    position: 'absolute',
    right: 14,
    top: -18,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0EAD6',
    zIndex: 11,
  },
  biteBg2: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0EAD6',
    zIndex: 11,
  },
  biteBg3: {
    position: 'absolute',
    right: -18,
    top: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0EAD6',
    zIndex: 11,
  },
  biteCoverTop: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 100,
    height: 27,
    backgroundColor: '#F0EAD6',
    zIndex: 12,
  },
  biteCoverRight: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 27,
    height: 100,
    backgroundColor: '#F0EAD6',
    zIndex: 12,
  },
  rankTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 28,
    color: '#333',
    textAlign: 'center',
  },
  levelText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
    color: '#FF6347',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#333',
  },
  xpTextNext: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#666',
  },
  progressBarBg: {
    height: 16,
    backgroundColor: '#eee',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  xpSubtext: {
    fontFamily: 'VT323_400Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#eee',
  },
  statBox: {
    alignItems: 'center',
    width: '50%',
  },
  statNumber: {
    fontFamily: 'VT323_400Regular',
    fontSize: 32,
    color: '#333',
  },
  statLabel: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#666',
  },
  sectionTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 28,
    color: '#333',
    marginLeft: 16,
    marginBottom: 12,
  },
  emptyBadges: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyBadgesText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  badgeItem: {
    width: '33.33%',
    alignItems: 'center',
    padding: 8,
    marginBottom: 16,
  },
  badgeIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    marginBottom: 8,
  },
  badgeName: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 24,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#333',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 32,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  modalIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#333',
  },
  modalText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
  },
  modalBtn: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
  },
  modalBtnText: {
    fontFamily: 'VT323_400Regular',
    color: '#fff',
    fontSize: 24,
    textTransform: 'uppercase',
  },
});
