import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Export instances
export const db = firestore();
export const storageRef = storage();