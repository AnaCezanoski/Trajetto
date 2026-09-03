import { Alert, AlertButton } from 'react-native';

type ShowAlertOptions = {
  title?: string;
  buttons?: AlertButton[];
};

export function showAlert(message: string, options?: ShowAlertOptions): void {
  Alert.alert(options?.title ?? 'Trajetto', message, options?.buttons);
}
