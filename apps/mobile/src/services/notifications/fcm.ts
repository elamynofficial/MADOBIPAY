export async function registerFcmToken(token: string) {
  const url = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/v1';
  await fetch(`${url}/notifications/device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, platform: 'mobile' }),
  }).catch(() => undefined);
}
