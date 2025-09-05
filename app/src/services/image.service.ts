import { api } from './api';

export const uploadImage = async (imageUri: string): Promise<string> => {
  try {
    if (imageUri.startsWith('file://')) {

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return imageUri;
    }
    
    if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
      return imageUri;
    }
    
    throw new Error('URI de imagem inválida');
  } catch (error) {
    throw new Error('Falha no upload da imagem. Tente novamente.');
  }
};

export const uploadImageToServer = async (imageUri: string): Promise<string> => {
  try {
    const formData = new FormData();

    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile_image.jpg'
    } as any);
    
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.imageUrl;
  } catch (error) {
    throw new Error('Falha no upload da imagem para o servidor.');
  }
};

export const imageToBase64 = async (imageUri: string): Promise<string> => {
  return new Promise((resolve, reject) => {

    resolve(imageUri);
  });
};

export const validateImage = (imageUri: string): boolean => {
  if (!imageUri) return false;
  
  if (imageUri.startsWith('file://') || 
      imageUri.startsWith('http://') || 
      imageUri.startsWith('https://')) {
    return true;
  }
  
  return false;
};

export const getImageInfo = async (imageUri: string) => {
  try {
    
    return {
      uri: imageUri,
      size: 'unknown',
      dimensions: 'unknown',
      type: 'image/jpeg', 
    };
  } catch (error) {
    return null;
  }
};
