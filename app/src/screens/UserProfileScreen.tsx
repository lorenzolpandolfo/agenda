import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ScrollView, Alert, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';

import { useAuthStore } from '../store/auth.store';
import { userService } from '../services/user.service';

export function UserProfileScreen() {
  const navigation = useNavigation();
  const { user, userId, accessToken, setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      if (!accessToken || !userId) {
        Alert.alert('Erro', 'Dados de autenticação não encontrados. Faça login novamente.');
        return;
      }
      
      if (user && user.name && user.role) {
        setUserData(user);
        setLoading(false);
        return;
      }
      
      // Caso contrário, buscar dados da API usando o userId
      const userDataFromApi = await userService().getUserData(userId);
      
      if (userDataFromApi) {
        setUserData(userDataFromApi);
        setUser(userDataFromApi); // Atualizar o store também
      }
      
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível carregar os dados do usuário. Verifique sua conexão.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' as never }],
            });
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Funcionalidade', 'Editar perfil em breve!');
  };

  const handleChangePassword = () => {
    Alert.alert('Funcionalidade', 'Alterar senha em breve!');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data não disponível';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'READY':
        return 'Ativo';
      case 'WAITING_VALIDATION':
        return 'Aguardando Validação';
      case 'PENDING':
        return 'Pendente';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
        return '#4CAF50';
      case 'WAITING_VALIDATION':
        return '#FF9800';
      case 'PENDING':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F6F2" />
        
        <View style={styles.header}>
          <CustomButton
            title="←"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            textStyle={styles.backButtonText}
          />
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <Text>Carregando dados do usuário...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F6F2" />
      
      <View style={styles.header}>
        <CustomButton
          title="←"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          textStyle={styles.backButtonText}
        />
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profilePictureContainer}>
          {userData?.image_url ? (
            <Image 
              source={{ uri: userData.image_url }} 
              style={styles.profilePicture}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.profilePicture}>
              <Text style={styles.profilePictureText}>
                {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <CustomButton
            title="Alterar Foto"
            onPress={() => Alert.alert('Funcionalidade', 'Alterar foto em breve!')}
            style={styles.changePhotoButton}
            textStyle={styles.changePhotoButtonText}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.userName}>
            {userData?.name || 'Usuário'}
          </Text>
          <Text style={styles.userEmail}>
            {userData?.email || 'email@exemplo.com'}
          </Text>
          <Text style={styles.userRole}>
            {userData?.role === 'PROFESSIONAL' ? 'Profissional de Saúde Mental' : 'Paciente'}
          </Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>
              Status: 
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(userData?.status || '') }]}>
              <Text style={styles.statusText}>
                {getStatusText(userData?.status || '')}
              </Text>
            </View>
          </View>
        </View>

        {userData?.bio && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>
              Biografia
            </Text>
            <Text style={styles.bioText}>
              {userData.bio}
            </Text>
          </View>
        )}

        {userData?.role === 'PROFESSIONAL' && userData?.crp && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>
              Informações Profissionais
            </Text>
            <Text style={styles.crpText}>
              CRP: {userData.crp}
            </Text>
            {userData.status === 'WAITING_VALIDATION' && (
              <Text style={styles.validationText}> 
                ⚠️ Seu CRP está aguardando validação pelo Conselho de Psicologia
              </Text>
            )}
          </View>
        )}

        {userData?.phone && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>
              Contato
            </Text>
            <Text style={styles.phoneText}>
              Telefone: {userData.phone}
            </Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>
            Informações da Conta
          </Text>
          <Text style={styles.accountInfo}>
            Membro desde: {formatDate(userData?.created_at || '')}
          </Text>
          <Text style={styles.accountInfo}>
            Tipo de conta: {userData?.role === 'PROFESSIONAL' ? 'Profissional' : 'Paciente'}
          </Text>
          <Text style={styles.accountInfo}>
            ID: {userData?.id || userId || 'N/A'}
          </Text>
        </View>

        <View style={styles.actionsSection}>
          <CustomButton
            title="Editar Perfil"
            onPress={handleEditProfile}
            style={styles.actionButton}
            textStyle={styles.actionButtonText}
          />
          
          <CustomButton
            title="Alterar Senha"
            onPress={handleChangePassword}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
          
          <CustomButton
            title="Sair da Conta"
            onPress={handleLogout}
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8B7EC8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePictureText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  changePhotoButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8B7EC8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changePhotoButtonText: {
    color: '#8B7EC8',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userName: {
    marginBottom: 8,
  },
  userEmail: {
    marginBottom: 4,
  },
  userRole: {
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  bioText: {
    lineHeight: 20,
  },
  crpText: {
    fontWeight: '600',
    marginBottom: 8,
  },
  validationText: {
    color: '#FF9800',
    fontStyle: 'italic',
  },
  phoneText: {
    fontWeight: '600',
  },
  accountInfo: {
    marginBottom: 4,
  },
  actionsSection: {
    marginTop: 8,
    marginBottom: 30,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#8B7EC8',
    borderRadius: 12,
    paddingVertical: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8B7EC8',
    borderRadius: 12,
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: '#8B7EC8',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
