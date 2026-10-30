import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import { icons } from '@/constants/icons';
import dayjs from 'dayjs';

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

type Frequency = 'Monthly' | 'Yearly';
type Category =
  | 'Entertainment'
  | 'AI Tools'
  | 'Developer Tools'
  | 'Design'
  | 'Productivity'
  | 'Cloud'
  | 'Music'
  | 'Other';

const CATEGORIES: Category[] = [
  'Entertainment',
  'AI Tools',
  'Developer Tools',
  'Design',
  'Productivity',
  'Cloud',
  'Music',
  'Other',
];

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: '#ff6b6b',
  'AI Tools': '#b8d4e3',
  'Developer Tools': '#e8def8',
  Design: '#f5c542',
  Productivity: '#95e1d3',
  Cloud: '#c5b8e8',
  Music: '#8fd1bd',
  Other: '#d4d4d4',
};

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('Monthly');
  const [category, setCategory] = useState<Category>('Other');

  const isValidPrice = () => {
    const trimmedPrice = price.trim();
    if (!trimmedPrice) return false;
    if (!/^\s*[+-]?(\d+(\.\d+)?|\.\d+)\s*$/.test(trimmedPrice)) return false;
    const numValue = Number(trimmedPrice);
    return Number.isFinite(numValue) && numValue > 0;
  };

  const isValidForm = name.trim() !== '' && isValidPrice();

  const resetForm = () => {
    setName('');
    setPrice('');
    setFrequency('Monthly');
    setCategory('Other');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!isValidForm) return;

    const priceValue = Number(price.trim());
    const now = dayjs();
    const renewalDate = frequency === 'Monthly' ? now.add(1, 'month') : now.add(1, 'year');

    const newSubscription: Subscription = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      price: priceValue,
      currency: 'USD',
      frequency,
      category,
      status: 'active',
      startDate: now.toISOString(),
      renewalDate: renewalDate.toISOString(),
      icon: icons.wallet,
      iconKey: 'wallet',
      billing: frequency,
      color: CATEGORY_COLORS[category],
    };

    onSubmit(newSubscription);
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
          onPress={handleClose}
        >
          <Pressable
            style={{
              backgroundColor: '#fff9e3',
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              maxHeight: '85%',
              width: '100%',
              maxWidth: 540,
              alignSelf: 'center',
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 18,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(0, 0, 0, 0.08)',
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'sans-bold',
                  color: '#081126',
                }}
              >
                New Subscription
              </Text>
              <Pressable
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#f6eecf',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleClose}
              >
                <Text style={{ fontSize: 16, fontFamily: 'sans-bold', color: '#081126' }}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 36, gap: 16 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Name Field */}
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'sans-semibold',
                    color: '#081126',
                    marginBottom: 8,
                  }}
                >
                  Name
                </Text>
                <TextInput
                  style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.12)',
                    backgroundColor: '#fff8e7',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 15,
                    fontFamily: 'sans-medium',
                    color: '#081126',
                  }}
                  placeholder="e.g. Netflix, Spotify"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Price Field */}
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'sans-semibold',
                    color: '#081126',
                    marginBottom: 8,
                  }}
                >
                  Price (USD)
                </Text>
                <TextInput
                  style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.12)',
                    backgroundColor: '#fff8e7',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 15,
                    fontFamily: 'sans-medium',
                    color: '#081126',
                  }}
                  placeholder="0.00"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Frequency Toggle */}
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'sans-semibold',
                    color: '#081126',
                    marginBottom: 8,
                  }}
                >
                  Frequency
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {(['Monthly', 'Yearly'] as Frequency[]).map((option) => {
                    const isActive = frequency === option;
                    return (
                      <Pressable
                        key={option}
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          paddingVertical: 14,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: isActive ? '#ea7a53' : 'rgba(0, 0, 0, 0.12)',
                          backgroundColor: isActive ? 'rgba(234, 122, 83, 0.12)' : '#fff8e7',
                        }}
                        onPress={() => setFrequency(option)}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: 'sans-semibold',
                            color: isActive ? '#ea7a53' : 'rgba(0, 0, 0, 0.6)',
                          }}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Category Chips */}
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'sans-semibold',
                    color: '#081126',
                    marginBottom: 8,
                  }}
                >
                  Category
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {CATEGORIES.map((cat) => {
                    const isActive = category === cat;
                    return (
                      <Pressable
                        key={cat}
                        style={{
                          borderRadius: 9999,
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderWidth: 1,
                          borderColor: isActive ? '#ea7a53' : 'rgba(0, 0, 0, 0.12)',
                          backgroundColor: isActive ? 'rgba(234, 122, 83, 0.12)' : '#fff8e7',
                        }}
                        onPress={() => setCategory(cat)}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'sans-semibold',
                            color: isActive ? '#ea7a53' : 'rgba(0, 0, 0, 0.65)',
                          }}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Submit Button */}
              <Pressable
                style={{
                  marginTop: 8,
                  alignItems: 'center',
                  borderRadius: 16,
                  backgroundColor: '#ea7a53',
                  paddingVertical: 16,
                  opacity: isValidForm ? 1 : 0.5,
                }}
                onPress={handleSubmit}
                disabled={!isValidForm}
              >
                <Text style={{ fontSize: 16, fontFamily: 'sans-bold', color: '#081126' }}>
                  Create Subscription
                </Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
