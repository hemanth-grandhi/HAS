package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class CheckInService {
    private final CheckInRepository checkInRepo;
    private final GuestRepository guestRepo;
    private final RoomRepository roomRepo;

    public CheckInService(
            CheckInRepository checkInRepo,
            GuestRepository guestRepo,
            RoomRepository roomRepo
    ) {
        this.checkInRepo = checkInRepo;
        this.guestRepo = guestRepo;
        this.roomRepo = roomRepo;
    }

    public CheckIn processCheckIn(Guest guestData, Double advancePayment) {
        Guest savedGuest = guestRepo.save(guestData);

        Room room = roomRepo.findByAvailabilityStatus("AVAILABLE").stream()
                .filter(r -> savedGuest.getRoomType().equalsIgnoreCase(r.getOccupancyType() + " " + r.getAcStatus()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sorry! No available rooms of type: " + savedGuest.getRoomType()));

        room.setAvailabilityStatus("OCCUPIED");
        roomRepo.save(room);

        CheckIn checkIn = new CheckIn();
        checkIn.setTokenNumber(UUID.randomUUID().toString());
        checkIn.setGuest(savedGuest);
        checkIn.setRoom(room);
        checkIn.setAdvancePayment(advancePayment);
        checkIn.setCheckInDate(LocalDateTime.now());

        return checkInRepo.save(checkIn);
    }
}
