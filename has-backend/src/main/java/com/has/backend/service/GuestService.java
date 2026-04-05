package com.has.backend.service;

import com.has.backend.entity.Guest;
import com.has.backend.repository.GuestRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GuestService {
    private final GuestRepository guestRepo;

    public GuestService(GuestRepository guestRepo) {
        this.guestRepo = guestRepo;
    }

    public List<Guest> getAllGuests() {
        return guestRepo.findAll();
    }

    public Guest getGuestById(Long guestId) {
        return guestRepo.findById(guestId)
                .orElseThrow(() -> new RuntimeException("Guest not found with ID: " + guestId));
    }

    public Guest updateGuest(Long guestId, Guest guestData) {
        Guest guest = guestRepo.findById(guestId)
                .orElseThrow(() -> new RuntimeException("Guest not found with ID: " + guestId));

        if (guestData.getName() != null) {
            guest.setName(guestData.getName());
        }
        if (guestData.getContactNumber() != null) {
            guest.setContactNumber(guestData.getContactNumber());
        }
        if (guestData.getArrivalDate() != null) {
            guest.setArrivalDate(guestData.getArrivalDate());
        }
        if (guestData.getExpectedCheckOutDate() != null) {
            guest.setExpectedCheckOutDate(guestData.getExpectedCheckOutDate());
        }
        return guestRepo.save(guest);
    }
}
