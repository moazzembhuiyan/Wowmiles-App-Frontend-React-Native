import { useState } from 'react';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { ChevronDown, Upload } from 'lucide-react-native';
import { Alert, Pressable, Text, View } from 'react-native';
import { BackButton, Field, Heading, PrimaryButton, Screen } from '@/components/ui';

const agencyTypes = ['Travel agency', 'Tour operator', 'Corporate travel'];

export default function AgencyVerificationScreen() {
  const [agencyName, setAgencyName] = useState('Beverly Travel Ltd.');
  const [agencyType, setAgencyType] = useState('');
  const [registration, setRegistration] = useState('IATA 23-4 5678 9');
  const [documentName, setDocumentName] = useState('');
  const [showTypes, setShowTypes] = useState(false);

  async function chooseDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled) setDocumentName(result.assets[0].name);
    } catch {
      Alert.alert('Could not open files', 'Please try selecting your trade licence again.');
    }
  }

  function submitForVerification() {
    if (!agencyName.trim() || !agencyType || !registration.trim() || !documentName) {
      Alert.alert('Complete agency details', 'Add your agency details and upload a trade licence before submitting.');
      return;
    }
    router.push('/(auth)/otp');
  }

  return (
    <Screen>
      <View className="pt-2">
        <BackButton />
        <Heading
          title="Verify your agency"
          description="We check every agency before activating a WowMiles account. This usually takes 1–2 business days."
        />
        <Field label="Agency name" value={agencyName} onChangeText={setAgencyName} placeholder="Agency name" autoCapitalize="words" />
        <Text className="mb-2 text-[12px] font-medium text-[#454B59]">Agency type</Text>
        <Pressable
          onPress={() => setShowTypes((value) => !value)}
          className="mb-4 h-[50px] flex-row items-center justify-between rounded-[10px] border border-line bg-white px-3.5"
        >
          <Text className={`text-[14px] ${agencyType ? 'text-ink' : 'text-[#A4AAB5]'}`}>
            {agencyType || 'Select agency type'}
          </Text>
          <ChevronDown color="#858C9B" size={18} />
        </Pressable>
        {showTypes ? (
          <View className="-mt-3 mb-4 rounded-[10px] border border-line bg-white">
            {agencyTypes.map((type) => (
              <Pressable
                key={type}
                onPress={() => {
                  setAgencyType(type);
                  setShowTypes(false);
                }}
                className="border-b border-line px-3.5 py-3 last:border-b-0"
              >
                <Text className="text-[14px] text-ink">{type}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <Field label="IATA / registration number" value={registration} onChangeText={setRegistration} placeholder="Registration number" autoCapitalize="characters" />
        <Field label="Country of operation" value="Bangladesh" editable={false} />
        <Pressable
          onPress={chooseDocument}
          className="mb-5 min-h-[60px] flex-row items-center rounded-[10px] border border-dashed border-brand bg-[#F2F3FC] px-4 py-3"
        >
          <Upload color="#4145B6" size={20} />
          <View className="ml-3 flex-1">
            <Text className="text-[13px] font-semibold text-brand">
              {documentName || 'Upload trade licence'}
            </Text>
            <Text className="mt-1 text-[11px] text-muted">PDF or JPG, up to 10 MB</Text>
          </View>
        </Pressable>
        <PrimaryButton title="Submit for verification" onPress={submitForVerification} />
      </View>
    </Screen>
  );
}
