import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserStats, getXpForLevel } from '../hooks/useUserStats';
import { useFoodCards } from '../hooks/useFoodCards';
import { CATEGORIES } from '../constants/Categories';

export default function ProfileScreen() {
  const router = useRouter();
  const { stats, level, rank } = useUserStats();
  const { cards } = useFoodCards();

  const xpForNextLevel = getXpForLevel(level + 1);
  const progressPercent = Math.min(100, Math.max(0, (stats.xp / xpForNextLevel) * 100));

  const getBadges = () => {
    const badges = [];
    
    // Category badges (Requires 5 in category)
    if (cards.filter(c => c.categoria === 'chatarra').length >= 5) {
      badges.push({ id: 'chatarra', name: 'Maestro Chatarra', icon: CATEGORIES.chatarra.iconName, color: CATEGORIES.chatarra.color });
    }
    if (cards.filter(c => c.categoria === 'saludable').length >= 5) {
      badges.push({ id: 'saludable', name: 'Alma Saludable', icon: CATEGORIES.saludable.iconName, color: CATEGORIES.saludable.color });
    }
    if (cards.filter(c => c.categoria === 'dulce').length >= 5) {
      badges.push({ id: 'dulce', name: 'Rey del Azúcar', icon: CATEGORIES.dulce.iconName, color: CATEGORIES.dulce.color });
    }
    if (cards.filter(c => c.categoria === 'platos_finos').length >= 5) {
      badges.push({ id: 'finos', name: 'Paladar Fino', icon: CATEGORIES.platos_finos.iconName, color: CATEGORIES.platos_finos.color });
    }
    if (cards.filter(c => c.categoria === 'casero').length >= 5) {
      badges.push({ id: 'casero', name: 'Sazón de Hogar', icon: CATEGORIES.casero.iconName, color: CATEGORIES.casero.color });
    }
    if (cards.filter(c => c.categoria === 'bebidas').length >= 5) {
      badges.push({ id: 'bebidas', name: 'Catador de Bebidas', icon: CATEGORIES.bebidas.iconName, color: CATEGORIES.bebidas.color });
    }
    
    // Milestone badges
    if (cards.length >= 1) {
      badges.push({ id: 'primera', name: 'Primer Bocado', icon: 'star', color: '#FFC107' });
    }
    if (cards.length >= 10) {
      badges.push({ id: 'coleccionista', name: 'Coleccionista', icon: 'cards-playing-outline', color: '#607D8B' });
    }
    if (cards.filter(c => !c.volveria_a_comer_aqui).length >= 5) {
      badges.push({ id: 'sobreviviente', name: 'Sobreviviente', icon: 'skull-outline', color: '#9E9E9E' });
    }
    if (cards.filter(c => c.coordenadas).length >= 5) {
      badges.push({ id: 'trotamundos', name: 'Trotamundos', icon: 'earth', color: '#4CAF50' });
    }

    return badges;
  };

  const badges = getBadges();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header Profile */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Perfil del Entrenador</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.rankIconContainer}>
          <MaterialCommunityIcons name={rank.icon as any} size={80} color="#FF6347" />
        </View>
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
            <View key={badge.id} style={styles.badgeItem}>
              <View style={[styles.badgeIconWrapper, { backgroundColor: badge.color }]}>
                <MaterialCommunityIcons name={badge.icon as any} size={32} color="#fff" />
              </View>
              <Text style={styles.badgeName}>{badge.name}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
});
