import { View, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

type Region = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
};

const Mapa = () => {
    const [region, setRegion] = useState<Region | null>(null);

    useEffect(() => {
        const getLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                console.log('Permissão de localização negada');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});

            setRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        }

        getLocation();
    }, [])

    const defaultRegion = {
        latitude: -14.2350,
        longitude: -51.9253,
        latitudeDelta: 10,
        longitudeDelta: 10,
    };


    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={
                    region ?? defaultRegion
                }
            />
        </View>
    );
}

export default Mapa


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    }
});