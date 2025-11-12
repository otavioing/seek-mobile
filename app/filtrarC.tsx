import { Link } from 'expo-router';
import { Image, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Svg, Path } from "react-native-svg";
import { useState } from "react";

export default function FilterV() {

  //  Separei o estado de quadrados e de rádios (mantendo o mesmo padrão de chaves)
  const [isConfirmed, setIsConfirmed] = useState({
    Logotipo: false,
    Ilustracao: false,
    Fotografia: false,
    Figma: false,
    Photoshop: false,
    Illustrator: false,
    Canva: false,
    Remoto: false,
    Presencial: false,
    Hibrido: false,
  });

  //  Novo estado só pros botões redondos
  const [selectedRadios, setSelectedRadios] = useState({
    tempo: "", // "Recente", "Semana" ou "Mes"
  });

  //  Função de múltipla escolha (quadrados)
  const toggleConfirmed = (nome) => {
    setIsConfirmed((prev) => ({
      ...prev,
      [nome]: !prev[nome],
    }));
  };

  //  Função de escolha única (redondos)
  const selectRadio = (category, key) => {
    setSelectedRadios((prev) => ({
      ...prev,
      [category]: key,
    }));
  };

  const filtrosAtivos = {
    ...Object.keys(isConfirmed).filter((key) => isConfirmed[key]),
    tempo: selectedRadios.tempo,
  };

  console.log(filtrosAtivos);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.filterbutton}>
          <Svg width={23} height={23} viewBox="0 0 20 23" fill="none">
            <Path d="M1.06396 3.28613H14.3981" stroke="white" strokeWidth={2.12819} strokeLinecap="round" />
            <Path d="M1.06396 11.0642H7.73104" stroke="white" strokeWidth={2.12819} strokeLinecap="round" />
            <Path d="M12.1758 11.0642H18.8429" stroke="white" strokeWidth={2.12819} strokeLinecap="round" />
            <Path d="M5.50977 18.8413H18.8439" stroke="white" strokeWidth={2.12819} strokeLinecap="round" />
            <Path d="M16.6203 5.5085C17.8477 5.5085 18.8427 4.51361 18.8427 3.28635C18.8427 2.0591 17.8477 1.06421 16.6203 1.06421C15.3929 1.06421 14.3979 2.0591 14.3979 3.28635C14.3979 4.51361 15.3929 5.5085 16.6203 5.5085Z" stroke="white" strokeWidth={2.12819} strokeLinecap="round" />
            <Path d="M9.95429 13.2866C11.1817 13.2866 12.1766 12.2917 12.1766 11.0644C12.1766 9.83717 11.1817 8.84229 9.95429 8.84229C8.72692 8.84229 7.73193 9.83717 7.73193 11.0644C7.73193 12.2917 8.72692 13.2866 9.95429 13.2866Z" stroke="white" strokeWidth={2.12819} strokeLinecap="round" />
            <Path d="M3.28632 21.0642C4.5137 21.0642 5.50868 20.0693 5.50868 18.842C5.50868 17.6148 4.5137 16.6199 3.28632 16.6199C2.05895 16.6199 1.06396 17.6148 1.06396 18.842C1.06396 20.0693 2.05895 21.0642 3.28632 21.0642Z" stroke="white" strokeWidth={2.12819} strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 700 }}>Filtrar</Text>
        <TouchableOpacity style={styles.closebutton}>
          <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
            <Path
              d="M2.44867 17.4468L0 14.9981L6.29659 8.70154L0 2.44867L2.44867 0L8.74527 6.29659L14.9981 0L17.4468 2.44867L11.1502 8.70154L17.4468 14.9981L14.9981 17.4468L8.74527 11.1502L2.44867 17.4468Z"
              fill="white"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.containerfilter}>
          {/* CAMPOS DE CRIAÇÃO */}
          <Text style={{ fontSize: 32, fontWeight: 800, color: "#FFFFFF" }}>Campos de criação</Text>

          {["Logotipo", "Ilustracao", "Fotografia"].map((campo) => (
            <TouchableOpacity
              key={campo}
              onPress={() => toggleConfirmed(campo)}
              style={styles.fbtContainer}
            >
              <Text style={styles.textoFiltro}>{campo === "Ilustracao" ? "Ilustração" : campo}</Text>
              <View style={styles.squareButton}>
                {isConfirmed[campo] && <View style={styles.squareConfirmed} />}
              </View>
            </TouchableOpacity>
          ))}

          {/* HABILIDADES */}
          <View style={styles.divisor} />
          <Text style={styles.sectionTitle}>Habilidades</Text>

          {["Figma", "Photoshop", "Illustrator", "Canva"].map((habilidade) => (
            <TouchableOpacity
              key={habilidade}
              onPress={() => toggleConfirmed(habilidade)}
              style={styles.fbtContainer}
            >
              <Text style={styles.textoFiltro}>{habilidade}</Text>
              <View style={styles.squareButton}>
                {isConfirmed[habilidade] && <View style={styles.squareConfirmed} />}
              </View>
            </TouchableOpacity>
          ))}

          {/* TEMPO DE POSTAGEM */}
          <View style={styles.divisor} />
          <Text style={styles.sectionTitle}>Tempo de postagem</Text>

          {[{ label: "Mais recente", key: "Recente" },
            { label: "Esta semana", key: "Semana" },
            { label: "Este mês", key: "Mes" }
          ].map(({ label, key }) => (
            <TouchableOpacity
              key={key}
              onPress={() => selectRadio("tempo", key)} // 🔧 novo comportamento
              style={styles.fbtContainer}
            >
              <Text style={styles.textoFiltro}>{label}</Text>
              <View style={styles.radiusButton}>
                {selectedRadios.tempo === key && <View style={styles.radiusConfirmed} />}
              </View>
            </TouchableOpacity>
          ))}

          {/* MODELO DE TRABALHO */}
          <View style={styles.divisor} />
          <Text style={styles.sectionTitle}>Modelo de trabalho</Text>

          {["Remoto", "Presencial", "Hibrido"].map((modelo) => (
            <TouchableOpacity
              key={modelo}
              onPress={() => toggleConfirmed(modelo)}
              style={styles.fbtContainer}
            >
              <Text style={styles.textoFiltro}>{modelo}</Text>
              <View style={styles.squareButton}>
                {isConfirmed[modelo] && <View style={styles.squareConfirmed} />}
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
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: "#0F0F0F",
    paddingBottom: 10,
  },
  scroll: { flex: 1, backgroundColor: "#090909" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 80 },
  containerfilter: { width: "100%", alignItems: "flex-start" },
  sectionTitle: { fontSize: 32, fontWeight: "800", color: "#FFFFFF", marginTop: 15 },
  fbtContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingStart: 5,
    paddingVertical: 10,
    width: "100%",
  },
  textoFiltro: { fontSize: 17, color: "#FFFFFF", fontWeight: "700" },
  squareButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    backgroundColor: "#313131",
    borderRadius: 10,
  },
  radiusButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#313131",
    borderRadius: 50,
  },
  squareConfirmed: {
    width: 20,
    height: 20,
    backgroundColor: "#E3E3E3",
    borderRadius: 5,
  },
  radiusConfirmed: {
    width: 20,
    height: 20,
    backgroundColor: "#E3E3E3",
    borderRadius: 50,
  },
  divisor: {
    width: "100%",
    borderBottomWidth: 2,
    borderBottomColor: "#FFFFFF",
    marginTop: 25,
  },
});
