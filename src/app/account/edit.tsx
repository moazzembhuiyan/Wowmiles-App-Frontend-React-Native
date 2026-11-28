import { useState } from 'react';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Text, View } from 'react-native';
import { MilesHeader, MilesScreen } from '@/components/miles-ui';
import { QueryView } from '@/components/states';
import { useToast } from '@/components/toast';
import { Field } from '@/components/ui';
import { Avatar, Chip, FieldError, FormButton, SectionLabel, goBack } from '@/components/hub/hub-ui';
import {
  fetchProfileSummary,
  fetchSpecialtyOptions,
  updateProfile,
  type ProfileSummary,
} from '@/lib/api/profile';

const MAX_SPECIALTIES = 5;

type Errors = Partial<Record<'name' | 'phone' | 'city', string>>;

function validate(name: string, phone: string, city: string): Errors {
  const errors: Errors = {};
  if (name.trim().length < 2) errors.name = 'Enter your full name.';
  if (!/^\+?[0-9 ()-]{7,20}$/.test(phone.trim())) errors.phone = 'Enter a valid mobile number.';
  if (city.trim().length > 80) errors.city = 'City must be 80 characters or fewer.';
  return errors;
}

function EditForm({ data }: { data: ProfileSummary }) {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState(data.profile.name);
  const [phone, setPhone] = useState(data.profile.phone);
  const [city, setCity] = useState(data.profile.city);
  const [specialties, setSpecialties] = useState<string[]>(data.profile.specialties.map((item) => item.key));
  const [errors, setErrors] = useState<Errors>({});
  const options = useQuery({ queryKey: ['profile', 'specialty-options'], queryFn: fetchSpecialtyOptions });

  const save = useMutation({
    mutationFn: () => updateProfile({ name, phone, city, specialties }),
    onSuccess: (summary) => {
      queryClient.setQueryData(['profile', 'summary'], summary);
      showToast('Profile saved', undefined, 'success');
      goBack('/(tabs)/profile');
    },
    onError: (error) => showToast('Could not save profile', error.message),
  });

  function toggle(key: string) {
    setSpecialties((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      if (current.length >= MAX_SPECIALTIES) {
        showToast('Up to 5 specialities', 'Remove one to add another.', 'info');
        return current;
      }
      return [...current, key];
    });
  }

  function submit() {
    const found = validate(name, phone, city);
    setErrors(found);
    if (Object.keys(found).length === 0) save.mutate();
  }

  return (
    <>
      <View className="mb-5 flex-row items-center rounded-[16px] border border-line bg-white p-4">
        <Avatar name={name || data.profile.name} size={56} />
        <View className="ml-3 flex-1">
          <Text className="text-[15px] font-semibold text-ink">Profile photo</Text>
          <Text className="mt-0.5 text-[13px] text-muted">Shown on community posts</Text>
        </View>
      </View>

      <Field label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
      <FieldError message={errors.name} />
      <Field label="Work email" value={data.profile.email} editable={false} className="opacity-60" />
      <Field
        label="Mobile number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <FieldError message={errors.phone} />
      <Field label="Agency" value={data.agency.name} editable={false} className="opacity-60" />
      <Field label="City" value={city} onChangeText={setCity} autoCapitalize="words" />
      <FieldError message={errors.city} />

      <Text className="mb-3 text-[12px] leading-[18px] text-muted">
        Email and agency are verified identity details. Contact support to change them.
      </Text>

      <SectionLabel>Specialises in</SectionLabel>
      <View className="mb-5 flex-row flex-wrap">
        {(options.data ?? data.profile.specialties).map((option) => (
          <Chip
            key={option.key}
            label={option.name}
            selected={specialties.includes(option.key)}
            onPress={() => toggle(option.key)}
          />
        ))}
      </View>

      <FormButton title="Save changes" pending={save.isPending} onPress={submit} />
    </>
  );
}

export default function EditProfileScreen() {
  const query = useQuery({ queryKey: ['profile', 'summary'], queryFn: fetchProfileSummary });

  return (
    <MilesScreen>
      <MilesHeader title="Edit profile" onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))} />
      <QueryView query={query} loadingLabel="Loading profile">
        {(data) => <EditForm data={data} />}
      </QueryView>
    </MilesScreen>
  );
}
