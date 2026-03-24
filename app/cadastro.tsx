import { api } from '@/src/services/api';
import { router } from 'expo-router';
import { useState } from 'react';
import { Animated } from 'react-native';
import { useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import EmpresaIcon from '@/assets/images/icons/empresa.svg';
import EmpresaFillIcon from '@/assets/images/icons/empresaFill.svg';
import { Alert, colorScheme, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const logoapp = require('@/assets/images/logo_seek.png');

export default function Cadastro() {

  const [nome, setNome] = useState('');
  const dot1 = useState(new Animated.Value(1))[0];
  const dot2 = useState(new Animated.Value(0))[0];
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [tipoConta, setTipoConta] = useState<'artista' | 'empresa' | null>(null);
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  useEffect(() => {
    Animated.timing(dot1, {
      toValue: step === 1 ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();

    Animated.timing(dot2, {
      toValue: step === 2 ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [step]);
  const FormEtapa1 = () => {
    return (
      <>
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

        <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
          <Text style={styles.buttonText}>Avançar</Text>
        </TouchableOpacity>
      </>)
  };
  const FormEtapa2 = () => {
    return (
      <>
        <Text style={{ color: '#fff', marginBottom: 20 }}>
          Qual tipo de conta você quer identificar?
        </Text>

        <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginBottom: 20 }}>

          {/* ARTISTA */}
          <View style={{ flex: 1, alignItems: 'center' }}>

            <TouchableOpacity
              style={[
                styles.card,
                tipoConta === 'artista' && styles.cardSelected
              ]}
              onPress={() => setTipoConta('artista')}
            >
              <MaterialIcons
                name="person-outline"
                size={80}
                color={tipoConta === 'artista' ? '#fff' : '#2563EB'}
              />
            </TouchableOpacity>

            <Text style={{
              marginTop: 8,
              color: '#fff'
            }}>
              Artista
            </Text>

          </View>

          {/* EMPRESA */}
          <View style={{ flex: 1, alignItems: 'center' }}>

            <TouchableOpacity
              style={[
                styles.card,
                tipoConta === 'empresa' && styles.cardSelected
              ]}
              onPress={() => setTipoConta('empresa')}
            >
              <MaterialIcons
                name="business"
                size={80}
                color={tipoConta === 'empresa' ? '#fff' : '#2563EB'}
              />
            </TouchableOpacity>

            <Text style={{
              marginTop: 8,
              color: '#fff'
            }}>
              Empresa
            </Text>

          </View>

        </View>

        <TouchableOpacity style={styles.button} onPress={handleCadastro}>
          <Text style={styles.buttonText}>Confirmar</Text>
        </TouchableOpacity>
      </>)
  };
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image style={styles.logo} source={logoapp} />
      </View>

      <View style={styles.main}>
        <View style={styles.titleRow}>
          <View style={{ flexDirection: 'row' }}>
            <Animated.View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                marginLeft: 6,
                backgroundColor: dot1.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['#FFFFFF', '#322BF0'],
                }),
              }}
            />

            <Animated.View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                marginLeft: 6,
                backgroundColor: dot2.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['#FFFFFF', '#322BF0'],
                }),
              }}
            />

          </View>
          <Text style={styles.title}>
            Cadastro
          </Text>
          <TouchableOpacity
            onPress={() => step === 2 && setStep(1)}
            disabled={step === 1}
            style={{ marginRight: 10 }}
          >
            <MaterialIcons
              name="arrow-back"
              size={20}
              color="#fff"
              style={{
                opacity: step === 1 ? 0.3 : 1,
              }}
            />
          </TouchableOpacity>



        </View>
        <View style={styles.content}>
          {step === 1 && <FormEtapa1 />}
          {step === 2 && <FormEtapa2 />}
        </View>
        <View style={styles.divider} />
        <View style={styles.footer}>
          
          <Text style={styles.footerA}>
            Já possui uma conta?{' '}
            <Text
              style={styles.footerLink}
              onPress={() => router.replace('/login')}
            >
              Entrar
            </Text>
          </Text>
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
    flex: 2 / 10,
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingTop: 30,
    paddingLeft: 45,
  },
  titleRow: {
    flexDirection:'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  main: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 30,
    paddingRight: 30,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignSelf: 'center',
    margin: 10,
    marginBottom: 10,
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
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardSelected: {
    backgroundColor: '#2563EB',
  },
  buttonText: {
    color: '#FFFFFF',
  },
  footerA: {
    color: '#FFFFFF',
  },
  footerLink: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
});