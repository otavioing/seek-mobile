import { Link } from 'expo-router';
import { Image, StyleSheet, Text,ScrollView, TextInput, TouchableOpacity,colorScheme, View } from "react-native";
import { Svg, Path } from "react-native-svg";





export default function FilterV() {
 return(
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
                <Text style={{color: "#FFFFFF", fontSize: 18, fontWeight:700}}>Filtrar</Text>
                <TouchableOpacity style={styles.closebutton}>
                    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                        <Path
                            d="M2.44867 17.4468L0 14.9981L6.29659 8.70154L0 2.44867L2.44867 0L8.74527 6.29659L14.9981 0L17.4468 2.44867L11.1502 8.70154L17.4468 14.9981L14.9981 17.4468L8.74527 11.1502L2.44867 17.4468Z"fill="white"/>
                    </Svg>
                </TouchableOpacity>

            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.containerfilter}>
                        <Text style={{fontSize:32, fontWeight:800, color:"#FFFFFF",}}>Campos de criação</Text>
                        <View style={styles.fbtContainer}>
                                <Text style={styles.textoFiltro}>Logotipo</Text>
                                <TouchableOpacity style={styles.squareButton}></TouchableOpacity>
                        </View>
                        <View style={styles.fbtContainer}>
                                <Text style={styles.textoFiltro}>Ilustração</Text>
                                <TouchableOpacity style={styles.squareButton}></TouchableOpacity>
                        </View>
                         <View style={styles.fbtContainer}>
                                <Text style={styles.textoFiltro}>Fotografia</Text>
                                <TouchableOpacity style={styles.squareButton}></TouchableOpacity>
                        </View>
                         <View style={styles.fbtContainer}>
                                <Text style={styles.textoFiltro}>Outros</Text>
                                <TouchableOpacity style={styles.plusButton}>
                                     <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
                                        <Path
                                            d="M12.8164 0C13.7721 0 14.5467 0.774841 14.5469 1.73047V11.0039H23.8203C24.776 11.0039 25.5507 11.7787 25.5508 12.7344C25.5508 13.6902 24.7761 14.4648 23.8203 14.4648H14.5469V23.8203C14.5469 24.7761 13.7722 25.5508 12.8164 25.5508C11.8607 25.5507 11.0859 24.7761 11.0859 23.8203V14.4648H1.73047C0.774658 14.4648 -4.17798e-08 13.6902 0 12.7344C0.00012159 11.7787 0.774733 11.0039 1.73047 11.0039H11.0859V1.73047C11.0862 0.774897 11.8608 9.2196e-05 12.8164 0Z"
                                            fill="#E3E3E3"
                                        />
                                     </Svg>
                                </TouchableOpacity>
                        </View>

                        <View style={{width: '100%', borderBottomWidth: 2, borderBottomColor: '#FFFFFF', marginTop: 25 }} />

                        <Text style={{fontSize:32, fontWeight:800, color:"#FFFFFF",}}>Habilidades</Text>

                        <View style={styles.fbtContainer}>
                                <Text style={styles.textoFiltro}>Figma</Text>
                                <TouchableOpacity style={styles.squareButton}></TouchableOpacity>
                        </View>
                        <View style={styles.fbtContainer}>
                                <Text style={styles.textoFiltro}>Photoshop</Text>
                                <TouchableOpacity style={styles.squareButton}></TouchableOpacity>
                        </View>
                         <View style={styles.fbtContainer}>
                                <Text style={styles.textoFiltro}>Illustrator</Text>
                                <TouchableOpacity style={styles.squareButton}></TouchableOpacity>
                        </View>
                        <View style={styles.fbtContainer}>
                                <Text style={styles.textoFiltro}>Canva</Text>
                                <TouchableOpacity style={styles.squareButton}></TouchableOpacity>
                        </View>
                         <View style={styles.fbtContainer}>
                                <Text style={styles.textoFiltro}>Outros</Text>
                                <TouchableOpacity style={styles.plusButton}>
                                     <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
                                        <Path
                                            d="M12.8164 0C13.7721 0 14.5467 0.774841 14.5469 1.73047V11.0039H23.8203C24.776 11.0039 25.5507 11.7787 25.5508 12.7344C25.5508 13.6902 24.7761 14.4648 23.8203 14.4648H14.5469V23.8203C14.5469 24.7761 13.7722 25.5508 12.8164 25.5508C11.8607 25.5507 11.0859 24.7761 11.0859 23.8203V14.4648H1.73047C0.774658 14.4648 -4.17798e-08 13.6902 0 12.7344C0.00012159 11.7787 0.774733 11.0039 1.73047 11.0039H11.0859V1.73047C11.0862 0.774897 11.8608 9.2196e-05 12.8164 0Z"
                                            fill="#E3E3E3"
                                        />
                                     </Svg>
                                </TouchableOpacity>
                        </View>

                        <View style={{width: '100%', borderBottomWidth: 2, borderBottomColor: '#FFFFFF', marginTop: 25 }} />

                        <Text style={{fontSize:32, fontWeight:800, color:"#FFFFFF",}}>Tempo de postagem</Text>

                        <View style={styles.fbtContainer}>
                                <Text style={styles.textoFiltro}>Mais recente</Text>
                                <TouchableOpacity style={styles.radiusButton}></TouchableOpacity>
                        </View>
                         <View style={styles.fbtContainer}>
                                <Text style={styles.textoFiltro}>Esta semana</Text>
                                <TouchableOpacity style={styles.radiusButton}></TouchableOpacity>
                        </View>
                        <View style={styles.fbtContainer}>
                                <Text style={styles.textoFiltro}>Este mês</Text>
                                <TouchableOpacity style={styles.radiusButton}></TouchableOpacity>
                        </View>
                   
                    </View>
            </ScrollView>
            
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  headerText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#090909",
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingBottom: 80,
  },
  containerfilter: {
    width: "100%",
    alignItems: "flex-start",
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 15,
  },
  fbtContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom:10,
    width: "100%",
  },
  textoFiltro: {
    fontSize: 17,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  squareButton: {
    width: 30,
    height: 30,
    backgroundColor: "#313131",
    borderRadius: 10,
  },
  radiusButton: {
    width: 30,
    height: 30,
    backgroundColor: "#313131",
    borderRadius: 50,
  },
  squareConfirmed:{
    width: 20,
    height: 20,
    backgroundColor: "#E3E3E3",
    borderRadius:10,
  },
  radiusConfirmed:{
    width: 20,
    height: 20,
    backgroundColor: "#E3E3E3",
    borderRadius:50,
  },
  plusButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  divisor: {
    width: "100%",
    borderBottomWidth: 2,
    borderBottomColor: "#FFFFFF",
    marginTop: 25,
  },
});