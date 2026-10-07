import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, VT323_400Regular } from '@expo-google-fonts/vt323';
import { View, Text, TouchableOpacity } from 'react-native';
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
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="create" 
          options={({ navigation }) => ({ 
            title: 'Nueva Captura',
            presentation: 'modal',
            animation: 'fade',
            headerTitleStyle: { fontFamily: 'VT323_400Regular', fontSize: 24 },
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 8, padding: 8 }}>
                <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 32, color: '#333', marginTop: -4 }}>{'<'}</Text>
              </TouchableOpacity>
            )
          })} 
        />
        <Stack.Screen 
          name="viewer" 
          options={{ 
            headerShown: false,
            presentation: 'fullScreenModal'
          }} 
        />
        <Stack.Screen 
          name="profile" 
          options={{ 
            headerShown: false 
          }} 
        />
      </Stack>
      {!splashFinished && <AnimatedSplash onFinish={() => setSplashFinished(true)} />}
    </>
  );
}
