import { View, Text, Image } from 'react-native';
import { formatCurrency } from '@/lib/utils';

const UpcomingSubscriptionCard = ({ name, price, daysLeft, icon, currency }: UpcomingSubscription) => {
  return (
    <View
      style={{
        width: 168,
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: '#fff8e7',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        padding: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Image
          source={icon}
          resizeMode="contain"
          style={{ width: 40, height: 40, borderRadius: 10 }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 16, fontFamily: 'sans-bold', color: '#081126' }}
            numberOfLines={1}
          >
            {formatCurrency(price, currency)}
          </Text>
          <Text
            style={{ fontSize: 12, fontFamily: 'sans-medium', color: 'rgba(0, 0, 0, 0.55)' }}
            numberOfLines={1}
          >
            {daysLeft > 1 ? `${daysLeft} days left` : 'Last day'}
          </Text>
        </View>
      </View>

      <Text
        style={{ fontSize: 14, fontFamily: 'sans-bold', color: '#081126' }}
        numberOfLines={1}
      >
        {name}
      </Text>
    </View>
  );
};

export default UpcomingSubscriptionCard;
