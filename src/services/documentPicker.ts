import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';
import type { UploadFile } from './uploads';

type PickerResult = { canceled: boolean; assets?: { uri: string; name: string; mimeType?: string; size?: number }[] };
type NativeDocumentPicker = { getDocumentAsync: (options: { type: string[]; multiple: boolean; copyToCacheDirectory: boolean }) => Promise<PickerResult> };

// Expo Go already bundles the native DocumentPicker for the project's SDK.
// Keep the bridge isolated so custom native builds can use the same interface.
export async function pickPdf(): Promise<UploadFile | null> {
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = '.pdf,application/pdf'; input.multiple = false;
      input.style.display = 'none';
      const cleanup = () => input.remove();
      input.addEventListener('cancel', () => { cleanup(); resolve(null); }, { once: true });
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        cleanup();
        if (!file) { resolve(null); return; }
        if (!/\.pdf$/i.test(file.name)) { reject(new Error('Selecione um currículo em PDF.')); return; }
        resolve({ uri: URL.createObjectURL(file), name: file.name, mimeType: file.type || 'application/pdf', size: file.size });
      }, { once: true });
      document.body.appendChild(input);
      input.click();
    });
  }
  const picker = requireOptionalNativeModule<NativeDocumentPicker>('ExpoDocumentPicker');
  if (!picker?.getDocumentAsync) throw new Error('O seletor de PDF não está disponível nesta versão do aplicativo. Abra no Expo Go ou atualize o aplicativo.');
  const result = await picker.getDocumentAsync({ type: ['application/pdf'], multiple: false, copyToCacheDirectory: true });
  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset?.uri || !asset.name || !/\.pdf$/i.test(asset.name)) throw new Error('Não foi possível selecionar o currículo em PDF.');
  return { uri: asset.uri, name: asset.name, mimeType: 'application/pdf', size: asset.size };
}
