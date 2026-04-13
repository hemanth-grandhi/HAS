package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.exception.ResourceNotFoundException;
import com.has.backend.exception.RoomNotAvailableException;
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
    private final ReservationRepository reservationRepo;

    public CheckInService(
            CheckInRepository checkInRepo,
            GuestRepository guestRepo,
            RoomRepository roomRepo,
            ReservationRepository reservationRepo
    ) {
        this.checkInRepo = checkInRepo;
        this.guestRepo = guestRepo;
        this.roomRepo = roomRepo;
        this.reservationRepo = reservationRepo;
    }

    /**
     * Walk-in check-in: creates a brand new check-in with a new token.
     */
    public CheckIn processCheckIn(Guest guestData, String roomType, Double advancePayment) {
        Guest savedGuest = guestRepo.save(guestData);

        Room room = roomRepo.findByAvailabilityStatus("AVAILABLE").stream()
                .filter(r -> roomType.equalsIgnoreCase(r.getOccupancyType() + " " + r.getAcStatus()))
                .findFirst()
                .orElseThrow(() -> new RoomNotAvailableException("Sorry! No available rooms of type: " + roomType));

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

    /**
     * Reservation-based check-in: converts an existing reservation into an active check-in.
     * Reuses the reservation's token number, guest, and room.
     */
    public CheckIn processCheckIn(String tokenNumber, Double advancePayment) {
        Reservation reservation = reservationRepo.findByTokenNumber(tokenNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found for token: " + tokenNumber));

        Room room = reservation.getRoom();
        room.setAvailabilityStatus("OCCUPIED");
        roomRepo.save(room);

        CheckIn checkIn = new CheckIn();
        checkIn.setTokenNumber(reservation.getTokenNumber());
        checkIn.setGuest(reservation.getGuest());
        checkIn.setRoom(room);
        checkIn.setAdvancePayment(advancePayment);
        checkIn.setCheckInDate(LocalDateTime.now());

        // Remove the reservation since it's now an active check-in
        reservationRepo.delete(reservation);

        return checkInRepo.save(checkIn);
    }

    public CheckIn getCheckInByToken(String tokenNumber) {
        return checkInRepo.findByTokenNumber(tokenNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Check-in not found for token: " + tokenNumber));
    }

    public List<CheckIn> getAllCheckIns() {
        return checkInRepo.findAll();
    }
}
