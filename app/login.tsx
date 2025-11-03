import { Link } from 'expo-router';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity,colorScheme, View } from "react-native";

const logoapp = require('@/assets/images/logo_seek.png');
const logogoogle = require('@/assets/images/logo_Google.png'); 
const logoapple = require('@/assets/images/logo-apple.png');




export default function Login() {
 return(
        <View style={styles.container}>
            <View style={styles.header}>
                <Image style={styles.logo} source={logoapp} />
            </View>
            <View style={styles.main}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 45,color: "#FFFFFF" }}>Login</Text>

                <TextInput style={styles.input} placeholder="Email"/>
                <TextInput style={styles.input} placeholder="Senha" secureTextEntry/>

                <Link href="/filtrarC" asChild>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}><Link href={"/filtrarC"}>Confirmar</Link></Text>
                    </TouchableOpacity>
                </Link>

                <View style={{width: '80%', borderBottomWidth: 1, borderBottomColor: '#b5b5b5', marginTop: 25 }} />

                <View style={styles.footer}>
                <Text style={styles.footerA}>Não tenho conta. </Text>
                    <Link href="/cadastro">
                        <Text style={styles.footerLink}>Criar conta agora.</Text>
                    </Link>

                </View>
            </View>
            
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorScheme === "light" ? "#FFFFFF" : "#0F0F0F",
  },
    header: {
        flex: 2/12,
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingTop: 30,
        paddingLeft: 45,
    },
    main: {
        flex: 6/10,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft:30,
        paddingRight:30,
    },
    footer: {
        margin:10,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',

    },
    logo: {
        width: 160,
        height: undefined,
        aspectRatio: 0.65,
        resizeMode: 'contain',
    },
    input: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#000000',
        borderRadius: 8,
        padding: 15,
        marginBottom: 12,
        width: '100%',
    },
    button:{
        backgroundColor: '#322BF0',
        padding: 10,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '35%',
    },
    buttonText: {
        color: '#FFFFFF',
    },
    // logobotaogoogle: {
    //     width: 35,
    //     height: 40,
    // },
    // logobotaoapple: {
    //     width: 45,
    //     height: 40,
    // },
    // loginGoogle: {
    //     display: 'flex',
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     marginTop: 20,
    //     padding: 10,
    //     gap: 28,
    //     boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    //     borderRadius: 15,
    //     width: '55%',
    //     backgroundColor: '#FFFFFF',
    // },
    // loginApple: {
    //     display: 'flex',
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     marginTop: 20,
    //     padding: 10,
    //     gap: 28,
    //     boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    //     borderRadius: 10,
    //     width: '55%',
    //     backgroundColor: '#000000',
    //     color: '#FFFFFF',
    // },
    footerA:{
        color:'#FFFFFF',
    },
    footerLink: {
        color: '#2563EB',
        fontWeight: 'bold',
    },
});