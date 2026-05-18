import { api } from '@/src/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Animated, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { CadastroTheme, getCadastroTheme } from '../src/theme/appTheme';

const logoapptemaescuro = require('@/assets/images/logo_seek_letrabranca.png');
const logoapptemaclaro = require('@/assets/images/logo_seek_letrapreta.png');

const temSenhaForte = (senha: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(senha);

const obterRequisitosSenha = (senha: string) => [
  { id: 'tamanho', texto: 'Ter pelo menos 8 caracteres', atendido: senha.length >= 8 },
  { id: 'maiuscula', texto: 'Ter uma letra maiúscula', atendido: /[A-Z]/.test(senha) },
  { id: 'minuscula', texto: 'Ter uma letra minúscula', atendido: /[a-z]/.test(senha) },
  { id: 'numero', texto: 'Ter um número', atendido: /\d/.test(senha) },
  { id: 'especial', texto: 'Ter um caractere especial', atendido: /[^A-Za-z0-9]/.test(senha) },
];


function FormEtapa2({
  handleCadastro, nome, setNome, email, setEmail,
  senha, setSenha, confirmarSenha, setConfirmarSenha, theme
}: any) {
  const [verSenha1, setVerSenha1] = useState(false);
  const [verSenha2, setVerSenha2] = useState(false);
  const [senhaFocada, setSenhaFocada] = useState(false);
  const [tentouEnviar, setTentouEnviar] = useState(false); // Controla o feedback visual
  const [nomeErro, setNomeErro] = useState('');
  const [emailErro, setEmailErro] = useState('');
  const [senhaFeedback, setSenhaFeedback] = useState('');
  const senhaValida = temSenhaForte(senha);
  const senhasCoincidem = senha === confirmarSenha;
  const podeConfirmar = senhaValida && senhasCoincidem && !!nome.trim() && !!email.trim();
  const requisitosSenha = obterRequisitosSenha(senha);

  const aoConfirmar = () => {
    setTentouEnviar(true);
    setNomeErro('');
    setEmailErro('');
    setSenhaFeedback('');

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim();

    let possuiErro = false;

    if (!nomeLimpo) {
      setNomeErro("O campo 'Nome' é obrigatório.");
      possuiErro = true;
    } else if (nomeLimpo.length < 2) {
      setNomeErro('Digite pelo menos 2 letras no nome.');
      possuiErro = true;
    } else if (/\d/.test(nomeLimpo)) {
      setNomeErro('O nome não pode conter números.');
      possuiErro = true;
    }

    if (!emailLimpo) {
      setEmailErro("O campo 'Email' é obrigatório.");
      possuiErro = true;
    } else if (!emailLimpo.includes('@')) {
      setEmailErro('Digite um email válido com @.');
      possuiErro = true;
    }

    if (possuiErro) {
      return;
    }

    // Alertas específicos por campo
    if (!senha) return Alert.alert("Campo Vazio", "O campo 'Senha' é obrigatório.");
    if (!confirmarSenha) return Alert.alert("Campo Vazio", "A confirmação de senha é obrigatória.");
    if (!senhaValida) {
      const mensagemSenha = 'A senha deve ter pelo menos 8 caracteres, com uma letra maiúscula, uma minúscula, um número e um caractere especial.';
      setSenhaFeedback(mensagemSenha);
      return Alert.alert('Senha fraca', mensagemSenha);
    }
    if (!senhasCoincidem) {
      setSenhaFeedback('As senhas precisam ser iguais.');
      return Alert.alert('Erro', 'As senhas não coincidem.');
    }

    const run = async () => {
      const res = await handleCadastro();
      if (!res || !res.success) {
        if (res?.status === 409) {
          setEmailErro(res.errorMessage || 'Este email já está cadastrado!');
        } else {
          Alert.alert('Erro no Cadastro', res?.errorMessage || 'Não foi possível conectar ao servidor.');
        }
      }
    };
 
    run();
  };

  return (
    <>
      <TextInput
        style={[styles.input, { color: theme.inputText }, tentouEnviar && !nome && styles.inputErro, !!nomeErro && styles.inputErro]}
        placeholderTextColor={theme.placeholder}
        selectionColor={theme.selection}
        cursorColor={theme.selection}
        placeholder="Nome"
        value={nome}
        onChangeText={(value) => {
          setNome(value);
          if (nomeErro) {
            setNomeErro('');
          }
        }}
      />
      {!!nomeErro && <Text style={styles.errorText}>{nomeErro}</Text>}
      <TextInput
        style={[styles.input, { color: theme.inputText }, tentouEnviar && !email && styles.inputErro, !!emailErro && styles.inputErro]}
        placeholderTextColor={theme.placeholder}
        selectionColor={theme.selection}
        cursorColor={theme.selection}
        placeholder="Email"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          if (emailErro) {
            setEmailErro('');
          }
        }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {!!emailErro && <Text style={styles.errorText}>{emailErro}</Text>}

      <View
        style={[
          styles.passwordContainer,
          { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
          tentouEnviar && !senha && styles.inputErro,
        ]}
      >
        <TextInput
          style={[styles.inputFlex, { color: theme.inputText }]}
          placeholderTextColor={theme.placeholder}
          selectionColor={theme.selection}
          cursorColor={theme.selection}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          onFocus={() => setSenhaFocada(true)}
          onBlur={() => setSenhaFocada(false)}
          secureTextEntry={!verSenha1}
          textContentType="none" // Desativa sugestões nativas que bugam o layout
          autoComplete="off"
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setVerSenha1(!verSenha1)}>
          <MaterialIcons name={verSenha1 ? "visibility" : "visibility-off"} size={22} color={theme.icon} />
        </TouchableOpacity>
      </View>
      {senhaFocada ? (
        <View style={styles.passwordChecklist}>
          {requisitosSenha.map((requisito) => (
            <View key={requisito.id} style={styles.passwordChecklistItem}>
              <MaterialIcons
                name={requisito.atendido ? 'check-circle' : 'radio-button-unchecked'}
                size={18}
                color={requisito.atendido ? '#16A34A' : theme.textPrimary}
              />
              <Text style={[styles.passwordChecklistText, { color: requisito.atendido ? '#16A34A' : theme.textPrimary }]}>
                {requisito.texto}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View
        style={[
          styles.passwordContainer,
          { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
          tentouEnviar && !confirmarSenha && styles.inputErro,
        ]}
      >
        <TextInput
          style={[styles.inputFlex, { color: theme.inputText }]}
          placeholderTextColor={theme.placeholder}
          selectionColor={theme.selection}
          cursorColor={theme.selection}
          placeholder="Confirmar senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry={!verSenha2}
          textContentType="none"
          autoComplete="off"
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setVerSenha2(!verSenha2)}>
          <MaterialIcons name={verSenha2 ? "visibility" : "visibility-off"} size={22} color={theme.icon} />
        </TouchableOpacity>
      </View>
      {senhaFeedback ? <Text style={styles.errorText}>{senhaFeedback}</Text> : null}

      <TouchableOpacity
        style={[styles.button, !podeConfirmar && styles.buttonDisabled]}
        onPress={aoConfirmar}
      >
        <Text style={styles.buttonText}>Confirmar</Text>
      </TouchableOpacity>
    </>
  );
}

function FormEtapa1({ tipoConta, setTipoConta, setStep, theme }: any) {
  const avancar = () => {
    if (!tipoConta) {
      return Alert.alert("Seleção Necessária", "Escolha se você é Artista ou Empresa para continuar.");
    }
    setStep(2);
  };

  return (
    <>
      <Text style={{ color: theme.textPrimary, marginBottom: 20 }}>Qual tipo de conta você quer criar?</Text>
      <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginBottom: 20 }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity
            style={[
              styles.card,
              { backgroundColor: theme.cardBackground },
              tipoConta === 'artista' && styles.cardSelected,
            ]}
            onPress={() => setTipoConta('artista')}
          >
            <MaterialIcons name="person-outline" size={80} color={tipoConta === 'artista' ? '#fff' : theme.link} />
          </TouchableOpacity>
          <Text style={{ marginTop: 8, color: theme.textPrimary }}>Artista</Text>
        </View>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity
            style={[
              styles.card,
              { backgroundColor: theme.cardBackground },
              tipoConta === 'empresa' && styles.cardSelected,
            ]}
            onPress={() => setTipoConta('empresa')}
          >
            <MaterialIcons name="business" size={80} color={tipoConta === 'empresa' ? '#fff' : theme.link} />
          </TouchableOpacity>
          <Text style={{ marginTop: 8, color: theme.textPrimary }}>Empresa</Text>
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
  const [darkMode, setDarkMode] = useState(false);

  const theme: CadastroTheme = getCadastroTheme(darkMode);

  const dot1 = useState(new Animated.Value(1))[0];
  const dot2 = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(dot1, { toValue: step === 1 ? 1 : 0, duration: 250, useNativeDriver: false }),
      Animated.timing(dot2, { toValue: step === 2 ? 1 : 0, duration: 250, useNativeDriver: false })
    ]).start();
  }, [step]);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('tema');
        setDarkMode(savedTheme === 'escuro');
      } catch (error) {
        console.log('Erro ao carregar tema:', error);
      }
    };

    loadTheme();
  }, []);

  const handleCadastro = async () => {
    // Validações de regra de negócio (retornam objeto para o formulário tratar)
    if (!temSenhaForte(senha)) {
      return { success: false, status: 400, errorMessage: 'A senha deve ter pelo menos 8 caracteres, com uma letra maiúscula, uma minúscula, um número e um caractere especial.' };
    }
    if (senha !== confirmarSenha) {
      return { success: false, status: 400, errorMessage: 'As senhas não coincidem.' };
    }

    try {
      const response = await api.post('/usuarios', {
        nome,
        email,
        senha,
        tipoConta
      });

      Alert.alert("Sucesso!", "Sua conta Seek foi criada com sucesso.");
      router.replace('/principal');
      return { success: true };

    } catch (error: any) {
      console.error(error);
      const status = error.response?.status;
      const msg = error.response?.data?.message || "Não foi possível conectar ao servidor.";
      return { success: false, status, errorMessage: msg };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Image style={styles.logo} source={darkMode ? logoapptemaescuro : logoapptemaclaro} />
      </View>

      <ScrollView
        style={styles.main}
        contentContainerStyle={styles.mainContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <View style={{ flexDirection: 'row' }}>
            <Animated.View style={dotStyle(dot1)} />
            <Animated.View style={dotStyle(dot2)} />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Cadastro</Text>
          <TouchableOpacity onPress={() => setStep(1)} disabled={step === 1}>
            <MaterialIcons
              name="arrow-back" size={24} color={theme.textPrimary}
              style={{ opacity: step === 1 ? 0 : 1 }}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {step === 1 ? (
            <FormEtapa1 tipoConta={tipoConta} setTipoConta={setTipoConta} setStep={setStep} theme={theme} />
          ) : (
            <FormEtapa2
              nome={nome} setNome={setNome} email={email} setEmail={setEmail}
              senha={senha} setSenha={setSenha} confirmarSenha={confirmarSenha}
              setConfirmarSenha={setConfirmarSenha} handleCadastro={handleCadastro} theme={theme}
            />
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />
        <View style={styles.footer}>
          <Text style={[styles.footerA, { color: theme.textPrimary }]}>
            Já possui uma conta?{' '}
            <Text style={[styles.footerLink, { color: theme.link }]} onPress={() => router.replace('/login')}>Entrar</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* =========================

   STYLES

========================= */



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flex: 2 / 10,
    paddingTop: 30,
    paddingLeft: 45,
    marginBottom: 20,
  },
  main: {
    flex: 6 / 10,
    width: '100%',
    paddingLeft: 30,
    paddingRight: 30,
  },
  mainContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 24,
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
    fontWeight: 'bold',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  divider: {
    width: '80%',
    height: 1,
    marginVertical: 10,
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
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1,
    backgroundColor: '#fff',
    borderColor: '#000',
  },
  inputErro: {
    borderColor: '#EF4444',
  },
  errorText: {
    width: '100%',
    color: '#EF4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
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
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSelected: {
    backgroundColor: '#2563EB',
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
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1,
  },
  passwordHint: {
    width: '100%',
    fontSize: 12,
    marginTop: -6,
    marginBottom: 10,
    opacity: 0.85,
  },
  passwordChecklist: {
    width: '100%',
    marginTop: -4,
    marginBottom: 12,
    gap: 6,
  },
  passwordChecklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordChecklistText: {
    fontSize: 12,
    flex: 1,
  },
  inputFlex: {
    flex: 1,
    padding: 15,
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

const dotStyle = (anim: Animated.Value) => ({
  width: 10,
  height: 10,
  borderRadius: 5,
  marginLeft: 6,
  backgroundColor: anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#322BF0'],
  }),
});