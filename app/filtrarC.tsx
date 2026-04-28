import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { FilterTheme, getFilterCTheme } from '../src/theme/appTheme';

export default function FilterC() {
  const isFocused = useIsFocused();
  const [darkMode, setDarkMode] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState<Record<string, boolean>>({});
  const [selectedRadios, setSelectedRadios] = useState<{ tempo: string }>({ tempo: '' });

  const theme: FilterTheme = getFilterCTheme(darkMode);

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

  const toggleConfirmed = (nome: string) => {
    setIsConfirmed((prev) => ({ ...prev, [nome]: !prev[nome] }));
  };

  const selectRadio = (category: string, key: string) => {
    setSelectedRadios((prev) => ({ ...prev, [category]: key }));
  };

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
        <TouchableOpacity style={styles.closebutton}>
          <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
            <Path d="M2.44867 17.4468L0 14.9981L6.29659 8.70154L0 2.44867L2.44867 0L8.74527 6.29659L14.9981 0L17.4468 2.44867L11.1502 8.70154L17.4468 14.9981L14.9981 17.4468L8.74527 11.1502L2.44867 17.4468Z" fill={theme.svg} />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent}>
        <View style={styles.containerfilter}>
          <Text style={[styles.bigTitle, { color: theme.textPrimary }]}>Campos de criação</Text>

          {['Logotipo', 'Ilustracao', 'Fotografia', 'Outros'].map((campo) => (
            <TouchableOpacity key={campo} onPress={() => toggleConfirmed(campo)} style={styles.fbtContainer}>
              <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>{campo === 'Ilustracao' ? 'Ilustração' : campo}</Text>
              {campo === 'Outros' ? (
                <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
                  <Path d="M12.8164 0C13.7721 0 14.5467 0.774841 14.5469 1.73047V11.0039H23.8203C24.776 11.0039 25.5507 11.7787 25.5508 12.7344C25.5508 13.6902 24.7761 14.4648 23.8203 14.4648H14.5469V23.8203C14.5469 24.7761 13.7722 25.5508 12.8164 25.5508C11.8607 25.5507 11.0859 24.7761 11.0859 23.8203V14.4648H1.73047C0.774658 14.4648 -4.17798e-08 13.6902 0 12.7344C0.00012159 11.7787 0.774733 11.0039 1.73047 11.0039H11.0859V1.73047C11.0862 0.774897 11.8608 9.2196e-05 12.8164 0Z" fill={theme.svgSoft} />
                </Svg>
              ) : (
                <View style={[styles.squareButton, { backgroundColor: theme.control }]}>
                  {isConfirmed[campo] && <View style={[styles.squareConfirmed, { backgroundColor: theme.controlActive }]} />}
                </View>
              )}
            </TouchableOpacity>
          ))}

          <View style={[styles.divisor, { borderBottomColor: theme.border }]} />
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Ferramentas</Text>

          {['Figma', 'Photoshop', 'Illustrator', 'Canva', 'Outros'].map((habilidade) => (
            <TouchableOpacity key={habilidade} onPress={() => toggleConfirmed(habilidade)} style={styles.fbtContainer}>
              <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>{habilidade}</Text>
              {habilidade === 'Outros' ? (
                <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
                  <Path d="M12.8164 0C13.7721 0 14.5467 0.774841 14.5469 1.73047V11.0039H23.8203C24.776 11.0039 25.5507 11.7787 25.5508 12.7344C25.5508 13.6902 24.7761 14.4648 23.8203 14.4648H14.5469V23.8203C14.5469 24.7761 13.7722 25.5508 12.8164 25.5508C11.8607 25.5507 11.0859 24.7761 11.0859 23.8203V14.4648H1.73047C0.774658 14.4648 -4.17798e-08 13.6902 0 12.7344C0.00012159 11.7787 0.774733 11.0039 1.73047 11.0039H11.0859V1.73047C11.0862 0.774897 11.8608 9.2196e-05 12.8164 0Z" fill={theme.svgSoft} />
                </Svg>
              ) : (
                <View style={[styles.squareButton, { backgroundColor: theme.control }]}>
                  {isConfirmed[habilidade] && <View style={[styles.squareConfirmed, { backgroundColor: theme.controlActive }]} />}
                </View>
              )}
            </TouchableOpacity>
          ))}

          <View style={[styles.divisor, { borderBottomColor: theme.border }]} />
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Tempo de postagem</Text>

          {[
            { label: 'Mais recente', key: 'Recente' },
            { label: 'Esta semana', key: 'Semana' },
            { label: 'Este mês', key: 'Mes' },
          ].map(({ label, key }) => (
            <TouchableOpacity key={key} onPress={() => selectRadio('tempo', key)} style={styles.fbtContainer}>
              <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>{label}</Text>
              <View style={[styles.radiusButton, { backgroundColor: theme.control }]}>
                {selectedRadios.tempo === key && <View style={[styles.radiusConfirmed, { backgroundColor: theme.controlActive }]} />}
              </View>
            </TouchableOpacity>
          ))}

          <View style={[styles.divisor, { borderBottomColor: theme.border }]} />
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Modelo de trabalho</Text>

          {['Remoto', 'Presencial', 'Hibrido'].map((modelo) => (
            <TouchableOpacity key={modelo} onPress={() => toggleConfirmed(modelo)} style={styles.fbtContainer}>
              <Text style={[styles.textoFiltro, { color: theme.textPrimary }]}>{modelo}</Text>
              <View style={[styles.squareButton, { backgroundColor: theme.control }]}>
                {isConfirmed[modelo] && <View style={[styles.squareConfirmed, { backgroundColor: theme.controlActive }]} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  containerfilter: { width: '100%', alignItems: 'flex-start' },
  bigTitle: { fontSize: 32, fontWeight: '800' },
  title: { fontSize: 18, fontWeight: '700' },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  fbtContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingStart: 5,
    paddingVertical: 10,
    width: '100%',
  },
  filterButton: { backgroundColor: '#313131', borderRadius: 50, padding: 10 },
  closebutton: { padding: 10 },
  textoFiltro: { fontSize: 17, fontWeight: '700' },
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
  divisor: {
    width: '100%',
    borderBottomWidth: 2,
    marginTop: 25,
  },
});