import { api } from '@/src/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const logoapp = require('@/assets/images/logo_seek.png');

export default function Login() {

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [forgotVisible, setForgotVisible] = useState(false);
    const [forgotStep, setForgotStep] = useState<'email' | 'code'>('email');
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotCode, setForgotCode] = useState('');
    const [forgotNewPassword, setForgotNewPassword] = useState('');

    const handleLogin = async () => {
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

    const startForgotFlow = () => {
        setForgotStep('email');
        setForgotEmail(email);
        setForgotCode('');
        setForgotNewPassword('');
        setForgotVisible(true);
    };

    const confirmForgotStep = async () => {
        try {

            if (!forgotEmail) {
                Alert.alert('Erro', 'Digite um email');
                return;
            }

            if (forgotStep === 'email') {
                const response = await api.post('/usuarios/criar-codigo-verificacao', {
                    email: forgotEmail
                });

                Alert.alert('Sucesso', response.data.message);
                setForgotStep('code');
                return;
            }

            if (forgotStep === 'code') {
                if (forgotCode.length < 6) {
                    Alert.alert('Erro', 'Digite o código completo');
                    return;
                }

                if (!forgotNewPassword) {
                    Alert.alert('Erro', 'Digite a nova senha');
                    return;
                }

                const response = await api.post('/usuarios/atualizar-senha', {
                    email: forgotEmail,
                    codigo: forgotCode,
                    novaSenha: forgotNewPassword
                });

                Alert.alert('Sucesso', response.data.message);
                setForgotVisible(false);
            }

        } catch (error: any) {
            const msg = error.response?.data?.message || 'Erro ao conectar com servidor';
            Alert.alert('Erro', msg);
            console.log(error);
        }
    };

    const closeForgotFlow = () => {
        setForgotVisible(false);
    };

    const goBackForgotStep = () => {
        if (forgotStep === 'code') {
            setForgotStep('email');
            return;
        }

        setForgotVisible(false);
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

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Senha"
                        placeholderTextColor="#aaa"
                        secureTextEntry={!showPassword}
                        value={senha}
                        onChangeText={setSenha}
                    />
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons
                            name={showPassword ? 'eye' : 'eye-off'}
                            size={20}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.6 }]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Carregando..." : "Confirmar"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={startForgotFlow} style={styles.linkLikeButton}>
                    <Text style={styles.linkLikeText}>Esqueci minha senha</Text>
                </TouchableOpacity>

                <View style={{ width: '80%', borderBottomWidth: 1, borderBottomColor: '#b5b5b5', marginTop: 25 }} />

                <View style={styles.footer}>
                    <Text style={styles.footerA}>Não tenho conta. </Text>
                    <Link href="/cadastro">
                        <Text style={styles.footerLink}>Criar conta agora.</Text>
                    </Link>
                </View>

            </View>

            <Modal
                visible={forgotVisible}
                transparent
                animationType="fade"
                onRequestClose={closeForgotFlow}
            >
                <Pressable style={styles.modalOverlay} onPress={closeForgotFlow}>
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>
                            {forgotStep === 'email' && 'Recuperar senha'}
                            {forgotStep === 'code' && 'Código e nova senha'}
                        </Text>

                        {forgotStep === 'email' && (
                            <>
                                <Text style={styles.modalMessage}>
                                    Insira o email associado à sua conta para receber um código de verificação e redefinir sua senha.
                                </Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Informe seu email"
                                    placeholderTextColor="#6b7280"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={forgotEmail}
                                    onChangeText={setForgotEmail}
                                />
                            </>
                        )}

                        {forgotStep === 'code' && (
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Código de 6 dígitos"
                                placeholderTextColor="#6b7280"
                                keyboardType="number-pad"
                                maxLength={6}
                                value={forgotCode}
                                onChangeText={setForgotCode}
                            />
                        )}

                        {forgotStep === 'code' && (
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Nova senha"
                                placeholderTextColor="#6b7280"
                                secureTextEntry
                                value={forgotNewPassword}
                                onChangeText={setForgotNewPassword}
                            />
                        )}

                        <View style={styles.modalActions}>
                            {forgotStep !== 'email' && (
                                <TouchableOpacity style={styles.modalBack} onPress={goBackForgotStep}>
                                    <Text style={styles.modalActionText}>Voltar</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.modalCancel} onPress={closeForgotFlow}>
                                <Text style={styles.modalActionText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalActionButton} onPress={confirmForgotStep}>
                                <Text style={styles.modalActionText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Modal>
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
    },
    passwordInput: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#000000',
        borderRadius: 8,
        padding: 15,
        flex: 1,
        paddingRight: 45,
    },
    eyeButton: {
        position: 'absolute',
        right: 15,
        padding: 5,
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
    linkLikeButton: {
        marginTop: 12,
    },
    linkLikeText: {
        color: '#2563EB',
        fontWeight: 'bold',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#0F0F0F',
        borderRadius: 12,
        padding: 20,
        gap: 12,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalMessage: {
        color: '#E5E7EB',
        fontSize: 14,
        marginBottom: 8,
    },
    modalInput: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#000000',
        borderRadius: 8,
        padding: 12,
        color: '#111827',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    modalBack: {
        backgroundColor: '#1f2937',
        borderWidth: 1,
        borderColor: '#6b7280',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    modalActionButton: {
        backgroundColor: '#322BF0',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    modalCancel: {
        backgroundColor: '#374151',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    modalActionText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});