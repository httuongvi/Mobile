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

const PreLiveScreen = ({route, navigation}) => {
  // 👇 NHẬN DỮ LIỆU TỪ LOGIN TRUYỀN SANG
  const {savedRoomName, currentUserName} = route.params || {};

  const [title, setTitle] = useState('');
  const [roomId, setRoomId] = useState(savedRoomName || '');

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn muốn thoát tài khoản?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Thoát',
        style: 'destructive',
        onPress: () => {
          auth()
            .signOut()
            .then(() => navigation.replace('Login'));
        },
      },
    ]);
  };
  const startLive = () => {
    if (!roomId.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập ID phòng!');
      return;
    }

    // 👇 CHUYỂN SANG PHÒNG LIVE VÀ MANG THEO userName
    navigation.replace('LiveRoom', {
      isStreamer: true,
      roomID: roomId,
      roomTitle: title || 'Livestream vui vẻ',
      userName: currentUserName || 'Streamer', // Truyền tên Idol sang
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View />
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Đăng xuất ↪</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.header}>CHUẨN BỊ LIVE</Text>

      <Text style={styles.welcomeText}>
        Xin chào Idol, <Text style={{color: '#FE2C55'}}>{currentUserName}</Text>
        !
      </Text>

      <Text style={styles.label}>ID Phòng (Link Stream)</Text>
      <TextInput
        style={styles.input}
        value={roomId}
        onChangeText={setRoomId}
        placeholder="Nhập ID phòng..."
        placeholderTextColor="#666"
      />
      <Text style={styles.hint}>*Đây sẽ là địa chỉ phòng live của bạn</Text>

      <Text style={styles.label}>Tiêu đề hôm nay</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Ví dụ: Leo rank thách đấu..."
        placeholderTextColor="#666"
      />

      <TouchableOpacity style={styles.btn} onPress={startLive}>
        <Text style={styles.btnText}>BẮT ĐẦU LIVE 🎥</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
  },
  headerRow: {
    position: 'absolute', // Ghim lên góc trên cùng
    top: 40,
    right: 20,
    zIndex: 10,
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#2c3e50',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#34495e',
  },
  logoutText: {
    color: '#bdc3c7',
    fontWeight: 'bold',
    fontSize: 14,
  },
  header: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  label: {
    color: '#FE2C55',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#222',
    color: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#333',
  },
  hint: {color: '#888', fontSize: 12, marginBottom: 20, fontStyle: 'italic'},
  btn: {
    backgroundColor: '#FE2C55',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  btnText: {color: 'white', fontSize: 18, fontWeight: 'bold'},
});

export default PreLiveScreen;
