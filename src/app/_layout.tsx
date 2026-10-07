import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, VT323_400Regular } from '@expo-google-fonts/vt323';
import { View, Text } from 'react-native';
import { useState } from 'react';
import AnimatedSplash from '../components/AnimatedSplash';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    VT323_400Regular,
  });
  const [splashFinished, setSplashFinished] = useState(false);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando fuentes...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Mi FoodDex',
            headerLargeTitle: true,
            headerStyle: { backgroundColor: '#F0EAD6' },
            headerTitleStyle: { fontFamily: 'VT323_400Regular', fontSize: 28 }
          }} 
        />
        <Stack.Screen 
          name="create" 
          options={{ 
            title: 'Nueva Captura',
            presentation: 'modal',
            headerTitleStyle: { fontFamily: 'VT323_400Regular', fontSize: 24 }
          }} 
        />
        <Stack.Screen 
          name="viewer" 
          options={{ 
            headerShown: false,
            presentation: 'fullScreenModal'
          }} 
        />
      </Stack>
      {!splashFinished && <AnimatedSplash onFinish={() => setSplashFinished(true)} />}
    </>
  );
}
