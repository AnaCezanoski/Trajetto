import {View, StyleSheet} from 'react-native';
import MapView from 'react-native-maps';


export default function Mapa() {
    return (
        <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -25.4284,
          longitude: -49.2733,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      />
    </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    }
});