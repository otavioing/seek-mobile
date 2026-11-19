import { Platform } from 'react-native';

export type UploadFile = { uri: string; name: string; mimeType: string; size?: number };

export async function appendUpload(form: FormData, field: string, file: UploadFile) {
  if (Platform.OS === 'web') {
    const response = await fetch(file.uri);
    if (!response.ok) throw new Error('Não foi possível ler o arquivo selecionado. Selecione-o novamente.');
    form.append(field, await response.blob(), file.name);
  } else {
    form.append(field, { uri: file.uri, name: file.name, type: file.mimeType } as any);
  }
}
