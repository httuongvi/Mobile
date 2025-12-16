// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';

// const LoginScreen = ({navigation}) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     if (!email || !password) return;
//     setLoading(true);

//     try {
//       // 1. Đăng nhập Auth
//       const userCredential = await auth().signInWithEmailAndPassword(
//         email,
//         password,
//       );
//       const uid = userCredential.user.uid;

//       // 2. Lấy thông tin Role từ Firestore
//       const userDoc = await firestore().collection('users').doc(uid).get();

//       if (userDoc.exists) {
//         const userData = userDoc.data();
//         const role = userData.role;

//         console.log('User Role:', role);

//         // 3. ĐIỀU HƯỚNG THÔNG MINH
//         if (role === 'streamer') {
//           // Nếu là Streamer -> Vào màn hình chuẩn bị Live
//           navigation.replace('PreLive');
//         } else {
//           // Nếu là Viewer -> Vào danh sách phòng
//           navigation.replace('Home');
//         }
//       } else {
//         Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng!');
//       }
//     } catch (error) {
//       Alert.alert('Đăng nhập thất bại', error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>ĐĂNG NHẬP 👋</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         placeholderTextColor="#aaa"
//         value={email}
//         onChangeText={setEmail}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Mật khẩu"
//         placeholderTextColor="#aaa"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />

//       <TouchableOpacity
//         style={styles.btnLogin}
//         onPress={handleLogin}
//         disabled={loading}>
//         {loading ? (
//           <ActivityIndicator color="white" />
//         ) : (
//           <Text style={styles.btnText}>ĐĂNG NHẬP</Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => navigation.navigate('Register')}>
//         <Text style={styles.link}>Chưa có tài khoản? Đăng ký tại đây</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1e272e',
//     padding: 20,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 30,
//     fontWeight: 'bold',
//     color: 'white',
//     textAlign: 'center',
//     marginBottom: 40,
//   },
//   input: {
//     backgroundColor: '#485460',
//     color: 'white',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 20,
//   },
//   btnLogin: {
//     backgroundColor: '#3498db',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   btnText: {color: 'white', fontWeight: 'bold', fontSize: 16},
//   link: {color: '#34e7e4', textAlign: 'center', marginTop: 20},
// });

// export default LoginScreen;

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);

    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      const uid = userCredential.user.uid;

      // Lấy thông tin User từ Firestore
      const userDoc = await firestore().collection('users').doc(uid).get();

      if (userDoc.exists) {
        const userData = userDoc.data();

        // 👇 LẤY CÁC TRƯỜNG QUAN TRỌNG
        const {role, roomID, userName} = userData;

        console.log(`Đăng nhập thành công: ${userName} (${role})`);

        if (role === 'streamer') {
          // 👇 TRUYỀN savedRoomName VÀ currentUserName SANG PRELIVE
          navigation.replace('PreLive', {
            savedRoomName: roomID,
            currentUserName: userName,
          });
        } else {
          // Nếu là Viewer -> Vào Home, mang theo tên Fan
          navigation.replace('Home', {
            currentUserName: userName,
          });
        }
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng!');
      }
    } catch (error) {
      Alert.alert('Đăng nhập thất bại', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ĐĂNG NHẬP 👋</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={styles.btnLogin}
        onPress={handleLogin}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.btnText}>ĐĂNG NHẬP</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký tại đây</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e272e',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#485460',
    color: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  btnLogin: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {color: 'white', fontWeight: 'bold', fontSize: 16},
  link: {color: '#34e7e4', textAlign: 'center', marginTop: 20},
});

export default LoginScreen;
