import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Link, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

type ModalTarget = 'estilos' | 'ferramentas' | 'cores' | null;

export default function FilterP() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [darkMode, setDarkMode] = useState(false);
  const [modalTarget, setModalTarget] = useState<ModalTarget>(null);
  const [customName, setCustomName] = useState('');
  const [customColor, setCustomColor] = useState('#7C3AED');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [tempo, setTempo] = useState('');

  const [estilos, setEstilos] = useState(['Logotipo', 'Ilustracao', 'Fotografia', 'Outros']);
  const [ferramentas, setFerramentas] = useState(['Figma', 'Photoshop', 'Illustrator', 'Canva', 'Outros']);
  const [cores, setCores] = useState(['Vermelho', 'Azul', 'Verde', 'Preto', 'Branco', 'Outros']);

  const theme = darkMode
    ? {
        background: '#000000',
        header: '#0F0F0F',
        section: '#0F0F0F',
        modal: '#111111',
        textPrimary: '#FFFFFF',
        textSecondary: '#D1D5DB',
        border: '#1F1F1F',
        control: '#313131',
        controlActive: '#E3E3E3',
        svg: '#FFFFFF',
        svgSoft: '#E3E3E3',
        inputBg: '#111111',
        inputBorder: '#222222',
      }
    : {
        background: '#D9D9D9',
        header: '#E6E6E6',
        section: '#FFFFFF',
        modal: '#FFFFFF',
        textPrimary: '#111111',
        textSecondary: '#4B5563',
        border: '#D1D5DB',
        control: '#E5E7EB',
        controlActive: '#111111',
        svg: '#111111',
        svgSoft: '#D1D5DB',
        inputBg: '#FFFFFF',
        inputBorder: '#D1D5DB',
      };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('tema');
        setDarkMode(savedTheme === 'escuro');
      } catch (error) {
        console.log('Erro ao carregar tema:', error);
      }
    };

    if (isFocused) {
      loadTheme();
    }
  }, [isFocused]);

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  const toggleValue = (value: string) => {
    setSelected((prev) => ({ ...prev, [value]: !prev[value] }));
  };

  const openCustomModal = (target: ModalTarget) => {
    setModalTarget(target);
    setCustomName('');
    setCustomColor('#7C3AED');
  };

  const addCustomItem = () => {
    if (!customName.trim() || !modalTarget) {
      return;
    }

    const value = customName.trim();

    if (modalTarget === 'estilos') {
      setEstilos((prev) => [...prev, value]);
    } else if (modalTarget === 'ferramentas') {
      setFerramentas((prev) => [...prev, value]);
    } else {
      setCores((prev) => [...prev, value]);
    }

    setSelected((prev) => ({ ...prev, [value]: true }));
    setModalTarget(null);
    setCustomName('');
  };

  const renderOption = (item: string, isCustomSection = false) => (
    <TouchableOpacity key={item} onPress={() => toggleValue(item)} style={styles.row}>
      <Text style={[styles.rowText, { color: theme.textPrimary }]}>{item === 'Ilustracao' ? 'Ilustração' : item}</Text>
      {isCustomSection && item === 'Outros' ? (
        <TouchableOpacity onPress={() => openCustomModal(modalTarget ?? 'estilos')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Svg width={22} height={22} viewBox="0 0 26 26" fill="none">
            <Path d="M12.8164 0C13.7721 0 14.5467 0.774841 14.5469 1.73047V11.0039H23.8203C24.776 11.0039 25.5507 11.7787 25.5508 12.7344C25.5508 13.6902 24.7761 14.4648 23.8203 14.4648H14.5469V23.8203C14.5469 24.7761 13.7722 25.5508 12.8164 25.5508C11.8607 25.5507 11.0859 24.7761 11.0859 23.8203V14.4648H1.73047C0.774658 14.4648 -4.17798e-08 13.6902 0 12.7344C0.00012159 11.7787 0.774733 11.0039 1.73047 11.0039H11.0859V1.73047C11.0862 0.774897 11.8608 9.2196e-05 12.8164 0Z" fill={theme.svgSoft} />
          </Svg>
        </TouchableOpacity>
      ) : (
        <View style={[styles.squareButton, { backgroundColor: theme.control }]}>
          {selected[item] && <View style={[styles.squareConfirmed, { backgroundColor: theme.controlActive }]} />}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderTempoOption = (label: string, value: string) => (
    <TouchableOpacity key={value} onPress={() => setTempo(value)} style={styles.row}>
      <Text style={[styles.rowText, { color: theme.textPrimary }]}>{label}</Text>
      <View style={[styles.radiusButton, { backgroundColor: theme.control }]}>
        {tempo === value && <View style={[styles.radiusConfirmed, { backgroundColor: theme.controlActive }]} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.header }]}>
        <Link href="/principal" asChild>
          <TouchableOpacity style={styles.filterButton}>
            <Svg width={23} height={23} viewBox="0 0 20 23" fill="none">
              <Path d="M1.06396 3.28613H14.3981" stroke={theme.svg} strokeWidth={2.12819} strokeLinecap="round" />
              <Path d="M1.06396 11.0642H7.73104" stroke={theme.svg} strokeWidth={2.12819} strokeLinecap="round" />
              <Path d="M12.1758 11.0642H18.8429" stroke={theme.svg} strokeWidth={2.12819} strokeLinecap="round" />
              <Path d="M5.50977 18.8413H18.8439" stroke={theme.svg} strokeWidth={2.12819} strokeLinecap="round" />
              <Path d="M16.6203 5.5085C17.8477 5.5085 18.8427 4.51361 18.8427 3.28635C18.8427 2.0591 17.8477 1.06421 16.6203 1.06421C15.3929 1.06421 14.3979 2.0591 14.3979 3.28635C14.3979 4.51361 15.3929 5.5085 16.6203 5.5085Z" stroke={theme.svg} strokeWidth={2.12819} strokeLinecap="round" />
              <Path d="M9.95429 13.2866C11.1817 13.2866 12.1766 12.2917 12.1766 11.0644C12.1766 9.83717 11.1817 8.84229 9.95429 8.84229C8.72692 8.84229 7.73193 9.83717 7.73193 11.0644C7.73193 12.2917 8.72692 13.2866 9.95429 13.2866Z" stroke={theme.svg} strokeWidth={2.12819} strokeLinecap="round" />
              <Path d="M3.28632 21.0642C4.5137 21.0642 5.50868 20.0693 5.50868 18.842C5.50868 17.6148 4.5137 16.6199 3.28632 16.6199C2.05895 16.6199 1.06396 17.6148 1.06396 18.842C1.06396 20.0693 2.05895 21.0642 3.28632 21.0642Z" stroke={theme.svg} strokeWidth={2.12819} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </Link>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Filtrar</Text>
        <TouchableOpacity style={styles.closebutton} onPress={() => router.back()}>
          <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
            <Path d="M2.44867 17.4468L0 14.9981L6.29659 8.70154L0 2.44867L2.44867 0L8.74527 6.29659L14.9981 0L17.4468 2.44867L11.1502 8.70154L17.4468 14.9981L14.9981 17.4468L8.74527 11.1502L2.44867 17.4468Z" fill={theme.svg} />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.sectionCard, { backgroundColor: theme.section, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Estilos</Text>
            <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>Escolha um ou vários</Text>
          </View>
          {estilos.map((item) => (
            <TouchableOpacity key={item} onPress={() => toggleValue(item)} style={styles.row}>
              <Text style={[styles.rowText, { color: theme.textPrimary }]}>{item === 'Ilustracao' ? 'Ilustração' : item}</Text>
              {item === 'Outros' ? (
                <TouchableOpacity onPress={() => openCustomModal('estilos')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Svg width={22} height={22} viewBox="0 0 26 26" fill="none">
                    <Path d="M12.8164 0C13.7721 0 14.5467 0.774841 14.5469 1.73047V11.0039H23.8203C24.776 11.0039 25.5507 11.7787 25.5508 12.7344C25.5508 13.6902 24.7761 14.4648 23.8203 14.4648H14.5469V23.8203C14.5469 24.7761 13.7722 25.5508 12.8164 25.5508C11.8607 25.5507 11.0859 24.7761 11.0859 23.8203V14.4648H1.73047C0.774658 14.4648 -4.17798e-08 13.6902 0 12.7344C0.00012159 11.7787 0.774733 11.0039 1.73047 11.0039H11.0859V1.73047C11.0862 0.774897 11.8608 9.2196e-05 12.8164 0Z" fill={theme.svgSoft} />
                  </Svg>
                </TouchableOpacity>
              ) : (
                <View style={[styles.squareButton, { backgroundColor: theme.control }]}>
                  {selected[item] && <View style={[styles.squareConfirmed, { backgroundColor: theme.controlActive }]} />}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: theme.section, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Ferramentas</Text>
            <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>Selecione os apps que usa</Text>
          </View>
          {ferramentas.map((item) => (
            <TouchableOpacity key={item} onPress={() => toggleValue(item)} style={styles.row}>
              <Text style={[styles.rowText, { color: theme.textPrimary }]}>{item}</Text>
              {item === 'Outros' ? (
                <TouchableOpacity onPress={() => openCustomModal('ferramentas')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Svg width={22} height={22} viewBox="0 0 26 26" fill="none">
                    <Path d="M12.8164 0C13.7721 0 14.5467 0.774841 14.5469 1.73047V11.0039H23.8203C24.776 11.0039 25.5507 11.7787 25.5508 12.7344C25.5508 13.6902 24.7761 14.4648 23.8203 14.4648H14.5469V23.8203C14.5469 24.7761 13.7722 25.5508 12.8164 25.5508C11.8607 25.5507 11.0859 24.7761 11.0859 23.8203V14.4648H1.73047C0.774658 14.4648 -4.17798e-08 13.6902 0 12.7344C0.00012159 11.7787 0.774733 11.0039 1.73047 11.0039H11.0859V1.73047C11.0862 0.774897 11.8608 9.2196e-05 12.8164 0Z" fill={theme.svgSoft} />
                  </Svg>
                </TouchableOpacity>
              ) : (
                <View style={[styles.squareButton, { backgroundColor: theme.control }]}>
                  {selected[item] && <View style={[styles.squareConfirmed, { backgroundColor: theme.controlActive }]} />}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: theme.section, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Cor</Text>
            <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>Use para filtrar por paleta</Text>
          </View>
          {cores.map((item) => (
            <TouchableOpacity key={item} onPress={() => toggleValue(item)} style={styles.row}>
              <Text style={[styles.rowText, { color: theme.textPrimary }]}>{item}</Text>
              {item === 'Outros' ? (
                <TouchableOpacity onPress={() => openCustomModal('cores')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Svg width={22} height={22} viewBox="0 0 26 26" fill="none">
                    <Path d="M12.8164 0C13.7721 0 14.5467 0.774841 14.5469 1.73047V11.0039H23.8203C24.776 11.0039 25.5507 11.7787 25.5508 12.7344C25.5508 13.6902 24.7761 14.4648 23.8203 14.4648H14.5469V23.8203C14.5469 24.7761 13.7722 25.5508 12.8164 25.5508C11.8607 25.5507 11.0859 24.7761 11.0859 23.8203V14.4648H1.73047C0.774658 14.4648 -4.17798e-08 13.6902 0 12.7344C0.00012159 11.7787 0.774733 11.0039 1.73047 11.0039H11.0859V1.73047C11.0862 0.774897 11.8608 9.2196e-05 12.8164 0Z" fill={theme.svgSoft} />
                  </Svg>
                </TouchableOpacity>
              ) : (
                <View style={[styles.squareButton, { backgroundColor: theme.control }]}>
                  {selected[item] && <View style={[styles.squareConfirmed, { backgroundColor: theme.controlActive }]} />}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 8 }]}>Tempo de postagem</Text>
          {[
            { label: 'Mais recente', key: 'Recente' },
            { label: 'Esta semana', key: 'Semana' },
            { label: 'Este mês', key: 'Mes' },
          ].map(({ label, key }) => (
            <TouchableOpacity key={key} onPress={() => setTempo(key)} style={styles.row}>
              <Text style={[styles.rowText, { color: theme.textPrimary }]}>{label}</Text>
              <View style={[styles.radiusButton, { backgroundColor: theme.control }]}>
                {tempo === key && <View style={[styles.radiusConfirmed, { backgroundColor: theme.controlActive }]} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.footerButton} onPress={() => router.back()}>
          <Text style={styles.footerButtonText}>Aplicar {selectedCount > 0 ? `(${selectedCount})` : ''}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal transparent visible={modalTarget !== null} animationType="fade" onRequestClose={() => setModalTarget(null)}>
        <View style={styles.backdrop}>
          <View style={[styles.modalBox, { backgroundColor: theme.modal, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Adicionar em {modalTarget === 'estilos' ? 'Estilos' : modalTarget === 'ferramentas' ? 'Ferramentas' : 'Cores'}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
              placeholder="Nome"
              placeholderTextColor={theme.textSecondary}
              value={customName}
              onChangeText={setCustomName}
            />
            {modalTarget === 'cores' && (
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                placeholder="Cor (hex ou nome)"
                placeholderTextColor={theme.textSecondary}
                value={customColor}
                onChangeText={setCustomColor}
              />
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.secondaryBtn, { borderColor: theme.border }]} onPress={() => setModalTarget(null)}>
                <Text style={[styles.secondaryBtnText, { color: theme.textPrimary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={addCustomItem}>
                <Text style={styles.primaryBtnText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 80, paddingTop: 16 },
  sectionCard: {
    width: '100%',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeader: { marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  sectionHint: { fontSize: 12 },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    width: '100%',
  },
  rowText: { fontSize: 17, fontWeight: '700' },
  filterButton: { backgroundColor: '#313131', borderRadius: 50, padding: 10 },
  closebutton: { padding: 10 },
  title: { fontSize: 18, fontWeight: '700' },
  squareButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 10,
  },
  radiusButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  squareConfirmed: {
    width: 20,
    height: 20,
    borderRadius: 5,
  },
  radiusConfirmed: {
    width: 20,
    height: 20,
    borderRadius: 50,
  },
  footerButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: 14,
    marginTop: 8,
    paddingVertical: 14,
    backgroundColor: '#111111',
  },
  footerButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { width: '100%', borderRadius: 16, borderWidth: 1, padding: 18 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  secondaryBtn: { flex: 1, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  secondaryBtnText: { fontWeight: '600' },
  primaryBtn: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, backgroundColor: '#111111' },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700' },
});