// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from 'react-native';
// import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';

// const RegisterScreen = ({navigation}) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   // Hàm xử lý đăng ký
//   const handleRegister = async role => {
//     if (!email || !password) {
//       Alert.alert('Lỗi', 'Vui lòng nhập Email và Mật khẩu');
//       return;
//     }

//     try {
//       // 1. Tạo tài khoản trên Firebase Auth
//       const userCredential = await auth().createUserWithEmailAndPassword(
//         email,
//         password,
//       );
//       const uid = userCredential.user.uid;

//       // 2. Lưu vai trò (Role) vào Firestore Database
//       // Chúng ta tạo collection 'users', document là ID của user
//       await firestore().collection('users').doc(uid).set({
//         email: email,
//         role: role, // 'streamer' hoặc 'viewer'
//         createdAt: firestore.FieldValue.serverTimestamp(),
//       });

//       Alert.alert(
//         'Thành công',
//         `Bạn đã đăng ký tài khoản ${
//           role === 'streamer' ? 'Streamer' : 'Viewer'
//         }!`,
//       );

//       // 3. Quay về đăng nhập
//       navigation.navigate('Login');
//     } catch (error) {
//       console.log(error);
//       if (error.code === 'auth/email-already-in-use') {
//         Alert.alert('Lỗi', 'Email này đã được sử dụng!');
//       } else {
//         Alert.alert('Lỗi', error.message);
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>ĐĂNG KÝ 🔐</Text>

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

//       <Text style={styles.label}>Bạn muốn đăng ký làm gì?</Text>

//       {/* Nút đăng ký làm STREAMER */}
//       <TouchableOpacity
//         style={[styles.btn, styles.btnStreamer]}
//         onPress={() => handleRegister('streamer')}>
//         <Text style={styles.btnText}>📹 Đăng ký làm Streamer</Text>
//       </TouchableOpacity>

//       {/* Nút đăng ký làm VIEWER */}
//       <TouchableOpacity
//         style={[styles.btn, styles.btnViewer]}
//         onPress={() => handleRegister('viewer')}>
//         <Text style={styles.btnText}>👀 Đăng ký làm Viewer</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//         <Text style={styles.link}>Đã có tài khoản? Đăng nhập ngay</Text>
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
//     marginBottom: 30,
//   },
//   input: {
//     backgroundColor: '#485460',
//     color: 'white',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   label: {color: '#d2dae2', textAlign: 'center', marginVertical: 10},
//   btn: {padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10},
//   btnStreamer: {backgroundColor: '#ff4757'},
//   btnViewer: {backgroundColor: '#2ed573'},
//   btnText: {color: 'white', fontWeight: 'bold', fontSize: 16},
//   link: {color: '#34e7e4', textAlign: 'center', marginTop: 20},
// });

// export default RegisterScreen;

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const RegisterScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Mặc định chọn Viewer trước cho đỡ trống
  const [role, setRole] = useState('viewer');
  // Biến này dùng chung: Nếu là Streamer thì nó là "Tên Phòng", Viewer thì là "Tên Fan"
  const [extraInfo, setExtraInfo] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !extraInfo.trim()) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng nhập đầy đủ Email, Mật khẩu và Tên!',
      );
      return;
    }

    try {
      // 1. Tạo tài khoản Auth
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const uid = userCredential.user.uid;

      // 2. Chuẩn bị dữ liệu lưu Firestore
      const userData = {
        email: email,
        role: role,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      if (role === 'streamer') {
        userData.roomID = extraInfo.trim(); // ID phòng live
        userData.userName = `Idol ${extraInfo.trim()}`; // Tên hiển thị khi chat
      } else {
        userData.roomID = null;
        userData.userName = extraInfo.trim(); // Tên Fan do người dùng nhập
      }

      // 3. Lưu vào Firestore
      await firestore().collection('users').doc(uid).set(userData);

      Alert.alert(
        'Thành công',
        `Chào mừng ${
          role === 'streamer' ? 'Streamer' : 'Viewer'
        } ${extraInfo}!`,
        [{text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login')}],
      );
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Lỗi', 'Email này đã được sử dụng!');
      } else {
        Alert.alert('Lỗi', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ĐĂNG KÝ 🔐</Text>

      {/* 1. Nhập Tài khoản & Mật khẩu trước */}
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

      <Text style={styles.label}>Bạn muốn đăng ký làm gì?</Text>

      {/* 2. Chọn Vai trò */}
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[
            styles.roleBtn,
            role === 'streamer' && styles.roleBtnActive,
            {borderColor: '#ff4757'},
          ]}
          onPress={() => setRole('streamer')}>
          <Text
            style={[
              styles.roleText,
              role === 'streamer' && {color: '#ff4757'},
            ]}>
            📹 Streamer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleBtn,
            role === 'viewer' && styles.roleBtnActive,
            {borderColor: '#2ed573'},
          ]}
          onPress={() => setRole('viewer')}>
          <Text
            style={[styles.roleText, role === 'viewer' && {color: '#2ed573'}]}>
            👀 Viewer
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Hiển thị ô nhập dựa trên vai trò đã chọn */}
      <Text style={styles.helperText}>
        {role === 'streamer'
          ? 'Đặt tên cho Phòng Live của bạn (VD: PhongGaming)'
          : 'Bạn muốn mọi người gọi bạn là gì? (VD: Fan Cứng 20 Năm)'}
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            borderColor: role === 'streamer' ? '#ff4757' : '#2ed573',
            borderWidth: 1,
          },
        ]}
        placeholder={
          role === 'streamer'
            ? 'Nhập tên phòng Live...'
            : 'Nhập tên hiển thị của bạn...'
        }
        placeholderTextColor="#aaa"
        value={extraInfo}
        onChangeText={setExtraInfo}
      />

      <TouchableOpacity style={styles.btnRegister} onPress={handleRegister}>
        <Text style={styles.btnText}>ĐĂNG KÝ NGAY</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
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
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#485460',
    color: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  label: {
    color: '#d2dae2',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },

  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roleBtn: {
    flex: 0.48,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#555',
    alignItems: 'center',
    backgroundColor: '#2f3542',
  },
  roleBtnActive: {backgroundColor: '#1e272e'}, // Màu nền khi chọn
  roleText: {color: 'white', fontWeight: 'bold', fontSize: 15},

  helperText: {
    color: '#ccc',
    marginBottom: 5,
    fontSize: 13,
    fontStyle: 'italic',
  },

  btnRegister: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: {color: 'white', fontWeight: 'bold', fontSize: 16},
  link: {color: '#34e7e4', textAlign: 'center', marginTop: 20},
});

export default RegisterScreen;
