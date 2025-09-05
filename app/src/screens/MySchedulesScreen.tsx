import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Alert, FlatList, Image, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import { useAuthStore } from '../store/auth.store';
import { useSchedulesStore } from '../store/schedules.store';
import { scheduleService } from '../services/schedule.service';
import { Schedule, TimeFilter, AvailabilityStatus } from '../types/schedule';

export function MySchedulesScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { schedules, setSchedules } = useSchedulesStore();
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(TimeFilter.ALL);

  useEffect(() => {
    loadSchedules();
  }, [timeFilter]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      
      const schedulesData = await scheduleService().getSchedules({
        time_filter: timeFilter
      });
      
      setSchedules(schedulesData);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: AvailabilityStatus) => {
    switch (status) {
      case AvailabilityStatus.AVAILABLE:
        return '#4CAF50';
      case AvailabilityStatus.TAKEN:
        return '#FF9800';
      case AvailabilityStatus.COMPLETED:
        return '#2196F3';
      case AvailabilityStatus.CANCELED:
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: AvailabilityStatus) => {
    switch (status) {
      case AvailabilityStatus.AVAILABLE:
        return 'Disponível';
      case AvailabilityStatus.TAKEN:
        return 'Agendado';
      case AvailabilityStatus.COMPLETED:
        return 'Concluído';
      case AvailabilityStatus.CANCELED:
        return 'Cancelado';
      default:
        return status;
    }
  };

  const renderSchedule = ({ item }: { item: Schedule }) => {
    const date = formatDate(item.start_time);
    const time = formatTime(item.start_time);
    const endTime = formatTime(item.end_time);
    const statusColor = getStatusColor(item.status);
    const statusText = getStatusText(item.status);

    return (
      <View style={styles.scheduleCard}>
        <View style={styles.scheduleInfo}>
          {user?.role === 'PATIENT' ? (
            <>
              {item.user?.image_url ? (
                <Image 
                  source={{ uri: item.user.image_url }} 
                  style={styles.professionalImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.professionalImage}>
                  <Text style={styles.professionalImageText}>
                    {item.user?.name?.charAt(0)?.toUpperCase() || 'P'}
                  </Text>
                </View>
              )}
              
              <View style={styles.scheduleDetails}>
                <Text style={styles.professionalName}>
                  {item.user?.name}
                </Text>
                {item.user?.crp && (
                  <Text style={styles.professionalCrp}>
                    CRP: {item.user.crp}
                  </Text>
                )}
                
                <View style={styles.timeInfo}>
                  <Text style={styles.dateText}>
                    {date}
                  </Text>
                  <Text style={styles.timeText}>
                    {time} - {endTime}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.scheduleDetails}>
              <Text style={styles.professionalName}>
                Consulta Agendada
              </Text>
              
              <View style={styles.timeInfo}>
                <Text style={styles.dateText}>
                  {date}
                </Text>
                <Text style={styles.timeText}>
                  {time} - {endTime}
                </Text>
              </View>
            </View>
          )}
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </View>
    );
  };

  const timeFilterOptions = [
    { label: 'Hoje', value: TimeFilter.DAY },
    { label: 'Esta Semana', value: TimeFilter.WEEK },
    { label: 'Este Mês', value: TimeFilter.MONTH },
    { label: 'Todos', value: TimeFilter.ALL },
  ];

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
        <Text style={styles.headerTitle}>Meus Agendamentos</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          data={timeFilterOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                timeFilter === item.value && styles.filterButtonActive
              ]}
              onPress={() => setTimeFilter(item.value)}
            >
              <Text style={[
                styles.filterButtonText,
                timeFilter === item.value && styles.filterButtonTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Carregando agendamentos...</Text>
          </View>
        ) : schedules.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              Nenhum agendamento encontrado
            </Text>
            <Text style={styles.emptyText}>
              {user?.role === 'PATIENT' 
                ? 'Você ainda não possui agendamentos. Que tal buscar por horários disponíveis?'
                : 'Você ainda não possui agendamentos marcados.'
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={schedules}
            renderItem={renderSchedule}
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
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  filtersList: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F8F6F2',
  },
  filterButtonActive: {
    backgroundColor: '#8B7EC8',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#2D1B69',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
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
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  professionalImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8B7EC8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  professionalImageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scheduleDetails: {
    flex: 1,
  },
  professionalName: {
    marginBottom: 4,
  },
  professionalCrp: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#8B7EC8',
  },
  timeInfo: {
    marginTop: 4,
  },
  dateText: {
    opacity: 0.8,
    marginBottom: 2,
  },
  timeText: {
    fontWeight: '600',
    color: '#2D1B69',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
