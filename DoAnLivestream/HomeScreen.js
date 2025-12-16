import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';

// 👇 Thay IP nếu cần (10.0.2.2 cho máy ảo Android)
const API_URL = 'http://10.0.2.2:3000/api/get-streams';

const HomeScreen = ({route, navigation}) => {
  const [streams, setStreams] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const currentUser = auth().currentUser;

  // Lấy tên Fan từ Login truyền sang
  const {currentUserName} = route.params || {currentUserName: 'Fan Cứng'};

  // 1. Gọi API lấy danh sách phòng
  const fetchStreams = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setStreams(data);
    } catch (error) {
      console.error('Lỗi lấy danh sách:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  // 2. Xử lý Đăng xuất
  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn thoát không?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Thoát',
        onPress: () => {
          auth()
            .signOut()
            .then(() => navigation.replace('Login'));
        },
      },
    ]);
  };

  // 3. HÀNH ĐỘNG: BẤM VÀO XEM LIVE (Đã cập nhật logic lướt)
  const handleJoinRoom = item => {
    // Tìm vị trí của phòng này trong danh sách để bắt đầu lướt từ đó
    const index = streams.findIndex(s => s.id === item.id);

    navigation.navigate('LiveRoom', {
      isStreamer: false,
      roomID: item.id,
      userName: currentUserName,

      // 👇 Dữ liệu quan trọng để lướt TikTok style
      streamsList: streams,
      initialIndex: index !== -1 ? index : 0,
    });
  };

  // 👇 4. HÀM RENDER ITEM (ĐÂY LÀ PHẦN EM BỊ THIẾU)
  const renderItem = ({item}) => (
    <TouchableOpacity style={styles.card} onPress={() => handleJoinRoom(item)}>
      {/* Ảnh đại diện giả */}
      <View style={styles.thumbnailPlaceholder}>
        <Text style={{fontSize: 40, color: '#fff'}}>
          {item.id.charAt(item.id.length - 1).toUpperCase()}
        </Text>
      </View>

      {/* Thông tin phòng */}
      <View style={styles.info}>
        <Text style={styles.roomTitle} numberOfLines={1}>
          {item.title ? item.title : `Phòng Live ${item.id}`}
        </Text>
        <Text style={styles.streamerName}>Idol: {item.id}</Text>
      </View>

      {/* Nhãn Live đỏ */}
      <View style={styles.liveBadge}>
        <Text style={styles.liveText}>🔴 LIVE</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e272e" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>LiveConnect 🔥</Text>
          <Text style={styles.subHeader}>Hi, {currentUserName}</Text>
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách phòng */}
      <FlatList
        data={streams}
        keyExtractor={item => item.id}
        renderItem={renderItem} // 👈 Nó gọi hàm renderItem ở trên
        contentContainerStyle={{padding: 15}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchStreams}
            tintColor="white"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có ai livestream cả...</Text>
            <Text style={{color: '#aaa', marginTop: 10}}>
              Vuốt xuống để làm mới danh sách
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#121212'},

  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#1e272e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {color: 'white', fontSize: 24, fontWeight: 'bold'},
  subHeader: {color: '#bdc3c7', fontSize: 14, marginTop: 4},
  logoutBtn: {padding: 8, backgroundColor: '#34495e', borderRadius: 8},
  logoutText: {color: '#ff7675', fontWeight: 'bold'},

  card: {
    flexDirection: 'row',
    backgroundColor: '#333',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    alignItems: 'center',
  },
  thumbnailPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {flex: 1, paddingHorizontal: 15, justifyContent: 'center'},
  roomTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  streamerName: {color: '#bdc3c7', fontSize: 13},

  liveBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 5,
    marginRight: 10,
  },
  liveText: {color: '#FE2C55', fontWeight: 'bold', fontSize: 12},

  emptyContainer: {alignItems: 'center', marginTop: 100},
  emptyText: {color: 'white', fontSize: 18, fontWeight: 'bold'},
});

export default HomeScreen;
