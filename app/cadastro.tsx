import { api } from '@/src/services/api';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Animated, Alert, colorScheme, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

const logoapp = require('@/assets/images/logo_seek.png');

/* =========================
   COMPONENTES (FORA)
========================= */

function FormEtapa2({
  handleCadastro, nome, setNome, email, setEmail,
  senha, setSenha, confirmarSenha, setConfirmarSenha
}: any) {
  const [verSenha1, setVerSenha1] = useState(false);
  const [verSenha2, setVerSenha2] = useState(false);
  const [tentouEnviar, setTentouEnviar] = useState(false); // Controla o feedback visual

  const aoConfirmar = () => {
    setTentouEnviar(true);

    // Alertas específicos por campo
    if (!nome.trim()) return Alert.alert("Campo Vazio", "O campo 'Nome' é obrigatório.");
    if (!email.trim()) return Alert.alert("Campo Vazio", "O campo 'Email' é obrigatório.");
    if (!senha) return Alert.alert("Campo Vazio", "O campo 'Senha' é obrigatório.");
    if (!confirmarSenha) return Alert.alert("Campo Vazio", "A confirmação de senha é obrigatória.");

    handleCadastro(); // Se passou, chama a função da API
  };

  return (
    <>
      <TextInput
        style={[styles.input, tentouEnviar && !nome && styles.inputErro]}
        placeholder="Nome" value={nome} onChangeText={setNome}
      />
      <TextInput
        style={[styles.input, tentouEnviar && !email && styles.inputErro]}
        placeholder="Email" value={email} onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={[styles.passwordContainer, tentouEnviar && !senha && styles.inputErro]}>
        <TextInput
          style={styles.inputFlex}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={!verSenha1}
          textContentType="none" // Desativa sugestões nativas que bugam o layout
          autoComplete="off"
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setVerSenha1(!verSenha1)}>
          <MaterialIcons name={verSenha1 ? "visibility" : "visibility-off"} size={22} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={[styles.passwordContainer, tentouEnviar && !confirmarSenha && styles.inputErro]}>
        <TextInput
          style={styles.inputFlex}
          placeholder="Confirmar senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry={!verSenha2}
          textContentType="none"
          autoComplete="off"
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setVerSenha2(!verSenha2)}>
          <MaterialIcons name={verSenha2 ? "visibility" : "visibility-off"} size={22} color="#999" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={aoConfirmar}>
        <Text style={styles.buttonText}>Confirmar</Text>
      </TouchableOpacity>
    </>
  );
}

function FormEtapa1({ tipoConta, setTipoConta, setStep }: any) {
  const avancar = () => {
    if (!tipoConta) {
      return Alert.alert("Seleção Necessária", "Escolha se você é Artista ou Empresa para continuar.");
    }
    setStep(2);
  };

  return (
    <>
      <Text style={{ color: '#fff', marginBottom: 20 }}>Qual tipo de conta você quer criar?</Text>
      <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginBottom: 20 }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.card, tipoConta === 'artista' && styles.cardSelected]}
            onPress={() => setTipoConta('artista')}
          >
            <MaterialIcons name="person-outline" size={80} color={tipoConta === 'artista' ? '#fff' : '#2563EB'} />
          </TouchableOpacity>
          <Text style={{ marginTop: 8, color: '#fff' }}>Artista</Text>
        </View>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.card, tipoConta === 'empresa' && styles.cardSelected]}
            onPress={() => setTipoConta('empresa')}
          >
            <MaterialIcons name="business" size={80} color={tipoConta === 'empresa' ? '#fff' : '#2563EB'} />
          </TouchableOpacity>
          <Text style={{ marginTop: 8, color: '#fff' }}>Empresa</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={avancar}>
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
    Animated.parallel([
      Animated.timing(dot1, { toValue: step === 1 ? 1 : 0, duration: 250, useNativeDriver: false }),
      Animated.timing(dot2, { toValue: step === 2 ? 1 : 0, duration: 250, useNativeDriver: false })
    ]).start();
  }, [step]);

  const handleCadastro = async () => {
    // Validações de regra de negócio
    if (senha.length < 6) {
      return Alert.alert("Senha Curta", "A senha deve ter pelo menos 6 caracteres.");
    }
    if (senha !== confirmarSenha) {
      return Alert.alert("Erro", "As senhas não coincidem.");
    }

    try {
      const response = await api.post('/usuarios', {
        nome,
        email,
        senha,
        tipoConta
      });

      Alert.alert("Sucesso!", "Sua conta Seek foi criada com sucesso.");
      router.replace('/(tabs)');

    } catch (error: any) {
      const msg = error.response?.data?.message || "Não foi possível conectar ao servidor.";
      Alert.alert("Erro no Cadastro", msg);
      console.error(error);
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
            <Animated.View style={styles.dot(dot1)} />
            <Animated.View style={styles.dot(dot2)} />
          </View>
          <Text style={styles.title}>Cadastro</Text>
          <TouchableOpacity onPress={() => setStep(1)} disabled={step === 1}>
            <MaterialIcons
              name="arrow-back" size={24} color="#fff"
              style={{ opacity: step === 1 ? 0 : 1 }}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {step === 1 ? (
            <FormEtapa1 tipoConta={tipoConta} setTipoConta={setTipoConta} setStep={setStep} />
          ) : (
            <FormEtapa2
              nome={nome} setNome={setNome} email={email} setEmail={setEmail}
              senha={senha} setSenha={setSenha} confirmarSenha={confirmarSenha}
              setConfirmarSenha={setConfirmarSenha} handleCadastro={handleCadastro}
            />
          )}
        </View>

        <View style={styles.divider} />
        <View style={styles.footer}>
          <Text style={styles.footerA}>
            Já possui uma conta?{' '}
            <Text style={styles.footerLink} onPress={() => router.replace('/login')}>Entrar</Text>
          </Text>
        </View>
      </View>
    </View>
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