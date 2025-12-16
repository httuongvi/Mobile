import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  PermissionsAndroid,
  BackHandler,
  Dimensions,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import {io} from 'socket.io-client';

const VLCPlayer = require('react-native-vlc-media-player').VLCPlayer;
import {ApiVideoLiveStreamView} from '@api.video/react-native-livestream';
import FloatingHeart from './FloatingHeart';

// 👇 IP MÁY TÍNH CỦA BẠN
const SERVER_IP = '192.168.1.10';
const SERVER_URL = `http://${SERVER_IP}:3000`;
const {height} = Dimensions.get('window');

const GIFT_LIST = [
  {id: 1, name: 'Hoa hồng', icon: '🌹', price: 1},
  {id: 2, name: 'Cà phê', icon: '☕', price: 5},
  {id: 3, name: 'Bắn tim', icon: '💖', price: 10},
  {id: 4, name: 'Siêu xe', icon: '🏎️', price: 100},
  {id: 5, name: 'Tên lửa', icon: '🚀', price: 500},
  {id: 6, name: 'Vương miện', icon: '👑', price: 1000},
];

const formatDuration = seconds => {
  if (seconds < 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
    : `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
};

// --- COMPONENT HIỆU ỨNG QUÀ ---
const GiftNotification = ({giftData, onComplete}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (giftData) {
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
        Animated.delay(2000),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onComplete) onComplete();
      });
    }
  }, [giftData]);

  if (!giftData) return null;

  return (
    <Animated.View
      style={[
        styles.giftNotifContainer,
        {opacity: animValue, transform: [{scale: animValue}]},
      ]}>
      <View style={styles.giftNotifContent}>
        <Text style={styles.giftIconBig}>{giftData.giftIcon}</Text>
        <View>
          <Text style={styles.giftSenderName}>{giftData.senderName}</Text>
          <Text style={styles.giftSentText}>đã gửi {giftData.giftName}</Text>
        </View>
        <Text style={styles.giftCount}>x1</Text>
      </View>
    </Animated.View>
  );
};

// --- COMPONENT VIEWER ---
const ViewerPage = ({roomID, userName, navigation, isActive}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [hearts, setHearts] = useState([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [currentGift, setCurrentGift] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.connect();
    // Ép kiểu String cho chắc chắn
    socket.emit('join_room', String(roomID));

    socket.on('receive_message', data => setMessages(prev => [...prev, data]));
    socket.on('receive_heart', () => addHeart());

    // 👇 LOGIC HIỂN THỊ SỐ VIEW: Server trả về tổng, Client trừ 1 (Streamer)
    socket.on('update_viewer_count', total => {
      setViewerCount(Math.max(0, total - 1));
    });

    socket.on('receive_gift', data => setCurrentGift(data));
    socket.on('stream_ended', () =>
      Alert.alert('Thông báo', 'Idol đã tắt live rồi!', [{text: 'OK'}]),
    );

    return () => {
      socket.emit('leave_room', String(roomID));
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomID, isActive]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current) return;
    socketRef.current.emit('send_message', {
      roomID,
      user: userName,
      message: inputMessage,
    });
    setInputMessage('');
  };

  const addHeart = () => {
    setHearts(old => [
      ...old,
      {
        id: Date.now() + Math.random(),
        right: Math.floor(Math.random() * 60) + 20,
      },
    ]);
  };
  const sendHeart = () => {
    addHeart();
    socketRef.current?.emit('send_heart', roomID);
  };
  const removeHeart = id => setHearts(old => old.filter(h => h.id !== id));

  const sendGift = gift => {
    setShowGiftModal(false);
    socketRef.current?.emit('send_gift', {
      roomID,
      senderName: userName,
      giftName: gift.name,
      giftIcon: gift.icon,
    });
  };

  return (
    <View style={styles.pageContainer}>
      <View style={styles.videoLayer}>
        {isActive && (
          <VLCPlayer
            style={{width: '100%', height: '100%'}}
            source={{uri: `http://${SERVER_IP}:8000/live/${roomID}.flv`}}
            autoplay={true}
            resizeMode="cover"
            initOptions={['--network-caching=150', '--rtsp-tcp']}
          />
        )}
      </View>

      {/* 👇 LỚP HIỆU ỨNG (TIM, QUÀ) ĐƯA RA NGOÀI INPUT ĐỂ KHÔNG BỊ CHE */}
      <View style={styles.centerScreenLayer} pointerEvents="none">
        <GiftNotification
          giftData={currentGift}
          onComplete={() => setCurrentGift(null)}
        />
      </View>
      <View style={styles.heartContainer} pointerEvents="none">
        {hearts.map(h => (
          <FloatingHeart
            key={h.id}
            style={{right: h.right}}
            onComplete={() => removeHeart(h.id)}
          />
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlayLayer}>
        <View style={styles.topHeader}>
          <View style={styles.liveTagContainer}>
            <Text style={styles.liveTagText}>LIVE</Text>
          </View>
          <View style={styles.viewerContainer}>
            <Text style={styles.viewerText}>👁 {viewerCount}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.replace('Home')}
            style={styles.closeBtn}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chatArea}>
          <FlatList
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.chatBubble}>
                <Text style={styles.chatUser}>{item.user}: </Text>
                <Text style={styles.chatContent}>{item.message}</Text>
              </View>
            )}
            inverted
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Chat..."
            placeholderTextColor="#eee"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            onPress={() => setShowGiftModal(true)}
            style={styles.giftBtn}>
            <Text style={{fontSize: 24}}>🎁</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <Text style={{color: 'white'}}>Gửi</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={sendHeart} style={styles.heartBtn}>
            <Text style={{fontSize: 24}}>❤️</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showGiftModal}
        onRequestClose={() => setShowGiftModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGiftModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tặng quà 🎁</Text>
            <View style={styles.gridGift}>
              {GIFT_LIST.map(gift => (
                <TouchableOpacity
                  key={gift.id}
                  style={styles.giftItem}
                  onPress={() => sendGift(gift)}>
                  <Text style={styles.giftIcon}>{gift.icon}</Text>
                  <Text style={styles.giftName}>{gift.name}</Text>
                  <Text style={styles.giftPrice}>{gift.price} xu</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// --- COMPONENT CHÍNH ---
const LiveRoomScreen = ({route, navigation}) => {
  const {
    isStreamer = false,
    roomID,
    roomTitle,
    userName = 'Người lạ',
    streamsList = [],
    initialIndex = 0,
  } = route.params || {};
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [duration, setDuration] = useState(0);

  // Streamer State
  const [isPublishing, setIsPublishing] = useState(false);
  const [streamerHearts, setStreamerHearts] = useState([]);
  const [streamerMessages, setStreamerMessages] = useState([]);
  const [streamerViewCount, setStreamerViewCount] = useState(0);
  const [streamerGift, setStreamerGift] = useState(null);
  const [streamerInput, setStreamerInput] = useState('');

  const liveStreamRef = useRef(null);
  const streamerSocket = useRef(null);

  // Timer
  useEffect(() => {
    let timer;
    if (isPublishing) timer = setInterval(() => setDuration(p => p + 1), 1000);
    return () => clearInterval(timer);
  }, [isPublishing]);

  // Logic Streamer
  useEffect(() => {
    if (!isStreamer) return;

    streamerSocket.current = io(SERVER_URL);
    const s = streamerSocket.current;

    s.connect();
    // 🛑 QUAN TRỌNG: Ép kiểu String để Streamer vào đúng phòng Socket với Viewer
    s.emit('join_room', String(roomID));

    s.on('receive_message', data =>
      setStreamerMessages(prev => [...prev, data]),
    );
    s.on('receive_heart', () =>
      setStreamerHearts(old => [
        ...old,
        {
          id: Date.now() + Math.random(),
          right: Math.floor(Math.random() * 60) + 20,
        },
      ]),
    );

    // 👇 NHẬN QUÀ CHO STREAMER
    s.on('receive_gift', data => {
      console.log('Streamer received gift:', data); // Debug log
      setStreamerGift(data);
    });

    s.on('update_viewer_count', total =>
      setStreamerViewCount(Math.max(0, total - 1)),
    );

    const requestPermission = async () => {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
      } catch (e) {}
    };
    requestPermission();

    setTimeout(() => {
      liveStreamRef.current
        ?.startStreaming(String(roomID), `rtmp://${SERVER_IP}/live`)
        .then(() => {
          setIsPublishing(true);
          s.emit('update_stream_info', {
            roomID: String(roomID),
            title: roomTitle,
          });
        })
        .catch(e => console.log(e));
    }, 1000);

    const onBackPress = () => {
      handleStop();
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      s.emit('end_stream', String(roomID));
      s.disconnect();
      liveStreamRef.current?.stopStreaming();
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [isStreamer]);

  const sendStreamerMessage = () => {
    if (!streamerInput.trim() || !streamerSocket.current) return;
    streamerSocket.current.emit('send_message', {
      roomID,
      user: userName || 'Idol',
      message: streamerInput,
    });
    setStreamerInput('');
  };

  const handleStop = () => {
    Alert.alert('Kết thúc', 'Dừng Live?', [
      {text: 'Hủy'},
      {
        text: 'Dừng',
        onPress: () =>
          navigation.replace('PreLive', {
            savedRoomName: roomID,
            currentUserName: userName,
          }),
      },
    ]);
  };
  const removeStreamerHeart = id =>
    setStreamerHearts(old => old.filter(h => h.id !== id));

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index);
  }).current;

  // 1. VIEWER UI
  if (!isStreamer) {
    return (
      <View style={{flex: 1, backgroundColor: 'black'}}>
        <FlatList
          data={streamsList}
          keyExtractor={item => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(data, index) => ({
            length: height,
            offset: height * index,
            index,
          })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{itemVisiblePercentThreshold: 50}}
          windowSize={2}
          removeClippedSubviews={true}
          renderItem={({item, index}) => (
            <ViewerPage
              roomID={item.id}
              userName={userName}
              navigation={navigation}
              isActive={index === activeIndex}
            />
          )}
        />
      </View>
    );
  }

  // 2. STREAMER UI
  return (
    <View style={styles.container}>
      <View style={styles.videoLayer}>
        <ApiVideoLiveStreamView
          style={{flex: 1}}
          ref={liveStreamRef}
          camera="back"
          enableAudio={true}
          video={{
            fps: 30,
            resolution: '360p',
            bitrate: 1024 * 1024,
            gopDuration: 1,
          }}
          audio={{bitrate: 128000, sampleRate: 44100, isStereo: true}}
        />
      </View>

      {/* 👇 CÁC LỚP HIỆU ỨNG NẰM NGOÀI CÙNG - KHÔNG BỊ CHE */}
      <View style={styles.centerScreenLayer} pointerEvents="none">
        <GiftNotification
          giftData={streamerGift}
          onComplete={() => setStreamerGift(null)}
        />
      </View>
      <View style={styles.heartContainer} pointerEvents="none">
        {streamerHearts.map(h => (
          <FloatingHeart
            key={h.id}
            style={{right: h.right}}
            onComplete={() => removeStreamerHeart(h.id)}
          />
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlayLayer}>
        <View style={styles.topHeader}>
          <View style={styles.liveTagContainer}>
            <Text style={styles.liveTagText}>LIVE</Text>
          </View>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatDuration(duration)}</Text>
          </View>
          <View style={styles.viewerContainer}>
            <Text style={styles.viewerText}>👁 {streamerViewCount}</Text>
          </View>
          <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
            <Text style={styles.stopText}>Kết thúc</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chatArea}>
          <FlatList
            data={streamerMessages}
            inverted
            renderItem={({item}) => (
              <View style={styles.chatBubble}>
                <Text style={styles.chatUser}>{item.user}: </Text>
                <Text style={styles.chatContent}>{item.message}</Text>
              </View>
            )}
          />
        </View>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={streamerInput}
            onChangeText={setStreamerInput}
            placeholder="Trả lời Fan..."
            placeholderTextColor="#eee"
            onSubmitEditing={sendStreamerMessage}
          />
          <TouchableOpacity
            onPress={sendStreamerMessage}
            style={styles.sendBtn}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'black'},
  pageContainer: {height: height, width: '100%', backgroundColor: 'black'},
  videoLayer: {position: 'absolute', top: 0, left: 0, bottom: 0, right: 0},
  overlayLayer: {flex: 1, zIndex: 10, justifyContent: 'flex-end', padding: 15},

  topHeader: {
    position: 'absolute',
    top: 45,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 40,
  },
  liveTagContainer: {
    backgroundColor: '#FE2C55',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  liveTagText: {color: 'white', fontWeight: 'bold', fontSize: 12},
  timerContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
  },
  timerText: {color: 'white', fontSize: 14, fontWeight: '600'},
  viewerContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  viewerText: {color: 'white', fontSize: 14, fontWeight: '600'},
  stopBtn: {
    marginLeft: 'auto',
    backgroundColor: '#ff4757',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  stopText: {color: 'white', fontWeight: 'bold'},
  closeBtn: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  chatArea: {height: 200, width: '75%', marginBottom: 10},
  chatBubble: {
    flexDirection: 'row',
    marginBottom: 5,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  chatUser: {color: '#FFD700', fontWeight: 'bold', fontSize: 13},
  chatContent: {color: 'white', fontSize: 13},
  inputArea: {flexDirection: 'row', alignItems: 'center', marginBottom: 5},
  input: {
    flex: 1,
    height: 45,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 25,
    paddingHorizontal: 20,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  sendBtn: {
    marginLeft: 10,
    backgroundColor: '#2ed573',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  heartBtn: {
    marginLeft: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 25,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  giftBtn: {
    marginLeft: 10,
    backgroundColor: '#FE2C55',
    borderRadius: 25,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FE2C55',
  },

  // FIX: Heart và Gift nằm đè lên mọi thứ
  heartContainer: {
    position: 'absolute',
    bottom: 100,
    right: 0,
    width: 100,
    height: 400,
    zIndex: 90,
  },
  centerScreenLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f1f1f',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  gridGift: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  giftItem: {
    width: '30%',
    backgroundColor: '#333',
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
    marginBottom: 15,
  },
  giftIcon: {fontSize: 35, marginBottom: 5},
  giftName: {color: 'white', fontSize: 12, fontWeight: 'bold'},
  giftPrice: {color: '#FFD700', fontSize: 10},

  giftNotifContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FE2C55',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  giftNotifContent: {alignItems: 'center'},
  giftIconBig: {fontSize: 60, marginBottom: 10},
  giftSenderName: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  giftSentText: {color: 'white', fontSize: 14, textAlign: 'center'},
  giftCount: {
    color: '#2ed573',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 5,
    fontStyle: 'italic',
  },
});

export default LiveRoomScreen;
