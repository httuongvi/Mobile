import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';

const WelcomeScreen = ({navigation}) => {
  // Xử lý khi chọn làm Streamer
  const handleStartLive = () => {
    // Chuyển thẳng sang màn hình LiveRoom với vai trò là Streamer
    navigation.navigate('PreLive', {
      type: 'create', // Báo hiệu đây là tạo phòng
      isStreamer: true, // Quan trọng: Đánh dấu là Streamer
    });
  };

  // Xử lý khi chọn làm Viewer
  const handleWatchLive = () => {
    // Chuyển sang màn hình danh sách phòng
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LiveConnect 🔴</Text>
      <Text style={styles.subtitle}>Bạn muốn làm gì hôm nay?</Text>

      {/* Nút cho Streamer */}
      <TouchableOpacity
        style={[styles.btn, styles.btnStream]}
        onPress={handleStartLive}>
        <Text style={styles.btnText}>📹 Bắt đầu Livestream</Text>
      </TouchableOpacity>

      {/* Nút cho Viewer */}
      <TouchableOpacity
        style={[styles.btn, styles.btnWatch]}
        onPress={handleWatchLive}>
        <Text style={styles.btnText}>👀 Xem Livestream</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Màu nền tối cho ngầu
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ff4757',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#dfe6e9',
    marginBottom: 50,
  },
  btn: {
    width: '100%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
  },
  btnStream: {
    backgroundColor: '#ff4757', // Màu đỏ cho nút Live
  },
  btnWatch: {
    backgroundColor: '#2ed573', // Màu xanh cho nút Xem
  },
  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
