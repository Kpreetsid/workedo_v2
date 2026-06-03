import { createMMKV } from 'react-native-mmkv';

const mmkv = createMMKV();

export const storage = Object.assign(mmkv, {
	delete: (key: string) => mmkv.remove(key),
});
