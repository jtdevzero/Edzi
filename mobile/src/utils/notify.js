import { Alert, Platform } from 'react-native';

export function notify(title, message = '') {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

export function confirm(title, message, onConfirm) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Mégse', style: 'cancel' },
    { text: 'Igen', style: 'destructive', onPress: onConfirm }
  ]);
}
