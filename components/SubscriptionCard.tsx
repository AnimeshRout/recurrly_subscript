import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native';
import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from '@/lib/utils';

const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  category,
  plan,
  renewalDate,
  expanded,
  onPress,
  onCancelPress,
  isCancelling,
  paymentMethod,
  startDate,
  status,
}: SubscriptionCardProps) => {
  const isActive = status === 'active';
  const bgColor = expanded ? '#8fd1bd' : (color || '#fff8e7');

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: bgColor,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
      }}
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
          <Image
            source={icon}
            resizeMode="contain"
            style={{ width: 48, height: 48, borderRadius: 12 }}
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{ fontSize: 16, fontFamily: 'sans-bold', color: '#081126', marginBottom: 2 }}
            >
              {name}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ fontSize: 13, fontFamily: 'sans-medium', color: 'rgba(0, 0, 0, 0.55)' }}
            >
              {plan?.trim() || category?.trim() || (renewalDate ? formatSubscriptionDateTime(renewalDate) : '')}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
          <Text style={{ fontSize: 16, fontFamily: 'sans-bold', color: '#081126', marginBottom: 2 }}>
            {formatCurrency(price, currency)}
          </Text>
          <Text style={{ fontSize: 12, fontFamily: 'sans-medium', color: 'rgba(0, 0, 0, 0.55)' }}>
            {billing}
          </Text>
        </View>
      </View>

      {expanded ? (
        <View
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 0, 0, 0.08)',
            gap: 12,
          }}
        >
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, fontFamily: 'sans-medium', color: 'rgba(0, 0, 0, 0.6)' }}>
                Payment:
              </Text>
              <Text style={{ fontSize: 13, fontFamily: 'sans-bold', color: '#081126' }}>
                {paymentMethod?.trim() ?? 'Not provided'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, fontFamily: 'sans-medium', color: 'rgba(0, 0, 0, 0.6)' }}>
                Plan:
              </Text>
              <Text style={{ fontSize: 13, fontFamily: 'sans-bold', color: '#081126' }}>
                {plan?.trim() || category?.trim() || 'Not provided'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, fontFamily: 'sans-medium', color: 'rgba(0, 0, 0, 0.6)' }}>
                Started:
              </Text>
              <Text style={{ fontSize: 13, fontFamily: 'sans-bold', color: '#081126' }}>
                {startDate ? formatSubscriptionDateTime(startDate) : 'Not provided'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, fontFamily: 'sans-medium', color: 'rgba(0, 0, 0, 0.6)' }}>
                Status:
              </Text>
              <Text style={{ fontSize: 13, fontFamily: 'sans-bold', color: '#081126' }}>
                {status ? formatStatusLabel(status) : 'Not provided'}
              </Text>
            </View>
          </View>

          {onCancelPress && isActive ? (
            <Pressable
              style={{
                marginTop: 8,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 9999,
                backgroundColor: '#081126',
                paddingVertical: 12,
                opacity: isCancelling ? 0.6 : 1,
              }}
              onPress={onCancelPress}
              disabled={isCancelling}
              accessibilityRole="button"
              accessibilityLabel="Cancel subscription"
            >
              {isCancelling ? (
                <ActivityIndicator color="#fff9e3" size="small" />
              ) : (
                <Text style={{ fontSize: 14, fontFamily: 'sans-bold', color: '#fff9e3' }}>
                  Cancel Subscription
                </Text>
              )}
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
};

export default SubscriptionCard;
