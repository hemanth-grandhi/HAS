package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

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
                .orElseThrow(() -> new RuntimeException("Sorry! No available rooms of type: " + roomType));

        room.setAvailabilityStatus("OCCUPIED");
        roomRepo.save(room);

        CheckIn checkIn = new CheckIn();
        checkIn.setTokenNumber(generateTokenNumber());
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
    public CheckIn processCheckIn(Long reservationId, Double advancePayment) {
        Reservation reservation = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found for ID: " + reservationId));

        Room room = reservation.getRoom();
        room.setAvailabilityStatus("OCCUPIED");
        roomRepo.save(room);

        CheckIn checkIn = new CheckIn();
        checkIn.setTokenNumber(generateTokenNumber());
        checkIn.setGuest(reservation.getGuest());
        checkIn.setRoom(room);
        checkIn.setAdvancePayment(advancePayment);
        checkIn.setCheckInDate(LocalDateTime.now());
        checkIn.setExpectedCheckOutDate(reservation.getGuest().getExpectedCheckOutDate().atTime(11, 0));

        // Remove the reservation since it's now an active check-in
        reservationRepo.delete(reservation);

        return checkInRepo.save(checkIn);
    }

    public CheckIn getCheckInByToken(String tokenNumber) {
        return checkInRepo.findByTokenNumber(tokenNumber)
                .orElseThrow(() -> new RuntimeException("Check-in not found for token: " + tokenNumber));
    }

    public List<CheckIn> getAllCheckIns() {
        return checkInRepo.findAll();
    }

    private String generateTokenNumber() {
        String tokenNumber;
        do {
            tokenNumber = randomLetters(4) + randomDigits(4);
        } while (checkInRepo.findByTokenNumber(tokenNumber).isPresent());
        return tokenNumber;
    }

    private String randomLetters(int count) {
        StringBuilder value = new StringBuilder(count);
        for (int i = 0; i < count; i++) {
            value.append((char) ('A' + ThreadLocalRandom.current().nextInt(26)));
        }
        return value.toString();
    }

    private String randomDigits(int count) {
        StringBuilder value = new StringBuilder(count);
        for (int i = 0; i < count; i++) {
            value.append(ThreadLocalRandom.current().nextInt(10));
        }
        return value.toString();
    }
}
