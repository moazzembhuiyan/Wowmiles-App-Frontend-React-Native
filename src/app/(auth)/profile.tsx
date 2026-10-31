import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import {
  AuthField,
  AuthFooter,
  AuthFormScreen,
  AuthHeading,
} from '@/components/figma-auth';
import { useToast } from '@/components/toast';

export default function ProfileSetupScreen() {
  const [jobTitle, setJobTitle] = useState('');
  const [city, setCity] = useState('');
  const showToast = useToast();

  function finishProfile() {
    if (!jobTitle.trim() || !city.trim()) {
      showToast('Finish your profile', 'Add your job title and city to continue.');
      return;
    }
    router.push('/(auth)/notifications');
  }

  return (
    <AuthFormScreen
      step={3}
      footer={
        <AuthFooter
          eyebrow="Almost there"
          title="Complete your profile"
          buttonLabel="Continue"
          onPress={finishProfile}
        />
      }
    >
      <View>
        <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[1px] text-[#39479F]">
          Your profile
        </Text>
        <AuthHeading
          title="A little about you"
          description="Help us personalise your WowMiles experience."
        />
        <AuthField
          label="Job title"
          value={jobTitle}
          onChangeText={setJobTitle}
          placeholder="e.g. Travel consultant"
          autoCapitalize="words"
        />
        <AuthField
          label="City"
          value={city}
          onChangeText={setCity}
          placeholder="Your city"
          autoCapitalize="words"
        />
        <AuthField label="Country" value="Bangladesh" editable={false} />
      </View>
    </AuthFormScreen>
  );
}
