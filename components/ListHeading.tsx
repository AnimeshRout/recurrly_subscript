import { View, Text, Pressable } from 'react-native';

const ListHeading = ({ title, onAction, actionLabel = 'View all' }: ListHeadingProps) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontFamily: 'sans-bold',
          color: '#081126',
        }}
      >
        {title}
      </Text>
      {onAction ? (
        <Pressable
          onPress={onAction}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 5,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.15)',
          }}
          accessibilityRole="button"
        >
          <Text
            style={{
              fontSize: 13,
              fontFamily: 'sans-semibold',
              color: '#081126',
            }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default ListHeading;
