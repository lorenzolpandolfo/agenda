import Reactotron from 'reactotron-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do Reactotron
const reactotron = Reactotron
  .configure({
    name: 'Calm Mind App',
    host: 'localhost', // Para iOS simulator
    // host: '10.0.2.2', // Para Android emulator
  })
  .useReactNative({
    asyncStorage: false,
    networking: {
      ignoreUrls: /symbolicate/,
    },
    editor: false,
    errors: { veto: (stackFrame) => false },
    overlay: false,
  })
  .setAsyncStorageHandler(AsyncStorage)
  .connect();

// Limpar timeline no reload
if (__DEV__) {
  reactotron.clear();
}

export default reactotron;
