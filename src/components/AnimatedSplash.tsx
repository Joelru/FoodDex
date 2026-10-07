import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const FOOD_ICONS = ['hamburger', 'pizza', 'cupcake', 'coffee', 'bowl-mix', 'noodles', 'ice-cream', 'food-apple', 'taco'];

interface Props {
  onFinish: () => void;
}

export default function AnimatedSplash({ onFinish }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const [items] = useState(() => {
    return FOOD_ICONS.map((icon, index) => {
      const initialAngle = (index / FOOD_ICONS.length) * Math.PI * 2;
      const initialRadius = width * 0.6; // Start outside the screen
      return { icon, initialAngle, initialRadius };
    });
  });

  useEffect(() => {
    // Phase 1: Spiral into black hole (duration: 2000ms)
    Animated.timing(progress, {
      toValue: 1,
      duration: 2500,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      // Phase 2: Fade out the entire splash screen
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    });
  }, [progress, fadeOut, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]} pointerEvents="none">
      <View style={styles.blackHole} />

      {items.map((item, index) => {
        // Interpolate the spiral math via transform arrays
        // Since React Native Animated doesn't support direct math expressions in styles easily,
        // we approximate the spiral by breaking it into a rotate, translate, rotate.
        
        // Spin around center:
        const spin = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [`${item.initialAngle}rad`, `${item.initialAngle + Math.PI * 4}rad`],
        });

        // Shrink distance to center:
        const distance = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [item.initialRadius, 0],
        });

        // Shrink scale
        const scale = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [2, 0],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.iconWrapper,
              {
                transform: [
                  { rotate: spin },
                  { translateX: distance },
                  { scale: scale },
                ]
              }
            ]}
          >
            <MaterialCommunityIcons name={item.icon as any} size={40} color="#FF6347" />
          </Animated.View>
        );
      })}
      
      <Animated.Text style={[
        styles.title, 
        { 
          opacity: progress.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
          transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]
        }
      ]}>
        FOODDEX
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F0EAD6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  blackHole: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#111',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  iconWrapper: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'VT323_400Regular',
    fontSize: 60,
    color: '#333',
    position: 'absolute',
    top: height * 0.2,
    textShadowColor: '#FF6347',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  }
});
