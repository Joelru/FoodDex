import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Switch, StyleSheet, Alert, ActivityIndicator, Platform, Modal, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFoodCards } from '../hooks/useFoodCards';
import { useUserStats } from '../hooks/useUserStats';
import { CATEGORIES } from '../constants/Categories';
import { CategoryId, Coordinates } from '../types';

export default function CreateCardScreen() {
  const router = useRouter();
  const { addCard, cards } = useFoodCards();
  const { addXp, level } = useUserStats();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalData, setModalData] = useState({ earnedXp: 0, leveledUp: false, newLevel: 0 });

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [exifDate, setExifDate] = useState<string | undefined>(undefined);
  const [exifCoords, setExifCoords] = useState<Coordinates | undefined>(undefined);
  const [imageHash, setImageHash] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [category, setCategory] = useState<CategoryId>('chatarra');
  const [rating, setRating] = useState<number>(0); // 0 = no rating
  const [price, setPrice] = useState<number>(0); // 0 = no price
  const [wouldEatAgain, setWouldEatAgain] = useState(true);
  
  const [saveLocation, setSaveLocation] = useState(false); // Default disabled
  const [isLocating, setIsLocating] = useState(false);

  const processImageResult = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageHash(asset.assetId || (asset.fileSize ? asset.fileSize.toString() : asset.fileName || null));
      
      if (asset.exif) {
        if (asset.exif.DateTimeOriginal) {
          try {
            const parts = asset.exif.DateTimeOriginal.split(' ');
            const dateParts = parts[0].split(':');
            const formattedDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}T${parts[1]}Z`;
            setExifDate(formattedDate);
          } catch (e) {
            setExifDate(new Date().toISOString());
          }
        }
        if (asset.exif.GPSLatitude && asset.exif.GPSLongitude) {
          setExifCoords({
            lat: asset.exif.GPSLatitude,
            lng: asset.exif.GPSLongitude
          });
          // Only auto-enable if they picked an image with coordinates
          setSaveLocation(true);
        }
      }
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permisos insuficientes", "Se necesitan permisos para usar la cámara.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      exif: true,
    });
    processImageResult(result);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      exif: true,
    });
    processImageResult(result);
  };

  const getCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se pudo obtener el permiso para usar la ubicación.');
        setIsLocating(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setExifCoords({
        lat: location.coords.latitude,
        lng: location.coords.longitude
      });
      setSaveLocation(true); // Auto enable if they manually request it
      Alert.alert('¡Ubicación guardada!', 'Tus coordenadas actuales se han añadido.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación actual.');
    }
    setIsLocating(false);
  };

  const handleSave = async () => {
    if (!imageUri) {
      Alert.alert("Foto requerida", "¡Por favor, añade una foto de tu comida!");
      return;
    }

    try {
      await addCard({
        image_uri: imageUri,
        image_hash: imageHash || undefined,
        nombre_plato: name.trim(),
        nombre_restaurante: restaurantName.trim(),
        categoria: category,
        calificacion: rating,
        precio: price,
        volveria_a_comer_aqui: wouldEatAgain,
        fecha_captura: exifDate || new Date().toISOString(),
        coordenadas: saveLocation ? exifCoords : undefined, // Only save if toggle is ON
      });

      // Check for duplicate image to prevent XP farming
      const isDuplicateImage = cards.some(c => 
        c.image_uri === imageUri || 
        (imageHash && c.image_hash === imageHash)
      );

      // Calculate XP
      let xpEarned = 30; // base XP
      if (imageUri && !isDuplicateImage) xpEarned += 40;
      if (saveLocation && exifCoords) xpEarned += 15;
      if (rating > 0 && price > 0) xpEarned += 15;

      const leveledUp = await addXp(xpEarned);
      
      setModalData({ earnedXp: xpEarned, leveledUp, newLevel: level + (leveledUp ? 1 : 0) });
      setShowSuccessModal(true);
      
    } catch (error) {
      Alert.alert("Error", "Hubo un error al guardar la tarjeta.");
    }
  };

  return (
    <KeyboardAwareScrollView 
      style={styles.container} 
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      extraScrollHeight={80}
      extraHeight={120}
      enableAutomaticScroll={true}
    >
        {/* SECCIÓN DE FOTO */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imageWrapper} onPress={takePhoto} activeOpacity={0.8}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="camera-plus" size={60} color="#6c757d" />
                <Text style={styles.placeholderText}>Toma una foto (+40 XP)</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.photoButtonsRow}>
            <TouchableOpacity style={[styles.photoButton, {backgroundColor: '#FF6347'}]} onPress={takePhoto}>
              <MaterialCommunityIcons name="camera" size={24} color="#fff" style={styles.btnIcon} />
              <Text style={[styles.photoButtonText, {color: '#fff'}]}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <MaterialCommunityIcons name="image-multiple" size={24} color="#333" style={styles.btnIcon} />
              <Text style={styles.photoButtonText}>Galería</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FORMULARIO */}
        <View style={styles.formSection}>
          {/* Nombre Plato */}
          <Text style={styles.label}>Platillo (Opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Hamburguesa doble queso..."
            value={name}
            onChangeText={setName}
          />

          {/* Restaurante & Ubicación */}
          <Text style={styles.label}>Restaurante / Lugar (+30 XP Base)</Text>
          <View style={styles.locationRow}>
            <TextInput
              style={[styles.input, {flex: 1, marginBottom: 0}]}
              placeholder="Nombre del restaurante..."
              value={restaurantName}
              onChangeText={setRestaurantName}
            />
            <TouchableOpacity 
              style={[styles.locationBtn, saveLocation && exifCoords ? styles.locationBtnSuccess : null]} 
              onPress={getCurrentLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialCommunityIcons 
                  name={(saveLocation && exifCoords) ? "map-marker-check" : "crosshairs-gps"} 
                  size={24} 
                  color={(saveLocation && exifCoords) ? "#fff" : "#333"} 
                />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.switchRowSimple}>
            <Switch
              value={saveLocation}
              onValueChange={setSaveLocation}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={saveLocation ? '#fff' : '#f4f3f4'}
            />
            <Text style={styles.switchTextMini}>Guardar coordenadas (+15 XP)</Text>
          </View>

          {/* Categoría */}
          <Text style={styles.label}>Categoría</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {Object.values(CATEGORIES).map((cat) => {
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryPill,
                    { backgroundColor: isSelected ? cat.color : '#f0f0f0' },
                  ]}
                  onPress={() => setCategory(cat.id as CategoryId)}
                >
                  <MaterialCommunityIcons name={cat.iconName as any} size={18} color={isSelected ? '#fff' : '#333'} />
                  <Text style={[styles.categoryText, { color: isSelected ? '#fff' : '#333', fontWeight: isSelected ? 'bold' : 'normal' }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Calificación */}
          <Text style={styles.label}>Calificación: {rating}/10 ⭐ (+15 XP con precio)</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.numberCircle, rating === num && styles.numberCircleSelected]}
                onPress={() => setRating(num)}
              >
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 20, color: rating === num ? '#fff' : '#666' }}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Precio */}
          <Text style={styles.label}>Precio</Text>
          <View style={styles.priceRow}>
            {[1, 2, 3].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.priceButton, price === num && styles.priceButtonSelected]}
                onPress={() => setPrice(num)}
              >
                <View style={{flexDirection: 'row'}}>
                  {Array(num).fill(0).map((_, i) => (
                    <MaterialCommunityIcons 
                      key={i} 
                      name="currency-usd" 
                      size={24} 
                      color={price === num ? '#2E7D32' : '#6c757d'} 
                    />
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Volvería a comer aquí */}
          <View style={styles.switchRow}>
            <Text style={styles.labelSwitch}>¿Volverías a comer esto?</Text>
            <Switch
              value={wouldEatAgain}
              onValueChange={setWouldEatAgain}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={wouldEatAgain ? '#fff' : '#f4f3f4'}
            />
          </View>

          {/* Botón Guardar */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <MaterialCommunityIcons name="content-save" size={28} color="#fff" />
            <Text style={styles.saveButtonText}>Guardar en FoodDex</Text>
          </TouchableOpacity>
          
          <View style={styles.bottomSpacer} />
        </View>

        <Modal visible={showSuccessModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={[styles.modalIconWrapper, { backgroundColor: modalData.leveledUp ? '#FFD700' : '#4CAF50' }]}>
                <MaterialCommunityIcons 
                  name={modalData.leveledUp ? 'star-shooting' : 'check-decagram'} 
                  size={48} 
                  color="#fff" 
                />
              </View>
              <Text style={styles.modalTitle}>
                {modalData.leveledUp ? '¡Nivel Subido!' : '¡Registro Exitoso!'}
              </Text>
              <Text style={styles.modalText}>
                Has ganado <Text style={{color: '#FF6347'}}>{modalData.earnedXp} XP</Text>.
              </Text>
              {modalData.leveledUp && (
                <Text style={styles.modalSubText}>¡Alcanzaste el Nivel {modalData.newLevel}!</Text>
              )}
              
              <TouchableOpacity 
                style={styles.modalBtn} 
                onPress={() => {
                  setShowSuccessModal(false);
                  router.back();
                }}
              >
                <Text style={styles.modalBtnText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EAD6',
  },
  imageSection: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 3,
    borderBottomColor: '#333',
  },
  imageWrapper: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#333',
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#e9ecef',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: 'VT323_400Regular',
    color: '#6c757d',
    fontSize: 24,
    marginTop: 8,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  photoButton: {
    backgroundColor: '#eee',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#333',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnIcon: {
    marginRight: 8,
  },
  photoButtonText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
    color: '#333',
    textTransform: 'uppercase',
  },
  formSection: {
    padding: 16,
  },
  label: {
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 3,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    backgroundColor: '#fff',
    fontFamily: 'VT323_400Regular',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationBtn: {
    width: 50,
    height: 50,
    backgroundColor: '#eee',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationBtnSuccess: {
    backgroundColor: '#4CAF50',
  },
  switchRowSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  switchTextMini: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#555',
    marginLeft: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#333',
    marginRight: 10,
  },
  categoryText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
    marginLeft: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  numberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  numberCircleSelected: {
    backgroundColor: '#FF6347',
    borderColor: '#333',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#333',
  },
  priceButtonSelected: {
    backgroundColor: '#E8F5E9',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 2,
    borderTopColor: '#ccc',
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
  labelSwitch: {
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
    color: '#333',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6347',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  saveButtonText: {
    fontFamily: 'VT323_400Regular',
    color: '#fff',
    fontSize: 28,
    textTransform: 'uppercase',
    marginLeft: 10,
  },
  bottomSpacer: {
    height: 140,
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
  modalIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#333',
  },
  modalTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 32,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
    color: '#666',
    textAlign: 'center',
  },
  modalSubText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 8,
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
