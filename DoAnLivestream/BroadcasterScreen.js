import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Button,
  StyleSheet,
  PermissionsAndroid,
  Alert,
  Text,
  Platform,
} from 'react-native';
import {ApiVideoLiveStreamView} from '@api.video/react-native-livestream';

const BroadcasterScreen = () => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const liveStreamRef = useRef(null);

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);
          if (
            granted['android.permission.CAMERA'] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.RECORD_AUDIO'] ===
              PermissionsAndroid.RESULTS.GRANTED
          ) {
            setHasPermission(true);
          } else {
            Alert.alert('Lỗi', 'Cần cấp quyền Camera/Micro để chạy App');
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };
    requestPermissions();
  }, []);

  const handleStartStop = () => {
    if (isPublishing) {
      liveStreamRef.current?.stopStreaming();
      setIsPublishing(false);
    } else {
      // QUAN TRỌNG: Cấu hình đẩy RTMP vào Node.js Server
      // startStreaming('StreamKey', 'RTMP URL')
      // IP: 10.0.2.2 là localhost của máy tính khi nhìn từ máy ảo
      liveStreamRef.current
        ?.startStreaming('mobile_test', 'rtmp://10.0.2.2/live')
        .then(() => {
          console.log('Đang phát sóng...');
          setIsPublishing(true);
        })
        .catch(e => {
          console.log('Lỗi:', e);
          Alert.alert(
            'Lỗi kết nối',
            'Kiểm tra xem Server Node.js đã bật chưa?',
          );
          setIsPublishing(false);
        });
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={{color: 'white'}}>Đang xin quyền...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ApiVideoLiveStreamView
        style={styles.cameraView}
        ref={liveStreamRef}
        camera="back"
        video={{
          fps: 30,
          resolution: '720p',
          bitrate: 1024 * 1024, // 1 Mbps
        }}
        audio={{
          bitrate: 128000,
          sampleRate: 44100,
          isStereo: true,
        }}
        onConnectionSuccess={() => console.log('Kết nối Server thành công!')}
        onConnectionFailed={e => console.log('Kết nối thất bại:', e)}
        onDisconnect={() => console.log('Đã ngắt kết nối')}
      />

      <View style={styles.controls}>
        <Button
          title={isPublishing ? '🛑 DỪNG LIVE' : '🔴 BẮT ĐẦU LIVE'}
          color={isPublishing ? 'red' : 'green'}
          onPress={handleStartStop}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'black'},
  cameraView: {flex: 1},
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
});

export default BroadcasterScreen;
