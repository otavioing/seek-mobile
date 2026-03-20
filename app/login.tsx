import { Link, router } from 'expo-router';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/src/services/api';

const logoapp = require('@/assets/images/logo_seek.png');

export default function Login() {

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {

        if (!email.trim() || !senha.trim()) {
            Alert.alert("Erro", "Preencha email e senha");
            return;
        }
        try {
            setLoading(true); // ativa loading

            const response = await api.post('/usuarios/login', {
                email,
                senha
            });

            const { usuario, token } = response.data;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('userId', usuario.id.toString());

            router.replace('/principal');

        } catch (error: any) {
            if (error.response?.status === 401) {
                Alert.alert("Erro", "Email ou senha inválidos");
            } else {
                Alert.alert("Erro", "Erro ao conectar com servidor");
                console.log(error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image style={styles.logo} source={logoapp} />
            </View>

            <View style={styles.main}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 45, color: "#FFFFFF" }}>
                    Login
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    placeholderTextColor="#aaa"
                    secureTextEntry
                    value={senha}
                    onChangeText={setSenha}
                />

                <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.6 }]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Carregando..." : "Confirmar"}
                    </Text>
                </TouchableOpacity>

                <View style={{ width: '80%', borderBottomWidth: 1, borderBottomColor: '#b5b5b5', marginTop: 25 }} />

                <View style={styles.footer}>
                    <Text style={styles.footerA}>Não tenho conta. </Text>
                    <Link href="/cadastro">
                        <Text style={styles.footerLink}>Criar conta agora.</Text>
                    </Link>
                </View>

            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F0F',
    },
    header: {
        flex: 2 / 12,
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingTop: 30,
        paddingLeft: 45,
    },
    main: {
        flex: 6 / 10,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 30,
        paddingRight: 30,
    },
    footer: {
        margin: 10,
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
    button: {
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
    footerA: {
        color: '#FFFFFF',
    },
    footerLink: {
        color: '#2563EB',
        fontWeight: 'bold',
    },
});