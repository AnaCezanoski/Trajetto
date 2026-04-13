package com.trajetto.backend.itinerary.service;

import com.trajetto.backend.itinerary.data.RomePlacesData;
import com.trajetto.backend.itinerary.data.RomePlacesData.RomePlace;
import com.trajetto.backend.itinerary.dto.GenerateItineraryRequestDTO;
import com.trajetto.backend.itinerary.dto.ItineraryResponseDTO;
import com.trajetto.backend.itinerary.dto.PlaceResponseDTO;
import com.trajetto.backend.itinerary.model.ItineraryModel;
import com.trajetto.backend.itinerary.model.PlaceModel;
import com.trajetto.backend.itinerary.repository.ItineraryRepository;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class ItineraryService {

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private UserRepository userRepository;

    public ItineraryModel createItineraryMock(Long userId) {
        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ItineraryModel> activeItineraries = itineraryRepository.findByUserAndActiveTrue(user);
        for (ItineraryModel old : activeItineraries) {
            old.setActive(false);
            itineraryRepository.save(old);
        }

        ItineraryModel itinerary = new ItineraryModel();
        itinerary.setStartDate(LocalDate.now());
        itinerary.setEndDate(LocalDate.now().plusDays(3));
        List<PlaceModel> places = new ArrayList<>();

        PlaceModel eiffel = new PlaceModel();
        eiffel.setName("Eiffel Tower");
        eiffel.setAddress("Champ de Mars, 5 Avenue Anatole France, Paris");
        eiffel.setLatitude(48.8584);
        eiffel.setLongitude(2.2945);
        eiffel.setEstimatedVisitTime(LocalTime.of(8, 0));
        eiffel.setItinerary(itinerary);
        eiffel.setOrderIndex(0);

        PlaceModel louvre = new PlaceModel();
        louvre.setName("Louvre Museum");
        louvre.setAddress("Rue de Rivoli, Paris");
        louvre.setLatitude(48.8606);
        louvre.setLongitude(2.3376);
        louvre.setEstimatedVisitTime(LocalTime.of(11, 0));
        louvre.setItinerary(itinerary);
        louvre.setOrderIndex(1);

        PlaceModel champsDeMars = new PlaceModel();
        champsDeMars.setName("Champ de Mars Park");
        champsDeMars.setAddress("2 Allée Adrienne Lecouvreur, 75007 Paris");
        champsDeMars.setLatitude(48.8556);
        champsDeMars.setLongitude(2.2986);
        champsDeMars.setEstimatedVisitTime(LocalTime.of(9, 30));
        champsDeMars.setItinerary(itinerary);
        champsDeMars.setOrderIndex(2);

        PlaceModel trocadero = new PlaceModel();
        trocadero.setName("Trocadéro Gardens");
        trocadero.setAddress("Place du Trocadéro et du 11 Novembre, 75016 Paris");
        trocadero.setLatitude(48.8629);
        trocadero.setLongitude(2.2873);
        trocadero.setEstimatedVisitTime(LocalTime.of(10, 30));
        trocadero.setItinerary(itinerary);
        trocadero.setOrderIndex(3);

        places.add(eiffel);
        places.add(louvre);
        places.add(champsDeMars);
        places.add(trocadero);
        itinerary.setUser(user);

        itinerary.setPlaces(places);
        itinerary.setActive(true);

        return itineraryRepository.save(itinerary);
    }

    public ItineraryResponseDTO getActiveItinerary(Long userId) {
        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ItineraryModel> activeItineraries = itineraryRepository.findByUserAndActiveTrue(user);

        if (!activeItineraries.isEmpty()) {
            return toDTO(activeItineraries.get(0));
        }
        return null;
    }

    public ItineraryResponseDTO generateItinerary(GenerateItineraryRequestDTO req) {
        UserModel user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String profile = user.getTravelerProfile();
        boolean hasProfile = profile != null && !profile.equals("SKIPPED");

        Random random = new Random();

        // Score each POI
        record ScoredPlace(RomePlace place, double score) {}

        List<ScoredPlace> scored = RomePlacesData.PLACES.stream().map(place -> {
            double profileScore = hasProfile && place.profiles().contains(profile) ? 3.0 : 0.0;
            double randomScore = random.nextDouble() * 2.0;
            double distKm = haversineKm(req.getStartLatitude(), req.getStartLongitude(),
                    place.latitude(), place.longitude());
            double score = profileScore + randomScore - (distKm * 0.15);
            return new ScoredPlace(place, score);
        }).sorted(Comparator.comparingDouble(ScoredPlace::score).reversed())
                .collect(Collectors.toList());

        // Pick top 6
        List<RomePlace> selected = scored.stream()
                .limit(6)
                .map(ScoredPlace::place)
                .collect(Collectors.toList());

        // Order selected by nearest-neighbor from start
        List<RomePlace> ordered = new ArrayList<>();
        double curLat = req.getStartLatitude();
        double curLng = req.getStartLongitude();
        List<RomePlace> remaining = new ArrayList<>(selected);
        while (!remaining.isEmpty()) {
            double finalCurLat = curLat;
            double finalCurLng = curLng;
            RomePlace nearest = remaining.stream()
                    .min(Comparator.comparingDouble(p ->
                            haversineKm(finalCurLat, finalCurLng, p.latitude(), p.longitude())))
                    .get();
            ordered.add(nearest);
            remaining.remove(nearest);
            curLat = nearest.latitude();
            curLng = nearest.longitude();
        }

        // Deactivate current active itineraries
        itineraryRepository.findByUserAndActiveTrue(user).forEach(old -> {
            old.setActive(false);
            itineraryRepository.save(old);
        });

        // Build and save new itinerary
        LocalTime[] times = {
                LocalTime.of(9, 0), LocalTime.of(10, 30), LocalTime.of(12, 0),
                LocalTime.of(14, 0), LocalTime.of(15, 30), LocalTime.of(17, 0)
        };

        ItineraryModel itinerary = new ItineraryModel();
        itinerary.setStartDate(LocalDate.now());
        itinerary.setEndDate(LocalDate.now());
        itinerary.setActive(true);
        itinerary.setUser(user);
        itinerary.setOriginLatitude(req.getStartLatitude());
        itinerary.setOriginLongitude(req.getStartLongitude());

        List<PlaceModel> places = new ArrayList<>();
        for (int i = 0; i < ordered.size(); i++) {
            RomePlace rp = ordered.get(i);
            PlaceModel p = new PlaceModel();
            p.setName(rp.name());
            p.setAddress(rp.address());
            p.setLatitude(rp.latitude());
            p.setLongitude(rp.longitude());
            p.setEstimatedVisitTime(times[i]);
            p.setOrderIndex(i);
            p.setItinerary(itinerary);
            places.add(p);
        }
        itinerary.setPlaces(places);

        return toDTO(itineraryRepository.save(itinerary));
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    public void deleteItinerary(Long itineraryId, Long userId) {
        ItineraryModel itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        if (!itinerary.getUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        itineraryRepository.delete(itinerary);
    }

    private ItineraryResponseDTO toDTO(ItineraryModel model) {
        ItineraryResponseDTO dto = new ItineraryResponseDTO();
        dto.setId(model.getId());
        dto.setStartDate(model.getStartDate());
        dto.setEndDate(model.getEndDate());
        dto.setActive(model.getActive());
        dto.setOriginLatitude(model.getOriginLatitude());
        dto.setOriginLongitude(model.getOriginLongitude());
        dto.setPlaces(
                model.getPlaces().stream()
                        .map(this::toPlaceDTO)
                        .collect(Collectors.toList())
        );
        return dto;
    }

    private PlaceResponseDTO toPlaceDTO(PlaceModel model) {
        PlaceResponseDTO dto = new PlaceResponseDTO();
        dto.setName(model.getName());
        dto.setAddress(model.getAddress());
        dto.setLatitude(model.getLatitude());
        dto.setLongitude(model.getLongitude());
        dto.setEstimatedVisitTime(model.getEstimatedVisitTime());
        dto.setOrderIndex(model.getOrderIndex());
        return dto;
    }
}
