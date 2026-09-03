import { ImageSourcePropType } from 'react-native';

export type Destination = {
  title: string;
  subtitle: string;
  time: string;
  image: ImageSourcePropType;
  bgColor: string;
};

export const DESTINATIONS: Destination[] = [
  {
    title: 'Tokyo',
    subtitle: 'Japão',
    time: '14h voo',
    image: require('@/assets/appImgs/tokyoImg.jpg'),
    bgColor: '#1a1a1a',
  },
  {
    title: 'Paris',
    subtitle: 'França',
    time: '11h voo',
    image: require('@/assets/appImgs/parisImg.jpg'),
    bgColor: '#e85d9b',
  },
  {
    title: 'NYC',
    subtitle: 'EUA',
    time: '9h voo',
    image: require('@/assets/appImgs/nycImg.jpg'),
    bgColor: '#3b82f6',
  },
  {
    title: 'Roma',
    subtitle: 'Itália',
    time: '12h voo',
    image: require('@/assets/appImgs/romeImg.jpg'),
    bgColor: '#c7be40',
  },
  {
    title: 'Veneza',
    subtitle: 'Itália',
    time: '12h voo',
    image: require('@/assets/appImgs/veniceImg.jpg'),
    bgColor: '#aa88da',
  },
  {
    title: 'Curitiba',
    subtitle: 'Brasil',
    time: '2h voo',
    image: require('@/assets/appImgs/jdBotanicoImg.jpg'),
    bgColor: '#85d363',
  },
];
