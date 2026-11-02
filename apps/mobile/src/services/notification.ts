import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications require a physical device.');
        return null;
      }
  
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
  
      let finalStatus = existingStatus;
  
      if (existingStatus !== 'granted') {
        const { status } =
          await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
  
      if (finalStatus !== 'granted') {
        console.log('Notification permission not granted.');
        return null;
      }
  
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'MadobiPay Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          sound: 'default',
        });
      }
  
      // Get device FCM token
      const token = await Notifications.getDevicePushTokenAsync();
  
      // Get logged-in user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
  
      if (authError || !user) {
        console.log('User must be logged in first.');
        return null;
      }
  
      // Save token in Supabase
      const { error: saveError } = await supabase
        .from('device_push_tokens')
        .upsert(
          {
            user_id: user.id,
            token: token.data,
            platform: Platform.OS,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'token' }
        );
  
      if (saveError) {
        console.error('Token save failed:', saveError);
        return null;
      }
  
      console.log('MadobiPay push notification token saved.');
  
      return {
        token: token.data,
        platform: Platform.OS,
      };
    } catch (error) {
      console.error('Notification registration failed:', error);
      return null;
    }
  }