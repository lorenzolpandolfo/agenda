import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Alert, FlatList, Image, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import { useAuthStore } from '../store/auth.store';
import { professionalService } from '../services/professional.service';

export function FindProfessionalsScreen() {
  const navigation = useNavigation();
  const { accessToken } = useAuthStore();
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      
      const professionalsData = await professionalService().getProfessionals();
      setProfessionals(professionalsData);
      
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao carregar profissionais');
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalPress = (professionalId: string) => {
    navigation.navigate('ProfessionalAvailabilities' as never, { professionalId } as never);
  };

  const renderProfessional = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.professionalCard}
      onPress={() => handleProfessionalPress(item.id)}
    >
      <View style={styles.professionalInfo}>
        {item.image_url ? (
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.professionalImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.professionalImage}>
            <Text style={styles.professionalImageText}>
              {item.name?.charAt(0)?.toUpperCase() || 'P'}
            </Text>
          </View>
        )}
        
        <View style={styles.professionalDetails}>
          <Text style={styles.professionalName}>
            {item.name}
          </Text>
          <Text style={styles.professionalEmail}>
            {item.email}
          </Text>
          {item.crp && (
            <Text style={styles.professionalCrp}>
              CRP: {item.crp}
            </Text>
          )}
          {item.bio && (
            <Text style={styles.professionalBio}>
              {item.bio}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F6F2" />
      
      {/* Header */}
      <View style={styles.header}>
        <CustomButton
          title="←"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          textStyle={styles.backButtonText}
        />
        <Text style={styles.headerTitle}>Profissionais</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Carregando profissionais...</Text>
          </View>
        ) : professionals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              Nenhum profissional encontrado
            </Text>
            <Text style={styles.emptyText}>
              Não há profissionais disponíveis no momento.
            </Text>
          </View>
        ) : (
          <FlatList
            data={professionals}
            renderItem={renderProfessional}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
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
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.8,
  },
  listContainer: {
    paddingVertical: 20,
  },
  professionalCard: {
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
  professionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  professionalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B7EC8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  professionalImageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  professionalDetails: {
    flex: 1,
  },
  professionalName: {
    marginBottom: 4,
  },
  professionalEmail: {
    marginBottom: 4,
    opacity: 0.8,
  },
  professionalCrp: {
    marginBottom: 4,
    fontWeight: '600',
    color: '#8B7EC8',
  },
  professionalBio: {
    opacity: 0.8,
    lineHeight: 16,
  },
});
