import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet} from 'react-native';

const FloatingHeart = ({onComplete, style}) => {
  // Khởi tạo vị trí ban đầu (Animation Value)
  const position = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Chạy song song 2 hiệu ứng: Bay lên và Mờ dần
    Animated.parallel([
      Animated.timing(position, {
        toValue: -300, // Bay lên 300 đơn vị (âm là lên trên)
        duration: 2500, // Trong 2.5 giây
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0, // Mờ dần về 0
        duration: 2500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Khi chạy xong thì gọi hàm này để xóa trái tim khỏi bộ nhớ
      onComplete();
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.heart,
        style,
        {
          opacity: opacity,
          transform: [{translateY: position}],
        },
      ]}>
      {/* Em có thể thay bằng icon ảnh trái tim nếu muốn đẹp hơn */}
      <Animated.Text style={styles.text}>❤️</Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  heart: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 30, // Kích thước trái tim
  },
});

export default FloatingHeart;
