import { Link, useRouter } from 'expo-router';
import React, { useMemo, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Path, Svg } from "react-native-svg";

export default function FilterP() {

  const router = useRouter();

  
  const [isConfirmed, setIsConfirmed] = useState<Record<string, boolean>>({});

  const [estilos, setEstilos] = useState<string[]>([
    "Logotipo",
    "Ilustracao",
    "Fotografia",
    "Outros",
  ]);

  const [ferramentas, setFerramentas] = useState<string[]>([
    "Illustrator",
    "Photoshop",
    "Figma",
    "Canva",
    "Outros",
  ]);

  const [coresLista, setCoresLista] = useState<{ label: string; color: string }[]>([
    { label: "Vermelho", color: "#FF3B30" },
    { label: "Verde", color: "#34C759" },
    { label: "Amarelo", color: "#FFCC00" },
    { label: "Azul", color: "#007AFF" },
    { label: "Roxo", color: "#B027FF" },
    { label: "Outros", color: "#7C3AED" },
  ]);

  const [visible, setVisible] = useState(false);
  const [modalTarget, setModalTarget] = useState<"estilos" | "ferramentas" | "cores" | null>(null);
  const [customName, setCustomName] = useState("");
  const [customColor, setCustomColor] = useState("#7C3AED");

  //  Função de múltipla escolha (quadrados)
  const toggleConfirmed = (nome: string) => {
    setIsConfirmed((prev) => ({
      ...prev,
      [nome]: !prev[nome],
    }));
  };

  const filtrosAtivos = useMemo(
    () => Object.keys(isConfirmed).filter((key) => isConfirmed[key]),
    [isConfirmed]
  );

  const openCustomModal = (target: "estilos" | "ferramentas" | "cores") => {
    setModalTarget(target);
    setCustomName("");
    setCustomColor("#7C3AED");
    setVisible(true);
  };

  const addCustomItem = () => {
    if (!customName.trim()) return setVisible(false);
    const name = customName.trim();

    if (modalTarget === "estilos") {
      setEstilos((prev) => [...prev.filter((i) => i !== "Outros"), name, "Outros"]);
    } else if (modalTarget === "ferramentas") {
      setFerramentas((prev) => [...prev.filter((i) => i !== "Outros"), name, "Outros"]);
    } else if (modalTarget === "cores") {
      setCoresLista((prev) => [
        ...prev.filter((i) => i.label !== "Outros"),
        { label: name, color: customColor || "#7C3AED" },
        { label: "Outros", color: "#7C3AED" },
      ]);
    }

    setIsConfirmed((prev) => ({ ...prev, [name]: true }));
    setVisible(false);
    setModalTarget(null);
    setCustomName("");
    setCustomColor("#7C3AED");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <Link href="/principal" asChild>
        <TouchableOpacity style={styles.filterButton}>
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
      </Link>
        <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 700 }}>Filtrar</Text>
        <TouchableOpacity style={styles.closebutton} onPress={() => router.back()}>
          <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
            <Path
              d="M2.44867 17.4468L0 14.9981L6.29659 8.70154L0 2.44867L2.44867 0L8.74527 6.29659L14.9981 0L17.4468 2.44867L11.1502 8.70154L17.4468 14.9981L14.9981 17.4468L8.74527 11.1502L2.44867 17.4468Z"
              fill="white"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Estilos</Text>
            <Text style={styles.sectionHint}>Escolha um ou vários</Text>
          </View>
          {estilos.map((campo, index, arr) => (
            <TouchableOpacity
              key={campo}
              onPress={() => toggleConfirmed(campo)}
              style={[styles.fbtContainer, index === arr.length - 1 && styles.lastItem]}
            >
              <Text style={styles.textoFiltro}>{campo === "Ilustracao" ? "Ilustração" : campo}</Text>
              {campo === "Outros" ? (
                <TouchableOpacity onPress={() => openCustomModal("estilos")}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Svg width={22} height={22} viewBox="0 0 26 26" fill="none">
                    <Path
                      d="M12.8164 0C13.7721 0 14.5467 0.774841 14.5469 1.73047V11.0039H23.8203C24.776 11.0039 25.5507 11.7787 25.5508 12.7344C25.5508 13.6902 24.7761 14.4648 23.8203 14.4648H14.5469V23.8203C14.5469 24.7761 13.7722 25.5508 12.8164 25.5508C11.8607 25.5507 11.0859 24.7761 11.0859 23.8203V14.4648H1.73047C0.774658 14.4648 -4.17798e-08 13.6902 0 12.7344C0.00012159 11.7787 0.774733 11.0039 1.73047 11.0039H11.0859V1.73047C11.0862 0.774897 11.8608 9.2196e-05 12.8164 0Z"
                      fill="#E3E3E3"
                    />
                  </Svg>
                </TouchableOpacity>
              ) : (
                <View style={styles.squareButton}>
                  {isConfirmed[campo] && <View style={styles.squareConfirmed} />}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ferramentas</Text>
            <Text style={styles.sectionHint}>Selecione os apps que usa</Text>
          </View>
          {ferramentas.map((ferramentas, index, arr) => (
            <TouchableOpacity
              key={ferramentas}
              onPress={() => {
                toggleConfirmed(ferramentas);
                if (ferramentas === "Outros") {
                  setVisible(true);
                }
              }}
              style={[styles.fbtContainer, index === arr.length - 1 && styles.lastItem]}
            >
              <Text style={styles.textoFiltro}>{ferramentas}</Text>
              {ferramentas === "Outros" ? (
                <TouchableOpacity onPress={() => openCustomModal("ferramentas")}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Svg width={22} height={22} viewBox="0 0 26 26" fill="none">
                    <Path
                      d="M12.8164 0C13.7721 0 14.5467 0.774841 14.5469 1.73047V11.0039H23.8203C24.776 11.0039 25.5507 11.7787 25.5508 12.7344C25.5508 13.6902 24.7761 14.4648 23.8203 14.4648H14.5469V23.8203C14.5469 24.7761 13.7722 25.5508 12.8164 25.5508C11.8607 25.5507 11.0859 24.7761 11.0859 23.8203V14.4648H1.73047C0.774658 14.4648 -4.17798e-08 13.6902 0 12.7344C0.00012159 11.7787 0.774733 11.0039 1.73047 11.0039H11.0859V1.73047C11.0862 0.774897 11.8608 9.2196e-05 12.8164 0Z"
                      fill="#E3E3E3"
                    />
                  </Svg>
                </TouchableOpacity>
              ) : (
                <View style={styles.squareButton}>
                  {isConfirmed[ferramentas] && <View style={styles.squareConfirmed} />}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cor</Text>
            <Text style={styles.sectionHint}>Use para filtrar por paleta</Text>
          </View>
          {coresLista.map(({ label, color }, index, arr) => (
            <TouchableOpacity
              key={label}
              onPress={() => toggleConfirmed(label)}
              style={[styles.fbtContainer, index === arr.length - 1 && styles.lastItem]}
            >
              <View style={styles.colorRow}>
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <Text style={styles.textoFiltro}>{label}</Text>
              </View>
              <View style={styles.squareButton}>
                {isConfirmed[label] && <View style={styles.squareConfirmed} />}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.addColorButton]}
            onPress={() => openCustomModal("cores")}
          >
            <Text style={styles.addColorText}>Adicionar cor</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.title}>Adicionar em {modalTarget === 'estilos' ? 'Estilos' : modalTarget === 'ferramentas' ? 'Ferramentas' : 'Cores'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor="#777"
              value={customName}
              onChangeText={setCustomName}
            />
            {modalTarget === "cores" && (
              <TextInput
                style={styles.input}
                placeholder="Cor (hex ou nome)"
                placeholderTextColor="#777"
                value={customColor}
                onChangeText={setCustomColor}
              />
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setVisible(false)}>
                <Text style={styles.secondaryBtnText}>Cancelar</Text>
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
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: "#0F0F0F",
    paddingBottom: 10,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center' },
  title: { fontSize: 18, marginBottom: 12 },
  closeBtn: { marginTop: 8, padding: 10 },
  closeBtnText: { color: '#0f62fe' },
  scroll: { flex: 1, backgroundColor: "#090909" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 80, paddingTop: 16 },
  containerfilter: { width: "100%", alignItems: "flex-start" },
  sectionCard: {
    width: "100%",
    backgroundColor: "#0f0f0f",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f1f1f",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
  sectionHint: { color: "#9CA3AF", fontSize: 12 },
  fbtContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingVertical: 12,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f1f",
  },
  lastItem: { borderBottomWidth: 0, paddingBottom: 4 },
  filterButton: {
  backgroundColor:"#313131",
  borderRadius:50,
  padding:10
},
  closebutton: {
    padding: 10,
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
  colorRow: { flexDirection: "row", alignItems: "center" },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  addColorButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  addColorText: {
    color: "#A78BFA",
    fontWeight: "700",
  },
  input: {
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#111",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#222",
    marginTop: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 8,
  },
  secondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  secondaryBtnText: {
    color: "#E5E7EB",
    fontWeight: "600",
  },
  primaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#A78BFA",
  },
  primaryBtnText: {
    color: "#0B0B0B",
    fontWeight: "700",
  },
});
