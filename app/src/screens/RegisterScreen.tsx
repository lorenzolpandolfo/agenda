import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import ImagePickerComponent from '../components/ImagePicker';
import { UserRole } from '../types/user';
import { userService } from '../services/user.service';
import { useAuthStore } from '../store/auth.store';

export function RegisterScreen() {
  const navigation = useNavigation();
  const { setAuthData } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    bio: '',
    crp: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (formData.crp.trim() && !/^CRP\/\d{2}-\d{5}$/.test(formData.crp.trim())) {
      newErrors.crp = 'CRP deve estar no formato CRP/XX-XXXXX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        crp: formData.crp.trim() || undefined,
        image_url: formData.imageUrl.trim() || undefined,
      };

      console.log('📝 Criando conta...');
      const response = await userService().postRegister(userData);
      console.log('✅ Conta criada com sucesso:', response.name);

      console.log('🔐 Fazendo login automático...');
      const loginResponse = await userService().postLogin(formData.email.trim().toLowerCase(), formData.password);
      console.log('✅ Login realizado com sucesso');

      setAuthData(loginResponse.access_token, loginResponse.refresh_token, loginResponse.user_id);

      Alert.alert(
        'Sucesso!',
        'Conta criada e login realizado com sucesso!',
        [{ 
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' as never }],
            });
          }
        }]
      );

    } catch (error: any) {
      console.error('💥 Erro ao criar conta:', error);
      Alert.alert(
        'Erro',
        error.message || 'Erro ao criar conta. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    updateFormData('imageUrl', imageUrl);
  };

  const handleBackToWelcome = () => {
    navigation.goBack();
  };

  const isProfessional = formData.crp.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CustomButton
          title="←"
          onPress={handleBackToWelcome}
          style={styles.backButton}
          textStyle={styles.backButtonText}
        />
        <Text style={styles.headerTitle}>Criar Conta</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.form}>
            <ImagePickerComponent
              label="Foto de Perfil"
              imageUrl={formData.imageUrl}
              onImageSelect={handleImageSelect}
            />

            <CustomInput
              label="Nome Completo"
              placeholder="Digite seu nome completo"
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              error={errors.name}
              autoCapitalize="words"
            />

            <CustomInput
              label="Email"
              placeholder="Digite seu email"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <CustomInput
              label="Biografia"
              placeholder="Conte um pouco sobre você"
              value={formData.bio}
              onChangeText={(text) => updateFormData('bio', text)}
              error={errors.bio}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <CustomInput
              label="CRP (Opcional)"
              placeholder="CRP/01-12345 (para psicólogos)"
              value={formData.crp}
              onChangeText={(text) => updateFormData('crp', text)}
              error={errors.crp}
              autoCapitalize="characters"
            />

            {isProfessional && (
              <View style={styles.professionalInfo}>
                <Text style={styles.professionalText}>
                  ⚠️ Como você informou um CRP, sua conta será criada como PROFISSIONAL e ficará em validação até a confirmação do Conselho de Psicologia.
                </Text>
              </View>
            )}

            <CustomInput
              label="Senha"
              placeholder="Digite sua senha"
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              error={errors.password}
              secureTextEntry
            />

            <CustomInput
              label="Confirmar Senha"
              placeholder="Confirme sua senha"
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData('confirmPassword', text)}
              error={errors.confirmPassword}
              secureTextEntry
            />

            <CustomButton
              title={loading ? "Criando conta..." : "Criar Conta"}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#8B7EC8',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D1B69',
  },
  placeholder: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  professionalInfo: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  professionalText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});
