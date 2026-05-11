import { api } from '@/src/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { LoginTheme, getLoginTheme } from '../src/theme/appTheme';

const logoapptemaescuro = require('@/assets/images/logo_seek_letrabranca.png');
const logoapptemaclaro = require('@/assets/images/logo_seek_letrapreta.png');

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
    const [darkMode, setDarkMode] = useState(false);
    const [isLoadingTheme, setIsLoadingTheme] = useState(true);
    const [loginError, setLoginError] = useState('');

    const theme: LoginTheme = getLoginTheme(darkMode);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('tema');
                const isDark = savedTheme === 'escuro';
                setDarkMode(isDark);
            } catch (error) {
                console.log('Erro ao carregar tema:', error);
            } finally {
                setIsLoadingTheme(false);
            }
        };

        loadTheme();
    }, []);


    const handleLogin = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail || !senha) {
            setLoginError('Preencha email e senha');
            return;
        }

        if (!trimmedEmail.includes('@')) {
            setLoginError('Digite um email válido com @');
            return;
        }

        try {
            setLoginError('');
            setLoading(true); // ativa loading

            const response = await api.post('/usuarios/login', {
                email: trimmedEmail,
                senha
            });

            const { usuario, token } = response.data;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('userId', usuario.id.toString());

            router.replace('/principal');

        } catch (error: any) {
            if (error.response?.status === 401) {
                setLoginError('Email ou senha inválidos');
            } else {
                setLoginError('Erro ao conectar com servidor');
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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Image style={styles.logo} source={darkMode ? logoapptemaescuro : logoapptemaclaro} />
            </View>

            <View style={styles.main}>
                <Text style={[styles.loginTitle, { color: theme.textPrimary }]}>
                    Login
                </Text>

                <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                    placeholder="Email"
                    placeholderTextColor={theme.textSecondary}
                    value={email}
                    onChangeText={(value) => {
                        setEmail(value);
                        if (loginError) {
                            setLoginError('');
                        }
                    }}
                />

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.passwordInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                        placeholder="Senha"
                        placeholderTextColor={theme.textSecondary}
                        secureTextEntry={!showPassword}
                        value={senha}
                        onChangeText={(value) => {
                            setSenha(value);
                            if (loginError) {
                                setLoginError('');
                            }
                        }}
                    />
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons
                            name={showPassword ? 'eye' : 'eye-off'}
                            size={20}
                            color={theme.iconColor}
                        />
                    </TouchableOpacity>
                </View>

                {!!loginError && (
                    <Text style={styles.loginErrorText}>{loginError}</Text>
                )}

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
                    <Text style={[styles.linkLikeText, { color: theme.link }]}>Esqueci minha senha</Text>
                </TouchableOpacity>

                <View style={[styles.separator, { borderBottomColor: theme.separator }]} />

                <View style={styles.footer}>
                    <Text style={[styles.footerA, { color: theme.textPrimary }]}>Não tenho conta. </Text>
                    <Link href="/cadastro">
                        <Text style={[styles.footerLink, { color: theme.link }]}>Criar conta agora.</Text>
                    </Link>
                </View>

            </View>

            <Modal
                visible={forgotVisible}
                transparent
                animationType="fade"
                onRequestClose={closeForgotFlow}
            >
                <Pressable style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]} onPress={closeForgotFlow}>
                    <View style={[styles.modalContent, { backgroundColor: theme.modalBackground, borderColor: theme.modalBorder }]} onStartShouldSetResponder={() => true}>
                        <Text style={[styles.modalTitle, { color: theme.modalText }]}>
                            {forgotStep === 'email' && 'Recuperar senha'}
                            {forgotStep === 'code' && 'Código e nova senha'}
                        </Text>

                        {forgotStep === 'email' && (
                            <>
                                <Text style={[styles.modalMessage, { color: theme.modalTextSecondary }]}>
                                    Insira o email associado à sua conta para receber um código de verificação e redefinir sua senha.
                                </Text>
                                <TextInput
                                    style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                                    placeholder="Informe seu email"
                                    placeholderTextColor={theme.textSecondary}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={forgotEmail}
                                    onChangeText={setForgotEmail}
                                />
                            </>
                        )}

                        {forgotStep === 'code' && (
                            <TextInput
                                style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                                placeholder="Código de 6 dígitos"
                                placeholderTextColor={theme.textSecondary}
                                keyboardType="number-pad"
                                maxLength={6}
                                value={forgotCode}
                                onChangeText={setForgotCode}
                            />
                        )}

                        {forgotStep === 'code' && (
                            <TextInput
                                style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                                placeholder="Nova senha"
                                placeholderTextColor={theme.textSecondary}
                                secureTextEntry
                                value={forgotNewPassword}
                                onChangeText={setForgotNewPassword}
                            />
                        )}

                        <View style={styles.modalActions}>
                            {forgotStep !== 'email' && (
                                <TouchableOpacity style={[styles.modalBack, { backgroundColor: theme.modalBackButton, borderColor: theme.modalBorderColor }]} onPress={goBackForgotStep}>
                                    <Text style={[styles.modalActionText, { color: theme.modalText }]}>Voltar</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={[styles.modalCancel, { backgroundColor: theme.modalCancelButton }]} onPress={closeForgotFlow}>
                                <Text style={[styles.modalActionText, { color: theme.modalText }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalActionButton} onPress={confirmForgotStep}>
                                <Text style={[styles.modalActionText, { color: theme.modalText }]}>Confirmar</Text>
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
    loginTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 45,
    },
    input: {
        borderWidth: 1,
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
        borderWidth: 1,
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
    loginErrorText: {
        width: '100%',
        marginTop: -4,
        marginBottom: 10,
        color: '#DC2626',
        fontSize: 13,
        fontWeight: '500',
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
        fontWeight: 'bold',
    },
    separator: {
        width: '80%',
        borderBottomWidth: 1,
        marginTop: 25,
    },
    footerA: {
    },
    footerLink: {
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        borderRadius: 12,
        padding: 20,
        gap: 12,
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalMessage: {
        fontSize: 14,
        marginBottom: 8,
    },
    modalInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    modalBack: {
        borderWidth: 1,
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
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    modalActionText: {
        fontWeight: 'bold',
    },
});