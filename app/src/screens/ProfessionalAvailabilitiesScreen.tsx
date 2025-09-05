import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Alert, FlatList, Image, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import { useAuthStore } from '../store/auth.store';
import { scheduleService } from '../services/schedule.service';
import { userService } from '../services/user.service';

export function ProfessionalAvailabilitiesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { professionalId } = route.params as { professionalId: string };
  const { accessToken } = useAuthStore();
  
  const [professional, setProfessional] = useState<any>(null);
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const professionalData = await userService().getUserData(professionalId);
      setProfessional(professionalData);
      
      const availabilitiesData = await scheduleService().getAvailabilities({
        professional_id: professionalId,
        status: 'AVAILABLE'
      });
      setAvailabilities(availabilitiesData);

    } catch (error: any) {
      console.error('💥 Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleAppointment = async (availabilityId: string) => {
    try {
      
      await scheduleService().createSchedule({ availability_id: availabilityId });
      
      Alert.alert(
        'Sucesso',
        'Consulta agendada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              loadData();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('💥 Erro ao agendar consulta:', error);
      Alert.alert('Erro', error.message || 'Não foi possível agendar a consulta.');
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const renderAvailability = ({ item }: { item: any }) => (
    <View style={styles.availabilityCard}>
      <View style={styles.availabilityInfo}>
        <Text style={styles.availabilityTime}>
          {formatDateTime(item.start_time)}
        </Text>
        <Text style={styles.availabilityStatus}>
          Disponível
        </Text>
      </View>
      
      <CustomButton
        title="Agendar"
        onPress={() => handleScheduleAppointment(item.id)}
        style={styles.scheduleButton}
        textStyle={styles.scheduleButtonText}
      />
    </View>
  );

  if (loading) {
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
          <Text style={styles.headerTitle}>Disponibilidades</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <Text >Carregando dados...</Text>
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
        <Text style={styles.headerTitle}>Disponibilidades</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {professional && (
          <View style={styles.professionalCard}>
            <View style={styles.professionalInfo}>
              {professional.image_url ? (
                <Image 
                  source={{ uri: professional.image_url }} 
                  style={styles.professionalImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.professionalImage}>
                  <Text style={styles.professionalImageText}>
                    {professional.name?.charAt(0)?.toUpperCase() || 'P'}
                  </Text>
                </View>
              )}
              
              <View style={styles.professionalDetails}>
                <Text style={styles.professionalName}>
                  {professional.name || 'Profissional'}
                </Text>
                <Text style={styles.professionalEmail}>
                  {professional.email}
                </Text>
                {professional.crp && (
                  <Text style={styles.professionalCrp}>
                    CRP: {professional.crp}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        <View style={styles.availabilitiesSection}>
          <Text style={styles.sectionTitle}>
            Horários Disponíveis
          </Text>
          
          {availabilities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhum horário disponível no momento.
              </Text>
            </View>
          ) : (
            <FlatList
              data={availabilities}
              renderItem={renderAvailability}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}
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
  professionalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
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
    fontWeight: '600',
    color: '#8B7EC8',
  },
  availabilitiesSection: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  availabilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  availabilityInfo: {
    flex: 1,
  },
  availabilityTime: {
    marginBottom: 4,
    fontWeight: '600',
  },
  availabilityStatus: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  scheduleButton: {
    backgroundColor: '#8B7EC8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
