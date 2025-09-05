import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, validateImage } from '../services/image.service';

interface ImagePickerProps {
  label: string;
  imageUrl: string;
  onImageSelect: (imageUrl: string) => void;
}

const ImagePickerComponent: React.FC<ImagePickerProps> = ({ label, imageUrl, onImageSelect }) => {
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'É necessário conceder permissão para acessar a galeria.');
        return false;
      }
    }
    return true;
  };

  const requestCameraPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'É necessário conceder permissão para acessar a câmera.');
        return false;
      }
    }
    return true;
  };

  const handleImagePicker = async (type: 'camera' | 'gallery') => {
    try {
      let hasPermission = false;
      
      if (type === 'camera') {
        hasPermission = await requestCameraPermissions();
      } else {
        hasPermission = await requestPermissions();
      }

      if (!hasPermission) {
        return;
      }

      let result: ImagePicker.ImagePickerResult;

      if (type === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.uri) {
          await uploadImageToServer(asset.uri);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao selecionar imagem. Tente novamente.');
    }
  };

  const uploadImageToServer = async (imageUri: string) => {
    if (!validateImage(imageUri)) {
      Alert.alert('Erro', 'Formato de imagem não suportado.');
      return;
    }

    setUploading(true);
    try {
      const uploadedImageUrl = await uploadImage(imageUri);
      onImageSelect(uploadedImageUrl);
      Alert.alert('Sucesso', 'Imagem enviada com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao enviar imagem. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const showImageOptions = () => {
    if (uploading) return;
    
    Alert.alert(
      'Selecionar Imagem',
      'Escolha como deseja selecionar sua foto de perfil',
      [
        {
          text: 'Câmera',
          onPress: () => handleImagePicker('camera'),
        },
        {
          text: 'Galeria',
          onPress: () => handleImagePicker('gallery'),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const removeImage = () => {
    if (uploading) return;
    
    Alert.alert(
      'Remover Imagem',
      'Deseja remover a imagem atual?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => onImageSelect(''),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      {imageUrl ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          <View style={styles.imageActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.changeButton]}
              onPress={showImageOptions}
              disabled={uploading}
            >
              <Text style={styles.actionButtonText}>Alterar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={removeImage}
              disabled={uploading}
            >
              <Text style={styles.actionButtonText}>Remover</Text>
            </TouchableOpacity>
          </View>
          {uploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.uploadingText}>Enviando...</Text>
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.placeholderContainer}
          onPress={showImageOptions}
          disabled={uploading}
        >
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.uploadingText}>Enviando imagem...</Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>
              Toque para selecionar uma imagem
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  placeholderContainer: {
    height: 120,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  changeButton: {
    backgroundColor: '#007AFF',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: '#007AFF',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ImagePickerComponent; 