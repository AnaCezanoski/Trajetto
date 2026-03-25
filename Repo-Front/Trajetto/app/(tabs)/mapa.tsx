import { View, StyleSheet } from 'react-native';
import MapView, {Polyline} from 'react-native-maps';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { RouteService } from '@/services/routeService';
import polyline from '@mapbox/polyline';

type Region = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
};

const Mapa = () => {
    const [region, setRegion] = useState<Region | null>(null);
    const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);

    useEffect(() => {
        const getLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                console.log('Permissão de localização negada');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});

            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };

            setRegion(newRegion);
            console.log('pegou location');

            await fecthRoute(newRegion);

        }

        getLocation();
    }, [])

    const defaultRegion = {
        latitude: -14.2350,
        longitude: -51.9253,
        latitudeDelta: 10,
        longitudeDelta: 10,
    };

    const fecthRoute = async (region: Region) => {
        if (!region) return;

        try {
            const data = await RouteService.getRoute(
                {
                    lat: region.latitude,
                    lng: region.longitude,
                },
                {
                    lat: -25.4300,
                    lng: -49.2700,
                }
            )

            const decoded = polyline.decode(data.geometry);

            const coords = decoded.map(([lat, lng]: number[]) => ({
                latitude: lat,
                longitude: lng,
            }));

            setRouteCoords(coords);
        } catch (error) {
            console.log(error);
        }

    }

    useEffect(()=>{
        console.log('routeCoords: ',routeCoords);
    }, [routeCoords])


    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={
                    region ?? defaultRegion
                }
            >
                {routeCoords.length > 0 && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeWidth={4}
                    />
                )}


            </MapView>
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