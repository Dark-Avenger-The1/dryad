import { Alert } from 'react-native';

// Resolves true only when the user taps the confirm button.
export function confirmAction(title, message, confirmText, { destructive = false } = {}) {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        {
          text: confirmText,
          style: destructive ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}

// Runs a database action and shows an alert instead of crashing on failure.
export async function attempt(failTitle, action) {
  try {
    await action();
  } catch (e) {
    Alert.alert(failTitle, e.message);
  }
}
