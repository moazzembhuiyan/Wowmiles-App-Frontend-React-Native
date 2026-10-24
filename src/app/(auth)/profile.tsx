import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { Field, Heading, PrimaryButton, Screen } from '@/components/ui';

export default function ProfileSetupScreen() {
  const [jobTitle, setJobTitle] = useState('');
  const [city, setCity] = useState('');

  function finishProfile() {
    if (!jobTitle.trim() || !city.trim()) {
      Alert.alert('Finish your profile', 'Add your job title and city to continue.');
      return;
    }
    router.push('/(auth)/notifications');
  }

  return (
    <Screen>
      <View className="pt-8">
        <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[1px] text-brand">Your profile</Text>
        <Heading title="A little about you" description="Help us personalise your WowMiles experience." />
        <Field label="Job title" value={jobTitle} onChangeText={setJobTitle} placeholder="e.g. Travel consultant" autoCapitalize="words" />
        <Field label="City" value={city} onChangeText={setCity} placeholder="Your city" autoCapitalize="words" />
        <Field label="Country" value="Bangladesh" editable={false} />
        <View className="mt-3">
          <PrimaryButton title="Continue" onPress={finishProfile} />
        </View>
      </View>
    </Screen>
  );
}
