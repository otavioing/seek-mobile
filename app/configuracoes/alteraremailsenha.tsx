import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AlterarEmailSenha() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [showSenhaAtual, setShowSenhaAtual] = useState(false);
    const [showNovaSenha, setShowNovaSenha] = useState(false);
    const [darkMode, setDarkMode] = useState(true);

    const carregarTema = useCallback(async () => {
        try {
            const temaSalvo = await AsyncStorage.getItem('tema');
            const isDark = temaSalvo !== 'claro';
            setDarkMode(isDark);
        } catch (error) {
            console.log('Erro ao carregar tema:', error);
        }
    }, []);

    useEffect(() => {
        carregarTema();
    }, [carregarTema]);

    useFocusEffect(
        useCallback(() => {
            carregarTema();
        }, [carregarTema])
    );

    const theme = darkMode
        ? {
                background: '#121212',
                textPrimary: '#FFFFFF',
                inputBackground: '#1F1F1F',
                inputText: '#FFFFFF',
                placeholder: '#8d8d8d',
                icon: '#FFFFFF',
                buttonBackground: '#2563eb',
                buttonText: '#FFFFFF',
            }
        : {
                background: '#FFFFFF',
                textPrimary: '#000000',
                inputBackground: '#EFEFEF',
                inputText: '#000000',
                placeholder: '#6b6b6b',
                icon: '#000000',
                buttonBackground: '#000000',
                buttonText: '#FFFFFF',
            };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            {/* Header Padronizado */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                    <Text style={[styles.backText, { color: theme.textPrimary }]}>Voltar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Email e Senha</Text>

                <View style={styles.group}>
                    <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>E-mail</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="nome@email.com"
                        placeholderTextColor={theme.placeholder}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={[
                            styles.input,
                            { backgroundColor: theme.inputBackground, color: theme.inputText },
                        ]}
                    />
                </View>

                <View style={styles.group}>
                    <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Senha atual</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            value={senhaAtual}
                            onChangeText={setSenhaAtual}
                            placeholder="****"
                            placeholderTextColor={theme.placeholder}
                            secureTextEntry={!showSenhaAtual}
                            style={[
                                styles.passwordInput,
                                { backgroundColor: theme.inputBackground, color: theme.inputText },
                            ]}
                        />
                        <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() => setShowSenhaAtual(!showSenhaAtual)}
                        >
                            <Ionicons
                                name={showSenhaAtual ? 'eye' : 'eye-off'}
                                size={20}
                                color={theme.icon}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.group}>
                    <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Alterar senha</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            value={novaSenha}
                            onChangeText={setNovaSenha}
                            placeholder="****"
                            placeholderTextColor={theme.placeholder}
                            secureTextEntry={!showNovaSenha}
                            style={[
                                styles.passwordInput,
                                { backgroundColor: theme.inputBackground, color: theme.inputText },
                            ]}
                        />
                        <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() => setShowNovaSenha(!showNovaSenha)}
                        >
                            <Ionicons
                                name={showNovaSenha ? 'eye' : 'eye-off'}
                                size={20}
                                color={theme.icon}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={[styles.confirmButton, { backgroundColor: theme.buttonBackground }]}
                    >
                        <Text style={[styles.confirmButtonText, { color: theme.buttonText }]}>Confirmar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 22,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    backText: {
        fontSize: 18,
        marginLeft: 8,
    },
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 30,
    },
    group: {
        marginBottom: 25,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
    },
    input: {
        fontSize: 15,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        fontSize: 15,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        flex: 1,
        paddingRight: 45,
    },
    eyeButton: {
        position: 'absolute',
        right: 12,
        padding: 6,
    },
    footer: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    confirmButton: {
        paddingHorizontal: 22,
        paddingVertical: 10,
        borderRadius: 999,
    },
    confirmButtonText: {
        fontSize: 15,
        fontWeight: '700',
    },
});