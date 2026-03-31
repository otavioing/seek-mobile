import { api } from '@/src/services/api';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Animated, Alert, colorScheme, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

const logoapp = require('@/assets/images/logo_seek.png');

/* =========================
   COMPONENTES (FORA)
========================= */

function FormEtapa2({ handleCadastro, nome, setNome, email, setEmail, senha, setSenha, confirmarSenha, setConfirmarSenha }: any) {
  const [verSenha1, setVerSenha1] = useState(false);
  const [verSenha2, setVerSenha2] = useState(false);

  // Função que decide se mostra o texto real ou bolinhas
  const mask = (text: string, visivel: boolean) => visivel ? text : text.replace(/./g, '●');

  return (
    <>
      <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />

      {/* CAMPO SENHA 1 */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputFlex}
          placeholder="Senha"
          value={mask(senha, verSenha1)} // Aqui a mágica acontece
          onChangeText={(val) => {
            // Se o usuário apagar ou digitar, atualizamos o estado real
            if (verSenha1) setSenha(val);
            else {
               // Logica simplificada: para esse metodo funcionar 100% sem o secureTextEntry nativo, 
               // o ideal é manter o botão manual.
               setSenha(val);
            }
          }}
          secureTextEntry={!verSenha1} 
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setVerSenha1(!verSenha1)}>
          <MaterialIcons name={verSenha1 ? "visibility" : "visibility-off"} size={22} color="#999" />
        </TouchableOpacity>
      </View>

      {/* CAMPO SENHA 2 */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputFlex}
          placeholder="Confirmar senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry={!verSenha2}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setVerSenha2(!verSenha2)}>
          <MaterialIcons name={verSenha2 ? "visibility" : "visibility-off"} size={22} color="#999" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCadastro}>
        <Text style={styles.buttonText}>Confirmar</Text>
      </TouchableOpacity>
    </>
  );
}

function FormEtapa1({ tipoConta, setTipoConta, setStep }: any) {
  return (
    <>
      <Text style={{ color: '#fff', marginBottom: 20 }}>
        Qual tipo de conta você quer identificar?
      </Text>

      <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginBottom: 20 }}>

        {/* ARTISTA */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.card, tipoConta === 'artista' && styles.cardSelected]}
            onPress={() => setTipoConta('artista')}
          >
            <MaterialIcons
              name="person-outline"
              size={80}
              color={tipoConta === 'artista' ? '#fff' : '#2563EB'}
            />
          </TouchableOpacity>

          <Text style={{ marginTop: 8, color: '#fff' }}>
            Artista
          </Text>
        </View>

        {/* EMPRESA */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.card, tipoConta === 'empresa' && styles.cardSelected]}
            onPress={() => setTipoConta('empresa')}
          >
            <MaterialIcons
              name="business"
              size={80}
              color={tipoConta === 'empresa' ? '#fff' : '#2563EB'}
            />
          </TouchableOpacity>

          <Text style={{ marginTop: 8, color: '#fff' }}>
            Empresa
          </Text>
        </View>

      </View>

      <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
        <Text style={styles.buttonText}>Avançar</Text>
      </TouchableOpacity>
    </>
  );
}

/* =========================
   TELA PRINCIPAL
========================= */

export default function Cadastro() {

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipoConta, setTipoConta] = useState<'artista' | 'empresa' | null>(null);
  const [step, setStep] = useState(1);

  const dot1 = useState(new Animated.Value(1))[0];
  const dot2 = useState(new Animated.Value(0))[0];

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

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha) {
      return Alert.alert("Erro", "Preencha todos os campos");
    }

    if (senha !== confirmarSenha) {
      return Alert.alert("Erro", "As senhas não coincidem");
    }

    if (!tipoConta) {
      return Alert.alert("Erro", "Selecione o tipo de conta");
    }

    try {
      const response = await api.post('/usuarios', {
        nome,
        email,
        senha,
        tipoConta
      });

      Alert.alert("Sucesso", response.data.message);
      router.replace('/login');

    } catch (error: any) {
      if (error.response) {
        Alert.alert("Erro", error.response.data.message || "Erro ao cadastrar");
      } else {
        Alert.alert("Erro", "Erro ao conectar com o servidor");
      }
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Image style={styles.logo} source={logoapp} />
      </View>

      <View style={styles.main}>

        {/* HEADER */}
        <View style={styles.titleRow}>

          <View style={{ flexDirection: 'row' }}>
            <Animated.View style={styles.dot(dot1)} />
            <Animated.View style={styles.dot(dot2)} />
          </View>

          <Text style={styles.title}>Cadastro</Text>

          <TouchableOpacity
            onPress={() => step === 2 && setStep(1)}
            disabled={step === 1}
          >
            <MaterialIcons
              name="arrow-back"
              size={20}
              color="#fff"
              style={{ opacity: step === 1 ? 0.3 : 1 }}
            />
          </TouchableOpacity>

        </View>

        {/* CONTEÚDO */}
        <View style={styles.content}>
          {/* ETAPA 1: Seleção de Empresa/Artista */}
          {step === 1 && (
            <FormEtapa1
              tipoConta={tipoConta}
              setTipoConta={setTipoConta}
              setStep={setStep}
            />
          )}

          {/* ETAPA 2: Dados cadastrais */}
          {step === 2 && (
            <FormEtapa2
              nome={nome} setNome={setNome}
              email={email} setEmail={setEmail}
              senha={senha} setSenha={setSenha}
              confirmarSenha={confirmarSenha} setConfirmarSenha={setConfirmarSenha}
              handleCadastro={handleCadastro}
            />
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <Text style={styles.footerA}>
            Já possui uma conta?{' '}
            <Text style={styles.footerLink} onPress={() => router.replace('/login')}>
              Entrar
            </Text>
          </Text>
        </View>

      </View>
    </View >
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorScheme === "light" ? "#FFFFFF" : "#0F0F0F",
  },
  header: {
    flex: 2 / 10,
    paddingTop: 30,
    paddingLeft: 45,
    marginBottom: 20
  },
  main: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  titleRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  main: {
    flex: 6 / 10,
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    width: '100%',
  },
  button: {
    backgroundColor: '#322BF0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSelected: {
    backgroundColor: '#2563EB',
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginVertical: 10,
  },
  footerA: {
    color: '#fff',
  },
  footerLink: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
  },
  inputFlex: {
    flex: 1, // Faz o texto ocupar todo o espaço e empurrar o ícone pro canto
    padding: 15,
  },
  eyeIcon: {
    paddingHorizontal: 15, // Área de clique do ícone
  },
  logo: {
    width: 160,
    aspectRatio: 0.65,
    resizeMode: 'contain',
  },
  dot: (anim: any) => ({
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 6,
    backgroundColor: anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#FFFFFF', '#322BF0'],
    }),
  }),
});