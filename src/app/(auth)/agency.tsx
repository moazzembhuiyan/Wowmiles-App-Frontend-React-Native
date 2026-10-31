import { useState } from 'react';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Upload } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import {
  AuthField,
  AuthFooter,
  AuthFormScreen,
  AuthHeading,
} from '@/components/figma-auth';
import { useToast } from '@/components/toast';

const agencyTypes = ['Travel agency', 'Tour operator', 'Corporate travel'];

export default function AgencyVerificationScreen() {
  const [agencyName, setAgencyName] = useState('Beverly Travel Ltd.');
  const [agencyType, setAgencyType] = useState('');
  const [registration, setRegistration] = useState('IATA 23-4 5678 9');
  const [documentName, setDocumentName] = useState('');
  const showToast = useToast();

  async function chooseDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled) setDocumentName(result.assets[0].name);
    } catch (error) {
      showToast('Could not open files', 'Please try selecting your trade licence again.');
      console.error('Failed to select agency document', error);
    }
  }

  function submitForVerification() {
    if (!agencyName.trim() || !agencyType || !registration.trim() || !documentName) {
      showToast('Complete agency details', 'Add your agency details and upload a trade licence before submitting.');
      return;
    }
    router.push('/(auth)/otp');
  }

  return (
    <AuthFormScreen
      step={2}
      footer={
        <AuthFooter
          eyebrow="Next"
          title="Confirm your email"
          buttonLabel="Continue"
          onPress={submitForVerification}
        />
      }
    >
      <View>
        <AuthHeading
          title="Verify your agency"
          description="We check every agency before activating a WowMiles account."
        />
        <AuthField
          label="Agency name"
          value={agencyName}
          onChangeText={setAgencyName}
          placeholder="Agency name"
          autoCapitalize="words"
        />
        <Text className="mb-2 text-[13px] font-medium text-[#454B59]">Verify with</Text>
        <View className="mb-3 flex-row">
          {agencyTypes.slice(0, 2).map((type, index) => {
            const selected = agencyType === type || (!agencyType && index === 0);
            return (
              <Pressable
                key={type}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setAgencyType(type)}
                className={`mr-2 min-h-[58px] flex-1 justify-center rounded-[11px] border px-3 ${selected ? 'border-[#39479F] bg-[#F4F5FF]' : 'border-[#E0E3EB] bg-white'}`}
              >
                <Text className={`text-[12px] font-semibold ${selected ? 'text-[#39479F]' : 'text-[#565D6D]'}`}>
                  {index === 0 ? 'IATA number' : 'Chamber of Commerce'}
                </Text>
                <Text className="mt-1 text-[12px] text-[#858A96]">
                  {selected ? 'Selected' : 'Select this option'}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <AuthField
          label="IATA / registration number"
          value={registration}
          onChangeText={setRegistration}
          placeholder="Registration number"
          autoCapitalize="characters"
        />
        <AuthField label="Country of operation" value="Bangladesh" editable={false} />
        <Pressable
          accessibilityRole="button"
          onPress={chooseDocument}
          className="mb-3 min-h-[52px] flex-row items-center rounded-[11px] border border-dashed border-[#39479F] bg-[#F5F6FC] px-3"
        >
          <Upload color="#39479F" size={17} />
          <View className="ml-2.5 flex-1">
            <Text className="text-[13px] font-semibold text-[#39479F]">
              {documentName || 'Upload the document'}
            </Text>
            <Text className="mt-0.5 text-[12px] text-[#7C8391]">PDF or JPG, up to 10 MB</Text>
          </View>
        </Pressable>
      </View>
    </AuthFormScreen>
  );
}
