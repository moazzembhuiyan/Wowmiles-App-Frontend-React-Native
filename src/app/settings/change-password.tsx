import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MilesHeader, MilesScreen } from '@/components/miles-ui';
import { useToast } from '@/components/toast';
import { PasswordField } from '@/components/ui';
import { FieldError, FormButton, goBack } from '@/components/hub/hub-ui';
import { changePassword } from '@/lib/api/profile';

type Errors = Partial<Record<'currentPassword' | 'password' | 'confirmPassword', string>>;

export default function ChangePasswordScreen() {
  const showToast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const change = useMutation({
    mutationFn: () => changePassword({ currentPassword, password, confirmPassword }),
    onSuccess: () => {
      showToast('Password changed', 'Other devices have been signed out.', 'success');
      goBack('/settings/security');
    },
    onError: (error) => showToast('Could not change password', error.message),
  });

  function submit() {
    const found: Errors = {};
    if (!currentPassword) found.currentPassword = 'Enter your current password.';
    if (password.length < 8) found.password = 'Use at least 8 characters.';
    else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) found.password = 'Include letters and numbers.';
    else if (password === currentPassword) found.password = 'Choose a different password.';
    if (confirmPassword !== password) found.confirmPassword = 'Passwords do not match.';
    setErrors(found);
    if (Object.keys(found).length === 0) change.mutate();
  }

  return (
    <MilesScreen>
      <MilesHeader title="Change password" onBack={() => goBack('/settings/security')} />
      <PasswordField label="Current password" value={currentPassword} onChangeText={setCurrentPassword} />
      <FieldError message={errors.currentPassword} />
      <PasswordField label="New password" value={password} onChangeText={setPassword} />
      <FieldError message={errors.password} />
      <PasswordField label="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} />
      <FieldError message={errors.confirmPassword} />
      <FormButton title="Update password" className="mt-2" pending={change.isPending} onPress={submit} />
    </MilesScreen>
  );
}
