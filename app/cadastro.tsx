import { Link, router } from 'expo-router';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, colorScheme, View, Alert } from "react-native";
import { useState } from 'react';
import { api } from '@/src/services/api';

const logoapp = require('@/assets/images/logo_seek.png');

export default function Cadastro() {

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleCadastro = async () => {

    if (!nome || !email || !senha || !confirmarSenha) {
      return Alert.alert("Erro", "Preencha todos os campos");
    }

    if (senha !== confirmarSenha) {
      return Alert.alert("Erro", "As senhas não coincidem");
    }

    try {
      const response = await api.post('/usuarios', {
        nome,
        email,
        senha
      });

      Alert.alert("Sucesso", response.data.message);

      router.replace('/login');

    } catch (error: any) {

      if (error.response) {
        Alert.alert("Erro", error.response.data.message || "Erro ao cadastrar");
      } else {
        Alert.alert("Erro", "Erro ao conectar com o servidor");
      }

      console.log(error);
    }
  };

  return(
    <View style={styles.container}>
      <View style={styles.header}>
        <Image style={styles.logo} source={logoapp} />
      </View>

      <View style={styles.main}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 45, color: "#FFFFFF" }}>
          Cadastro
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#aaa"
          value={nome}
          onChangeText={setNome}
        />

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

        <TextInput
          style={styles.input}
          placeholder="Confirmar senha"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />

        <TouchableOpacity style={styles.button} onPress={handleCadastro}>
          <Text style={styles.buttonText}>Confirmar</Text>
        </TouchableOpacity>

        <View style={{width: '80%', borderBottomWidth: 1, borderBottomColor: '#b5b5b5', marginTop: 25 }} />

        <View style={styles.footer}>
          <Text style={styles.footerA}>Já tenho conta. </Text>
          <Link href="/login">
            <Text style={styles.footerLink}>Fazer login.</Text>
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
    footerA:{
        color:'#FFFFFF',
    },
    footerLink: {
        color: '#2563EB',
        fontWeight: 'bold',
    },
});