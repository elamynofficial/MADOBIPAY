export async function initializeMonnify(amount: number, customerName: string) {
  const key = process.env.EXPO_PUBLIC_MONNIFY_API_KEY;
  if (!key) {
    return { checkoutUrl: 'https://sandbox.monnify.com/checkout/madobipay', paymentReference: `MNF_${Date.now()}`, amount };
  }
  return { checkoutUrl: '', paymentReference: '', amount, customerName };
}
