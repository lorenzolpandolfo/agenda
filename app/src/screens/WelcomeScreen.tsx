import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';

export function WelcomeScreen() {
    const navigation = useNavigation();

    const handleLogin = () => {
        navigation.navigate('Login' as never);
    };

    const handleRegister = () => {
        navigation.navigate('Register' as never);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F6F2" />
            
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('../../assets/icon.png')} 
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>
                        Bem-vindo ao Calm Mind
                    </Text>
                    <Text style={styles.subtitle}>
                        Sua jornada para o bem-estar mental começa aqui
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <CustomButton
                        title="Entrar"
                        onPress={handleLogin}
                        style={styles.loginButton}
                        textStyle={styles.loginButtonText}
                    />
                    
                    <CustomButton
                        title="Criar Conta"
                        onPress={handleRegister}
                        style={styles.registerButton}
                        textStyle={styles.registerButtonText}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F6F2',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoImage: {
        width: 120,
        height: 120,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    title: {
        textAlign: 'center',
        marginBottom: 16,
        color: '#2D1B69',
    },
    subtitle: {
        textAlign: 'center',
        color: '#8B7EC8',
        lineHeight: 24,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    loginButton: {
        backgroundColor: '#8B7EC8',
        borderRadius: 12,
        paddingVertical: 16,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    registerButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#8B7EC8',
        borderRadius: 12,
        paddingVertical: 16,
    },
    registerButtonText: {
        color: '#8B7EC8',
        fontSize: 16,
        fontWeight: '600',
    },
});
