import { View } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '@/src/theme/ThemeContext';

export function Skeleton({ h = 16, w = '100%', r = 12 }: { h?: number; w?: number | string; r?: number }) {
  const { theme } = useTheme();
  return (
    <MotiView
      from={{ opacity: 0.35 }}
      animate={{ opacity: 1 }}
      transition={{ loop: true, type: 'timing', duration: 800 }}
      style={{ height: h, width: w as number, borderRadius: r, backgroundColor: theme.border, marginBottom: 10 }}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <View>
      <Skeleton h={160} r={24} />
      <Skeleton h={80} r={20} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Skeleton h={88} w={88} r={20} />
        <Skeleton h={88} w={88} r={20} />
        <Skeleton h={88} w={88} r={20} />
      </View>
    </View>
  );
}
