import { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { banners } from '@/src/services/mock/store';
import { palette } from '@/src/theme/tokens';

const W = Dimensions.get('window').width - 40;
const tones: Record<string, readonly [string, string]> = {
  orange: [palette.orange, palette.red],
  sky: [palette.sky, '#0369A1'],
  red: [palette.red, '#7F1D1D'],
};

export function BannerSlider() {
  const [i, setI] = useState(0);
  const ref = useRef<FlatList>(null);
  return (
    <View>
      <FlatList
        ref={ref}
        horizontal
        pagingEnabled
        data={banners}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / W))}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => (
          <LinearGradient colors={[...(tones[item.tone] ?? tones.orange)]} style={styles.slide}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>{item.subtitle}</Text>
          </LinearGradient>
        )}
      />
      <View style={styles.dots}>
        {banners.map((b, idx) => (
          <View key={b.id} style={[styles.dot, { opacity: idx === i ? 1 : 0.3 }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { width: W, height: 110, borderRadius: 20, padding: 18, marginRight: 0 },
  title: { color: '#fff', fontSize: 18, fontFamily: 'Outfit_700Bold' },
  sub: { color: 'rgba(255,255,255,0.9)', marginTop: 6, fontFamily: 'Outfit_400Regular' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.orange },
});
