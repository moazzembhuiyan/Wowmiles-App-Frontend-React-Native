import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useMutation } from '@tanstack/react-query';
import { CircleCheck, CircleX } from 'lucide-react-native';
import { AcademyEyebrow, AcademyStatusFrame } from './academy-ui';
import { verifyCertificate } from '@/lib/api/academy';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function AcademyVerifyScreen({ onBack }: { onBack: () => void }) {
  const [code, setCode] = useState('');
  const verify = useMutation({ mutationFn: () => verifyCertificate(code) });
  const result = verify.data;
  const valid = result?.status === 'issued';
  const blocked = !code.trim() || verify.isPending;

  return (
    <AcademyStatusFrame onBack={onBack}>
      <StatusBar style="dark" />
      <AcademyEyebrow>VERIFY A CERTIFICATE</AcademyEyebrow>
      <Text className="mt-2 text-[11px] leading-[16px] text-[#747C8D]">
        Enter the verification code printed on the certificate.
      </Text>
      <TextInput
        value={code}
        onChangeText={(value) => {
          setCode(value);
          if (!verify.isIdle) verify.reset();
        }}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Verification code"
        accessibilityLabel="Verification code"
        className="mt-3 min-h-[44px] rounded-[12px] border border-[#E8EAF0] bg-white px-3 text-[13px] text-[#202638]"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: blocked }}
        disabled={blocked}
        onPress={() => verify.mutate()}
        className={`mt-3 min-h-[44px] items-center justify-center rounded-full ${blocked ? 'bg-[#737782]' : 'bg-[#FFB91F]'}`}
      >
        <Text className="text-[13px] font-bold text-[#171923]">{verify.isPending ? 'Checking...' : 'Verify'}</Text>
      </Pressable>

      {verify.isError ? (
        <Text className="mt-4 text-[11px] text-[#B42318]">{verify.error.message}</Text>
      ) : verify.isSuccess ? (
        <View className="mt-4 rounded-[16px] border border-[#E8EAF0] bg-white p-4">
          <View className="flex-row items-center">
            {valid ? <CircleCheck color="#08714F" size={20} /> : <CircleX color="#B42318" size={20} />}
            <Text className={`ml-2 text-[13px] font-semibold ${valid ? 'text-[#08714F]' : 'text-[#B42318]'}`}>
              {!result ? 'Certificate not found' : valid ? 'Valid certificate' : result.status === 'revoked' ? 'Certificate revoked' : 'Certificate expired'}
            </Text>
          </View>
          {result ? (
            <View className="mt-3">
              <Text className="text-[12px] font-semibold text-[#202638]">{result.name}</Text>
              <Text className="mt-1 text-[11px] text-[#747C8D]">{result.course}</Text>
              <Text className="mt-1 text-[11px] text-[#747C8D]">Issued {formatDate(result.issuedAt)}</Text>
            </View>
          ) : (
            <Text className="mt-2 text-[11px] text-[#747C8D]">Check the code and try again.</Text>
          )}
        </View>
      ) : null}
    </AcademyStatusFrame>
  );
}
