import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  return (
    <Screen>
      <PageHeader title="Edit profile" />
      <Text style={{ textAlign: 'center', marginBottom: 12 }}>Tap avatar in production to upload via Cloudinary.</Text>
      <Input label="Full name" value={name} onChangeText={setName} />
      <Input label="Email" value={email} onChangeText={setEmail} />
      <Button label="Save" onPress={() => { if (user) setUser({ ...user, fullName: name, email }); Alert.alert('Saved'); }} />
    </Screen>
  );
}
