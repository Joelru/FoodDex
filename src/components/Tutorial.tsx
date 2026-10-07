import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TUTORIAL_STORAGE_KEY = '@fooddex_has_seen_tutorial';

const TUTORIAL_STEPS = [
  {
    text: "¡Hola! Bienvenido a tu FoodDex...",
    pose: { row: 0, col: 0 } // Normal
  },
  {
    text: "Aquí podrás registrar tus platillos y ganar experiencia.",
    pose: { row: 1, col: 1 } // Sitting
  },
  {
    text: "Sube de nivel y desbloquea medallas como un verdadero experto.",
    pose: { row: 2, col: 1 } // Standing on one leg
  },
  {
    text: "¡Toca el botón + abajo para atrapar tu primer platillo!",
    pose: { row: 0, col: 1 } // Flying
  }
];

// Screen width to calculate responsive sizes if needed
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_SIZE = 140;

export default function Tutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    checkTutorial();
  }, []);

  const checkTutorial = async () => {
    try {
      const hasSeen = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (hasSeen !== 'true') {
        setIsVisible(true);
      }
    } catch (e) {
      console.error('Error checking tutorial status:', e);
    }
  };

  const handleNext = async () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finish tutorial
      try {
        await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
        setIsVisible(false);
      } catch (e) {
        console.error('Error saving tutorial status:', e);
      }
    }
  };

  if (!isVisible) return null;

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <View style={styles.overlay}>
      <View style={styles.contentContainer}>
        
        {/* Speech Bubble */}
        <View style={styles.bubbleContainer}>
          <Text style={styles.bubbleText}>{step.text}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleNext}>
            <MaterialCommunityIcons name="close-thick" size={20} color="#333" />
          </TouchableOpacity>
          {/* Bubble Tail */}
          <View style={styles.bubbleTail} />
        </View>

        {/* Avatar Sprite Crop */}
        <View style={styles.avatarWrapper}>
          <Image 
            source={require('../../assets/images/BeFunky-collage.png')} 
            style={[
              styles.avatarImage,
              {
                left: -CELL_SIZE * step.pose.col,
                top: -CELL_SIZE * step.pose.row,
              }
            ]}
            resizeMode="cover"
          />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '85%',
    alignItems: 'center',
  },
  bubbleContainer: {
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#333',
    padding: 20,
    paddingTop: 24,
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
    position: 'relative',
    // Pixelated shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  bubbleText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
    color: '#333',
    lineHeight: 28,
  },
  closeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6347',
    borderWidth: 3,
    borderColor: '#333',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    // Pixelated shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -15,
    right: 50,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 15,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#333',
  },
  avatarWrapper: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    overflow: 'hidden',
    alignSelf: 'flex-end',
    marginRight: 20,
  },
  avatarImage: {
    width: CELL_SIZE * 3,
    height: CELL_SIZE * 3,
    position: 'absolute',
  }
});
