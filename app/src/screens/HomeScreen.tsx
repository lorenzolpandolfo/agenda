import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Alert, TouchableOpacity, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import { useAuthStore } from '../store/auth.store';
import { useSchedulesStore } from '../store/schedules.store';
import { userService } from '../services/user.service';
import { scheduleService } from '../services/schedule.service';
import { UserRole, UserStatus } from '../types/user';

export function HomeScreen() {
    const navigation = useNavigation();
    const { user, userId, accessToken, logout, setUser } = useAuthStore();
    const { setSchedules } = useSchedulesStore();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUserData();
        loadSchedules();
    }, []);

    const loadUserData = async () => {
        if (!userId || !accessToken) {
            return;
        }

        if (user?.name && user?.email) {
            return;
        }

        try {
            setLoading(true);
            
            const userData = await userService().getUserData(userId);
            setUser(userData);
            
        } catch (error: any) {
            Alert.alert('Erro', 'Erro ao carregar dados do usuário');
        } finally {
            setLoading(false);
        }
    };

    const loadSchedules = async () => {
        if (!accessToken) {
            return;
        }

        try {
            
            const schedules = await scheduleService().getSchedules({ time_filter: 'ALL' });
            setSchedules(schedules);
            
        } catch (error: any) {
        }
    };

    const navigateToProfile = () => {
        navigation.navigate('UserProfile' as never);
    };

    const navigateToFindAvailabilities = () => {
        navigation.navigate('FindAvailabilities' as never);
    };

    const navigateToMySchedules = () => {
        navigation.navigate('MySchedules' as never);
    };

    const navigateToManageAvailabilities = () => {
        navigation.navigate('ManageAvailabilities' as never);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#F8F6F2" />
                <View style={styles.loadingContainer}>
                    <Text >Carregando...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F6F2" />
        
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.welcomeText}>Olá, {user?.name || 'Usuário'}!</Text>
                    <Text style={styles.roleText}>
                        {user?.role === UserRole.PATIENT ? 'Paciente' : 'Profissional'}
                    </Text>
                </View>
                
                <TouchableOpacity onPress={navigateToProfile} style={styles.profileButton}>
                    {user?.image_url ? (
                        <Image 
                            source={{ uri: user.image_url }} 
                            style={styles.profileImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.profileImage}>
                            <Text style={styles.profileImageText}>
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {user?.role === UserRole.PROFESSIONAL && user?.status === UserStatus.WAITING_VALIDATION && (
                    <View style={styles.warningContainer}>
                        <Text style={styles.warningTitle}>⚠️ Aguardando Validação</Text>
                        <Text style={styles.warningText}>
                            Seu CRP está sendo validado pelo Conselho de Psicologia. 
                            Após a validação, você poderá criar horários disponíveis para atendimento.
                        </Text>
                    </View>
                )}

                {user?.role === UserRole.PATIENT ? (
                    <View style={styles.menuContainer}>
                        <Text style={styles.menuTitle}>
                            O que você gostaria de fazer?
                        </Text>
                        
                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity 
                                style={styles.menuButton}
                                onPress={navigateToFindAvailabilities}
                                activeOpacity={0.8}
                            >
                                <View style={styles.buttonIcon}>
                                    <Text style={styles.iconText}>🔍</Text>
                                </View>
                                <View style={styles.buttonContent}>
                                    <Text style={styles.buttonTitle}>Buscar Horários</Text>
                                    <Text style={styles.buttonSubtitle}>Encontre horários disponíveis</Text>
                                </View>
                                <View style={styles.buttonArrow}>
                                    <Text style={styles.arrowText}>›</Text>
                                </View>
                            </TouchableOpacity>
                        
                            <TouchableOpacity 
                                style={styles.menuButton}
                                onPress={navigateToMySchedules}
                                activeOpacity={0.8}
                            >
                                <View style={styles.buttonIcon}>
                                    <Text style={styles.iconText}>📅</Text>
                                </View>
                                <View style={styles.buttonContent}>
                                    <Text style={styles.buttonTitle}>Meus Agendamentos</Text>
                                    <Text style={styles.buttonSubtitle}>Veja suas consultas</Text>
                                </View>
                                <View style={styles.buttonArrow}>
                                    <Text style={styles.arrowText}>›</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.menuContainer}>
                        <Text style={styles.menuTitle}>
                            Gerenciar sua agenda
                        </Text>
                        
                        <View style={styles.buttonsContainer}>
                        <TouchableOpacity 
                            style={styles.menuButton}
                            onPress={navigateToMySchedules}
                            activeOpacity={0.8}
                        >
                            <View style={styles.buttonIcon}>
                                <Text style={styles.iconText}>📅</Text>
                            </View>
                            <View style={styles.buttonContent}>
                                <Text style={styles.buttonTitle}>Meus Agendamentos</Text>
                                <Text style={styles.buttonSubtitle}>Veja suas consultas</Text>
                            </View>
                            <View style={styles.buttonArrow}>
                                <Text style={styles.arrowText}>›</Text>
                            </View>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[
                                styles.menuButton,
                                user?.status !== UserStatus.READY && styles.disabledButton
                            ]}
                            onPress={navigateToManageAvailabilities}
                            activeOpacity={0.8}
                            disabled={user?.status !== UserStatus.READY}
                        >
                            <View style={[
                                styles.buttonIcon,
                                user?.status !== UserStatus.READY && styles.disabledIcon
                            ]}>
                                <Text style={styles.iconText}>⏰</Text>
                            </View>
                            <View style={styles.buttonContent}>
                                <Text style={[
                                    styles.buttonTitle,
                                    user?.status !== UserStatus.READY && styles.disabledText
                                ]}>
                                    Gerenciar Horários
                                </Text>
                                <Text style={[
                                    styles.buttonSubtitle,
                                    user?.status !== UserStatus.READY && styles.disabledText
                                ]}>
                                    {user?.status === UserStatus.READY 
                                        ? 'Configure sua disponibilidade'
                                        : 'Aguardando validação do CRP'
                                    }
                                </Text>
                            </View>
                            <View style={styles.buttonArrow}>
                                <Text style={[
                                    styles.arrowText,
                                    user?.status !== UserStatus.READY && styles.disabledText
                                ]}>›</Text>
                            </View>
                        </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F6F2',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    headerLeft: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2D1B69',
        marginBottom: 4,
    },
    roleText: {
        fontSize: 14,
        color: '#8B7EC8',
        fontWeight: '500',
    },
    profileButton: {
        padding: 4,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#8B7EC8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImageText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    warningContainer: {
        backgroundColor: '#FFF3CD',
        borderColor: '#FFEAA7',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#856404',
        marginBottom: 8,
    },
    warningText: {
        fontSize: 14,
        color: '#856404',
        lineHeight: 20,
    },
    menuContainer: {
        flex: 1,
    },
    menuTitle: {
        marginBottom: 30,
        textAlign: 'center',
        color: '#2D1B69',
    },
    buttonsContainer: {
        gap: 16,
    },
    menuButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#8B7EC8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    disabledIcon: {
        backgroundColor: '#CCCCCC',
    },
    iconText: {
        fontSize: 24,
    },
    buttonContent: {
        flex: 1,
    },
    buttonTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D1B69',
        marginBottom: 4,
    },
    buttonSubtitle: {
        fontSize: 14,
        color: '#8B7EC8',
        opacity: 0.8,
    },
    disabledText: {
        color: '#CCCCCC',
    },
    buttonArrow: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowText: {
        fontSize: 24,
        color: '#8B7EC8',
        fontWeight: 'bold',
    },
});
