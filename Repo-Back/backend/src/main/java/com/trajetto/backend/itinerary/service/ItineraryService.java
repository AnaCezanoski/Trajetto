package com.trajetto.backend.itinerary.service;

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
import java.util.List;
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
        eiffel.setOrderIndex(1);

        PlaceModel louvre = new PlaceModel();
        louvre.setName("Louvre Museum");
        louvre.setAddress("Rue de Rivoli, Paris");
        louvre.setLatitude(48.8606);
        louvre.setLongitude(2.3376);
        louvre.setEstimatedVisitTime(LocalTime.of(11, 0));
        louvre.setItinerary(itinerary);
        louvre.setOrderIndex(2);

        places.add(eiffel);
        places.add(louvre);
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

    private ItineraryResponseDTO toDTO(ItineraryModel model) {
        ItineraryResponseDTO dto = new ItineraryResponseDTO();
        dto.setStartDate(model.getStartDate());
        dto.setEndDate(model.getEndDate());
        dto.setActive(model.getActive());
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
