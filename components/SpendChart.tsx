import { Text, View } from 'react-native';

type ChartPoint = {
  label: string;
  value: number;
  highlight?: boolean;
};

export default function SpendChart({ points }: { points: ChartPoint[] }) {
  const max = Math.max(...points.map((point) => point.value), 1);

  return (
    <View
      style={{
        backgroundColor: '#fff8e7',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
      }}
    >
      <View
        style={{
          height: 150,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 8,
          paddingBottom: 8,
        }}
      >
        {points.map((point) => (
          <View key={point.label} style={{ flex: 1, alignItems: 'center' }}>
            <View
              style={{
                width: 16,
                borderRadius: 9999,
                backgroundColor: point.highlight ? '#ea7a53' : '#081126',
                height: Math.max(14, (point.value / max) * 130),
              }}
            />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        {points.map((point) => (
          <Text
            key={point.label}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 12,
              fontFamily: 'sans-semibold',
              color: point.highlight ? '#ea7a53' : 'rgba(0, 0, 0, 0.55)',
            }}
          >
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
