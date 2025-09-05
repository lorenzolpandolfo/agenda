import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Alert, TouchableOpacity, ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import CustomButton from '../components/CustomButton';
import { useAuthStore } from '../store/auth.store';
import { scheduleService } from '../services/schedule.service';
import { Availability, AvailabilityStatus, TimeFilter } from '../types/schedule';

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

export function ManageAvailabilitiesScreen() {
  const navigation = useNavigation();
  const { user, userId } = useAuthStore();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [newAvailability, setNewAvailability] = useState({
    date: null as Date | null,
    startTime: null as Date | null,
    endTime: null as Date | null,
  });

  useEffect(() => {
    loadAvailabilities();
  }, []);

  const loadAvailabilities = async () => {
    try {
      setLoading(true);
      
      const availabilitiesData = await scheduleService().getAvailabilities({
        professional_id: userId,
        time_filter: TimeFilter.ALL,
        limit: 100
      });
      
      setAvailabilities(availabilitiesData);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao carregar horários');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForAPI = (date: Date, time: Date) => {
    const combinedDateTime = new Date(date);
    combinedDateTime.setHours(time.getHours());
    combinedDateTime.setMinutes(time.getMinutes());
    combinedDateTime.setSeconds(0);
    combinedDateTime.setMilliseconds(0);
    
    const utcDateTime = fromZonedTime(combinedDateTime, BRAZIL_TIMEZONE);
    
    
    return utcDateTime.toISOString();
  };

  const formatDateTimeFromAPI = (isoString: string) => {
    const utcDate = new Date(isoString);
    const brazilDate = toZonedTime(utcDate, BRAZIL_TIMEZONE);
    
    return {
      date: format(brazilDate, 'dd/MM/yyyy', { locale: ptBR }),
      time: format(brazilDate, 'HH:mm', { locale: ptBR })
    };
  };

  const checkTimeConflict = (startDateTime: string, endDateTime: string) => {
    const newStart = new Date(startDateTime);
    const newEnd = new Date(endDateTime);
    
    const hasConflict = availabilities.some(availability => {
      const existingStart = new Date(availability.start_time);
      const existingEnd = new Date(availability.end_time);
      
      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
    
    return hasConflict;
  };

  const handleAddAvailability = async () => {
    if (!newAvailability.date || !newAvailability.startTime || !newAvailability.endTime) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    const startDateTime = formatDateForAPI(newAvailability.date, newAvailability.startTime);
    const endDateTime = formatDateForAPI(newAvailability.date, newAvailability.endTime);

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      Alert.alert('Erro', 'A hora de fim deve ser posterior à hora de início');
      return;
    }

    if (checkTimeConflict(startDateTime, endDateTime)) {
      Alert.alert(
        'Conflito de Horários',
        'Este horário conflita com um horário já existente. Por favor, escolha outro horário.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (user?.status !== 'READY') {
      Alert.alert(
        'Acesso Restrito',
        'Você precisa ter seu CRP validado pelo Conselho de Psicologia para criar horários disponíveis. Seu status atual é: ' + user?.status,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      
      await scheduleService().createAvailability({
        start_time: startDateTime,
        end_time: endDateTime,
        status: AvailabilityStatus.AVAILABLE
      });
      
      Alert.alert('Sucesso', 'Horário disponível criado com sucesso!');
      
      setNewAvailability({ 
        date: null,
        startTime: null,
        endTime: null
      });
      setShowAddForm(false);
      loadAvailabilities();
      
    } catch (error: any) {
      
      if (error.message && error.message.includes('conflicting')) {
        Alert.alert(
          'Conflito de Horários',
          'Este horário já existe ou conflita com outro horário. Por favor, escolha outro horário.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erro', error.message || 'Erro ao criar horário disponível');
      }
    }
  };

  const handleChangeStatus = async (availabilityId: string, newStatus: AvailabilityStatus) => {
    try {
      
      await scheduleService().changeAvailabilityStatus({
        availability_id: availabilityId,
        status: newStatus
      });
      
      Alert.alert('Sucesso', 'Status do horário alterado com sucesso!');
      loadAvailabilities();
      
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao alterar status do horário');
    }
  };

  const formatDateTime = (dateTime: string) => {
    return formatDateTimeFromAPI(dateTime);
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

  const onDateChange = (selectedDate: Date) => {
    setNewAvailability({ ...newAvailability, date: selectedDate });
    setShowDatePicker(false);
  };

  const onStartTimeChange = (selectedTime: Date) => {
    setNewAvailability({ ...newAvailability, startTime: selectedTime });
    setShowStartTimePicker(false);
  };

  const onEndTimeChange = (selectedTime: Date) => {
    setNewAvailability({ ...newAvailability, endTime: selectedTime });
    setShowEndTimePicker(false);
  };

  const renderAvailability = ({ item }: { item: Availability }) => {
    const { date, time } = formatDateTime(item.start_time);
    const endTime = formatDateTime(item.end_time).time;
    const statusColor = getStatusColor(item.status);
    const statusText = getStatusText(item.status);

    return (
      <View style={styles.availabilityCard}>
        <View style={styles.availabilityInfo}>
          <Text style={styles.availabilityDate}>{date}</Text>
          <Text style={styles.availabilityTime}>
            {time} - {endTime}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>
        
        <View style={styles.availabilityActions}>
          {item.status === AvailabilityStatus.AVAILABLE && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleChangeStatus(item.id, AvailabilityStatus.CANCELED)}
            >
              <Text style={styles.actionButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
          
          {item.status === AvailabilityStatus.TAKEN && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleChangeStatus(item.id, AvailabilityStatus.COMPLETED)}
            >
              <Text style={styles.actionButtonText}>Concluir</Text>
            </TouchableOpacity>
          )}
          
          {item.status === AvailabilityStatus.CANCELED && (
            <TouchableOpacity
              style={[styles.actionButton, styles.availableButton]}
              onPress={() => handleChangeStatus(item.id, AvailabilityStatus.AVAILABLE)}
            >
              <Text style={styles.actionButtonText}>Disponibilizar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const canCreateAvailabilities = user?.status === 'READY';

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
        <Text style={styles.headerTitle}>Meus Horários</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>        

          {canCreateAvailabilities && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddForm(!showAddForm)}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>
                {showAddForm ? 'Cancelar' : '+ Adicionar Horário'}
              </Text>
            </TouchableOpacity>
          )}

          {showAddForm && canCreateAvailabilities && (
            <View style={styles.addForm}>
              <Text style={styles.formTitle}>Novo Horário Disponível</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Data</Text>
                <TouchableOpacity
                  style={styles.inputButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[
                    styles.inputText,
                    !newAvailability.date && styles.placeholderText
                  ]}>
                    {newAvailability.date 
                      ? format(newAvailability.date, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Selecionar data'
                    }
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Hora de Início</Text>
                <TouchableOpacity
                  style={styles.inputButton}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Text style={[
                    styles.inputText,
                    !newAvailability.startTime && styles.placeholderText
                  ]}>
                    {newAvailability.startTime 
                      ? format(newAvailability.startTime, 'HH:mm', { locale: ptBR })
                      : 'Selecionar hora de início'
                    }
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Hora de Fim</Text>
                <TouchableOpacity
                  style={styles.inputButton}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Text style={[
                    styles.inputText,
                    !newAvailability.endTime && styles.placeholderText
                  ]}>
                    {newAvailability.endTime 
                      ? format(newAvailability.endTime, 'HH:mm', { locale: ptBR })
                      : 'Selecionar hora de fim'
                    }
                  </Text>
                </TouchableOpacity>
              </View>

              {newAvailability.date && newAvailability.startTime && newAvailability.endTime && (
                <View style={styles.previewContainer}>
                  <Text style={styles.previewTitle}>Preview do Horário (Horário de Brasília):</Text>
                  <Text style={styles.previewText}>
                    {format(newAvailability.date, 'dd/MM/yyyy', { locale: ptBR })} às {format(newAvailability.startTime, 'HH:mm', { locale: ptBR })} - {format(newAvailability.endTime, 'HH:mm', { locale: ptBR })}
                  </Text>
                  <Text style={styles.previewSubtext}>
                    Será enviado (UTC): {formatDateForAPI(newAvailability.date, newAvailability.startTime)} até {formatDateForAPI(newAvailability.date, newAvailability.endTime)}
                  </Text>
                </View>
              )}
              
              <View style={styles.formActions}>
                <CustomButton
                  title="Criar Horário"
                  onPress={handleAddAvailability}
                  style={styles.createButton}
                />
              </View>
            </View>
          )}

          {availabilities.length > 0 && (
            <View style={styles.existingAvailabilities}>
              <Text style={styles.existingTitle}>Horários Existentes (Horário de Brasília):</Text>
              {availabilities.map((item) => (
                <View key={item.id} style={styles.existingItem}>
                  <Text style={styles.existingText}>
                    {formatDateTime(item.start_time).date} - {formatDateTime(item.start_time).time} até {formatDateTime(item.end_time).time}
                  </Text>
                  <Text style={[styles.existingStatus, { color: getStatusColor(item.status) }]}>
                    {getStatusText(item.status)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text >Carregando horários...</Text>
            </View>
          ) : availabilities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                {canCreateAvailabilities 
                  ? 'Nenhum horário cadastrado'
                  : 'Aguardando validação'
                }
              </Text>
              <Text style={styles.emptyText}>
                {canCreateAvailabilities
                  ? 'Adicione horários disponíveis para que pacientes possam agendar consultas.'
                  : 'Após a validação do seu CRP, você poderá criar horários disponíveis.'
                }
              </Text>
            </View>
          ) : (
            <View style={styles.availabilitiesList}>
              {availabilities.map((item) => (
                <View key={item.id}>
                  {renderAvailability({ item })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={onDateChange}
        onCancel={() => setShowDatePicker(false)}
        minimumDate={new Date()}
        locale="pt_BR"
        titleIOS="Selecionar Data"
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
      />
      
      <DateTimePickerModal
        isVisible={showStartTimePicker}
        mode="time"
        onConfirm={onStartTimeChange}
        onCancel={() => setShowStartTimePicker(false)}
        locale="pt_BR"
        titleIOS="Selecionar Hora de Início"
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
      />
      
      <DateTimePickerModal
        isVisible={showEndTimePicker}
        mode="time"
        onConfirm={onEndTimeChange}
        onCancel={() => setShowEndTimePicker(false)}
        locale="pt_BR"
        titleIOS="Selecionar Hora de Fim"
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
      />
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
  statusContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1B69',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#8B7EC8',
    marginTop: 8,
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#8B7EC8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D1B69',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1B69',
    marginBottom: 8,
  },
  inputButton: {
    backgroundColor: '#F8F6F2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  inputText: {
    fontSize: 16,
    color: '#2D1B69',
  },
  placeholderText: {
    color: '#999999',
    fontStyle: 'italic',
  },
  previewContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    color: '#1E40AF',
    marginBottom: 4,
  },
  previewSubtext: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  existingAvailabilities: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  existingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1B69',
    marginBottom: 12,
  },
  existingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  existingText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  existingStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  formActions: {
    marginTop: 10,
  },
  createButton: {
    backgroundColor: '#4CAF50',
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
  },
  availabilitiesList: {
    marginTop: 10,
  },
  availabilityCard: {
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
  availabilityInfo: {
    flex: 1,
  },
  availabilityDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1B69',
    marginBottom: 4,
  },
  availabilityTime: {
    fontSize: 14,
    color: '#8B7EC8',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  availabilityActions: {
    marginLeft: 16,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 4,
  },
  availableButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  completeButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
