import { StyleSheet, View, Image, TextInput, TouchableOpacity, Text  } from "react-native";
import { Link, Stack } from 'expo-router';

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
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 45 }}>Login</Text>

                <TextInput style={styles.input} placeholder="email"/>
                <TextInput style={styles.input} placeholder="senha" secureTextEntry/>

                <Link href="/(tabs)" asChild>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Confirmar</Text>
                    </TouchableOpacity>
                </Link>

                <View style={{width: '80%', borderBottomWidth: 1, borderBottomColor: '#b5b5b5', marginTop: 25 }} />


                <View style={styles.loginGoogle}> <Image style={styles.logobotaogoogle} source={logogoogle} /> <Text>Entrar com Google</Text> </View>
                <View style={styles.loginApple}> <Image style={styles.logobotaoapple} source={logoapple} /> <Text style={{ color: '#FFFFFF' }}>Entrar com Apple</Text> </View>

                </View>
            <View style={styles.footer}>
                <Text>Não tenho conta. </Text>
                    <Link href="/cadastro">
                        <Text style={styles.footerLink}>Criar conta agora.</Text>
                    </Link>

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 45,
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
        padding: 30,
        
    },
    footer: {
        flex: 1/5,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 20,

    },
    logo: {
        width: 150,
        height: 70,
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
    logobotaogoogle: {
        width: 35,
        height: 40,
    },
    logobotaoapple: {
        width: 45,
        height: 40,
    },
    loginGoogle: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        padding: 10,
        gap: 28,
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        borderRadius: 15,
        width: '55%',
        backgroundColor: '#FFFFFF',
    },
    loginApple: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        padding: 10,
        gap: 28,
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        borderRadius: 10,
        width: '55%',
        backgroundColor: '#000000',
        color: '#FFFFFF',
    },
    footerLink: {
        color: '#2563EB',
        fontWeight: 'bold',
    },
});