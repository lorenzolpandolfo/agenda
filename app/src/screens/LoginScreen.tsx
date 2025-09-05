import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Alert, ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { useAuthStore } from '../store/auth.store';
import { userService } from '../services/user.service';

export function LoginScreen() {
    const navigation = useNavigation();
    const { setAuthData } = useAuthStore();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        try {
            setLoading(true);
        
            const response = await userService().postLogin(formData.email, formData.password);
        
        
            setAuthData(response.access_token, response.refresh_token, response.user_id);
        
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' as never }],
            });

        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    const navigateToRegister = () => {
        navigation.navigate('Register' as never);
    };

    const navigateBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F6F2" />
        
        <View style={styles.header}>
            <CustomButton
                title="←"
                onPress={navigateBack}
                style={styles.backButton}
                textStyle={styles.backButtonText}
            />
            <Text style={styles.headerTitle}>Entrar</Text>
            <View style={styles.placeholder} />
        </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>
                        Bem-vindo de volta!
                    </Text>
                    
                    <Text style={styles.subtitle}>
                        Entre na sua conta para continuar
                    </Text>

                    <View style={styles.inputContainer}>
                        <CustomInput
                            label="Email"
                            placeholder="Digite seu email"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <CustomInput
                            label="Senha"
                            placeholder="Digite sua senha"
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            secureTextEntry
                        />
                    </View>

                    <CustomButton
                        title={loading ? "Entrando..." : "Entrar"}
                        onPress={handleLogin}
                        style={styles.loginButton}
                        disabled={loading}
                    />

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>
                            Não tem uma conta?{' '}
                        </Text>
                        <CustomButton
                            title="Criar conta"
                            onPress={navigateToRegister}
                            style={styles.registerButton}
                            textStyle={styles.registerButtonText}
                        />
                    </View>
                </View>
            </ScrollView>
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
    content: {
        flex: 1,
    },
    formContainer: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
        color: '#2D1B69',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 40,
        opacity: 0.8,
    },
    inputContainer: {
        marginBottom: 20,
    },
    loginButton: {
        marginTop: 20,
        marginBottom: 30,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        opacity: 0.8,
    },
    registerButton: {
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    registerButtonText: {
        color: '#8B7EC8',
        textDecorationLine: 'underline',
    },
});
