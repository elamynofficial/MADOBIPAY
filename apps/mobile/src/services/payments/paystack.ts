/** Paystack initialize/verify run on the Express API with PAYSTACK_SECRET_KEY. The app only stores the public key for display. */
export const paystackPublicKey = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '';
