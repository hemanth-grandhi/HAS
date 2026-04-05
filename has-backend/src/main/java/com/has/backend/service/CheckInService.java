package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
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

    public CheckIn processCheckIn(Guest guestData, String roomType, Double advancePayment) {
        Guest savedGuest = guestRepo.save(guestData);

        Room room = roomRepo.findByAvailabilityStatus("AVAILABLE").stream()
                .filter(r -> roomType.equalsIgnoreCase(r.getOccupancyType() + " " + r.getAcStatus()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sorry! No available rooms of type: " + roomType));

        room.setAvailabilityStatus("OCCUPIED");
        roomRepo.save(room);

        CheckIn checkIn = new CheckIn();
        checkIn.setTokenNumber(UUID.randomUUID().toString());
        checkIn.setGuest(savedGuest);
        checkIn.setRoom(room);
        checkIn.setAdvancePayment(advancePayment);
        checkIn.setCheckInDate(LocalDateTime.now());
        checkIn.setExpectedCheckOutDate(guestData.getExpectedCheckOutDate().atTime(11, 0));

        return checkInRepo.save(checkIn);
    }

    public CheckIn getCheckInByToken(String tokenNumber) {
        return checkInRepo.findByTokenNumber(tokenNumber)
                .orElseThrow(() -> new RuntimeException("Check-in not found for token: " + tokenNumber));
    }

    public List<CheckIn> getAllCheckIns() {
        return checkInRepo.findAll();
    }
}
