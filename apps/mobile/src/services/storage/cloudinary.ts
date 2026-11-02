export async function uploadToCloudinary(uri: string, folder = 'kyc') {
  const cloud = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD;
  const preset = process.env.EXPO_PUBLIC_CLOUDINARY_PRESET;
  if (!cloud || !preset) return { url: uri, publicId: 'local-preview' };
  const form = new FormData();
  form.append('file', { uri, type: 'image/jpeg', name: 'upload.jpg' } as never);
  form.append('upload_preset', preset);
  form.append('folder', folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: form });
  return res.json();
}
