import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Alert, TouchableOpacity, ScrollView, RefreshControl, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';
import CustomButton from '../components/CustomButton';
import { useAuthStore } from '../store/auth.store';
import { scheduleService } from '../services/schedule.service';
import { Availability, AvailabilityStatus, TimeFilter } from '../types/schedule';

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

export function FindAvailabilitiesScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>(TimeFilter.WEEK);
  const [reservingAvailability, setReservingAvailability] = useState<string | null>(null);

  useEffect(() => {
    loadAvailabilities();
  }, [selectedTimeFilter]);

  const loadAvailabilities = async () => {
    try {
      setLoading(true);
      
      const availabilitiesData = await scheduleService().getAvailabilities({
        time_filter: selectedTimeFilter,
        status: AvailabilityStatus.AVAILABLE,
        limit: 100
      });
      
      setAvailabilities(availabilitiesData);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao carregar horários disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAvailabilities();
    setRefreshing(false);
  };

  const formatDateTimeFromAPI = (isoString: string) => {
    const utcDate = new Date(isoString);
    const brazilDate = toZonedTime(utcDate, BRAZIL_TIMEZONE);
    
    return {
      date: format(brazilDate, 'dd/MM/yyyy', { locale: ptBR }),
      time: format(brazilDate, 'HH:mm', { locale: ptBR }),
      dayOfWeek: format(brazilDate, 'EEEE', { locale: ptBR })
    };
  };

  const handleReserveAvailability = async (availabilityId: string) => {
    if (user?.role !== 'PATIENT') {
      Alert.alert('Erro', 'Apenas pacientes podem agendar consultas');
      return;
    }

    try {
      setReservingAvailability(availabilityId);
      
      await scheduleService().createSchedule(availabilityId);
      
      Alert.alert(
        'Sucesso!',
        'Horário reservado com sucesso! Você pode ver seus agendamentos na tela "Meus Agendamentos".',
        [
          {
            text: 'OK',
            onPress: () => {
              loadAvailabilities();
            }
          }
        ]
      );
      
    } catch (error: any) {
      
      if (error.message && error.message.includes('já foi agendado')) {
        Alert.alert(
          'Horário Indisponível',
          'Este horário já foi reservado por outro paciente. Por favor, escolha outro horário.',
          [{ text: 'OK' }]
        );
      } else if (error.message && error.message.includes('não está disponível')) {
        Alert.alert(
          'Horário Indisponível',
          'Este horário não está mais disponível. Por favor, escolha outro horário.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erro', error.message || 'Erro ao reservar horário');
      }
    } finally {
      setReservingAvailability(null);
    }
  };

  const getTimeFilterText = (filter: TimeFilter) => {
    switch (filter) {
      case TimeFilter.DAY:
        return 'Hoje';
      case TimeFilter.WEEK:
        return 'Esta Semana';
      case TimeFilter.MONTH:
        return 'Este Mês';
      case TimeFilter.ALL:
        return 'Todos';
      default:
        return filter;
    }
  };

  const renderAvailability = ({ item }: { item: Availability }) => {
    const { date, time, dayOfWeek } = formatDateTimeFromAPI(item.start_time);
    const endTime = formatDateTimeFromAPI(item.end_time).time;
    const isReserving = reservingAvailability === item.id;

    return (
      <View style={styles.availabilityCard}>
        <View style={styles.professionalInfo}>
          {item.user?.image_url ? (
            <View style={styles.professionalImageContainer}>
              <Text style={styles.professionalImageText}>
                {item.user.name?.charAt(0).toUpperCase() || 'P'}
              </Text>
            </View>
          ) : (
            <View style={styles.professionalImagePlaceholder}>
              <Text style={styles.professionalImageText}>
                {item.user?.name?.charAt(0).toUpperCase() || 'P'}
              </Text>
            </View>
          )}
          
          <View style={styles.professionalDetails}>
            <Text style={styles.professionalName}>{item.user?.name}</Text>
            {item.user?.crp && (
              <Text style={styles.professionalCrp}>CRP: {item.user.crp}</Text>
            )}
            {item.user?.bio && (
              <Text style={styles.professionalBio} numberOfLines={2}>
                {item.user.bio}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.availabilityDetails}>
          <Text style={styles.availabilityDate}>{date}</Text>
          <Text style={styles.availabilityDay}>{dayOfWeek}</Text>
          <Text style={styles.availabilityTime}>
            {time} - {endTime}
          </Text>
        </View>
        
        <View style={styles.availabilityActions}>
          <CustomButton
            title={isReserving ? "Reservando..." : "Reservar"}
            onPress={() => handleReserveAvailability(item.id)}
            style={[styles.reserveButton, isReserving && styles.reserveButtonDisabled]}
            disabled={isReserving}
          />
        </View>
      </View>
    );
  };

  const renderTimeFilterButtons = () => {
    const filters = [TimeFilter.DAY, TimeFilter.WEEK, TimeFilter.MONTH, TimeFilter.ALL];
    
    return (
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filtrar por período:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterButtons}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedTimeFilter === filter && styles.filterButtonActive
              ]}
              onPress={() => setSelectedTimeFilter(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedTimeFilter === filter && styles.filterButtonTextActive
              ]}>
                {getTimeFilterText(filter)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Buscar Horários</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B7EC8']}
            tintColor="#8B7EC8"
          />
        }
      >
        <View style={styles.content}>
          {renderTimeFilterButtons()}

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Carregando horários disponíveis...</Text>
            </View>
          ) : availabilities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                Nenhum horário disponível
              </Text>
              <Text style={styles.emptyText}>
                Não há horários disponíveis no período selecionado. Tente outro filtro ou volte mais tarde.
              </Text>
              <CustomButton
                title="Atualizar"
                onPress={loadAvailabilities}
                style={styles.refreshButton}
              />
            </View>
          ) : (
            <View style={styles.availabilitiesList}>
              <Text style={styles.resultsCount}>
                {availabilities.length} horário{availabilities.length !== 1 ? 's' : ''} disponível{availabilities.length !== 1 ? 'is' : ''}
              </Text>
              {availabilities.map((item) => (
                <View key={item.id}>
                  {renderAvailability({ item })}
                </View>
              ))}
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1B69',
    marginBottom: 12,
  },
  filterButtons: {
    paddingRight: 20,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  filterButtonActive: {
    backgroundColor: '#8B7EC8',
    borderColor: '#8B7EC8',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#2D1B69',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#8B7EC8',
  },
  availabilitiesList: {
    marginTop: 10,
  },
  resultsCount: {
    fontSize: 14,
    color: '#8B7EC8',
    marginBottom: 16,
    textAlign: 'center',
  },
  availabilityCard: {
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
    marginBottom: 16,
  },
  professionalImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8B7EC8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  professionalImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8E6E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  professionalImageText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  professionalDetails: {
    flex: 1,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1B69',
    marginBottom: 2,
  },
  professionalCrp: {
    fontSize: 12,
    color: '#8B7EC8',
    marginBottom: 4,
  },
  professionalBio: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  availabilityDetails: {
    marginBottom: 16,
  },
  availabilityDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1B69',
    marginBottom: 2,
  },
  availabilityDay: {
    fontSize: 12,
    color: '#8B7EC8',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  availabilityTime: {
    fontSize: 14,
    color: '#2D1B69',
    fontWeight: '500',
  },
  availabilityActions: {
    alignItems: 'center',
  },
  reserveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reserveButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
});
