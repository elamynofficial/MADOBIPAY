export const NETWORKS = [
  { id: 'mtn', name: 'MTN', color: '#FFCC00' },
  { id: 'airtel', name: 'Airtel', color: '#E31C23' },
  { id: 'glo', name: 'Glo', color: '#50B848' },
  { id: '9mobile', name: '9mobile', color: '#006F53' },
] as const;

export const DISCOS = [
  { id: 'ikedc', name: 'IKEDC', state: 'Lagos' },
  { id: 'ekedc', name: 'EKEDC', state: 'Lagos' },
  { id: 'aedc', name: 'AEDC', state: 'Abuja' },
  { id: 'kedco', name: 'KEDCO', state: 'Kano' },
  { id: 'jed', name: 'JED', state: 'Jos' },
  { id: 'phed', name: 'PHED', state: 'Port Harcourt' },
  { id: 'eedc', name: 'EEDC', state: 'Enugu' },
  { id: 'ibedc', name: 'IBEDC', state: 'Ibadan' },
  { id: 'bedc', name: 'BEDC', state: 'Benin' },
  { id: 'yedc', name: 'YEDC', state: 'Yola' },
  { id: 'kaedco', name: 'KAEDCO', state: 'Kaduna' },
] as const;

export const TV_PROVIDERS = [
  { id: 'dstv', name: 'DStv' },
  { id: 'gotv', name: 'GOtv' },
  { id: 'startimes', name: 'Startimes' },
] as const;

export const EXAM_BODIES = [
  { id: 'waec', name: 'WAEC' },
  { id: 'neco', name: 'NECO' },
  { id: 'jamb', name: 'JAMB' },
  { id: 'nabteb', name: 'NABTEB' },
] as const;

export const USER_ROLES = ['customer', 'agent', 'admin', 'super_admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type NetworkId = (typeof NETWORKS)[number]['id'];
export type DiscoId = (typeof DISCOS)[number]['id'];
