import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Import màn hình
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import PreLiveScreen from './PreLiveScreen';
import HomeScreen from './HomeScreen';
import LiveRoomScreen from './LiveRoomScreen';

const Stack = createStackNavigator();

const App = () => {
  // --- OPTIONAL: TỰ ĐỘNG ĐĂNG NHẬP NẾU ĐÃ LOGIN TRƯỚC ĐÓ ---
  // (Phần này nâng cao, nếu em muốn làm thì nhắn thầy code thêm,
  // hiện tại cứ để vào Login trước cho đơn giản)

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login" // <--- Đổi thành Login
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Các màn hình chính */}
        <Stack.Screen name="PreLive" component={PreLiveScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LiveRoom" component={LiveRoomScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
