package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.exception.InvalidRequestException;
import com.has.backend.exception.ResourceNotFoundException;
import com.has.backend.exception.RoomNotAvailableException;
import com.has.backend.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReservationService {
    private final ReservationRepository reservationRepo;
    private final RoomRepository roomRepo;
    private final GuestRepository guestRepo;

    public ReservationService(
            ReservationRepository reservationRepo,
            RoomRepository roomRepo,
            GuestRepository guestRepo
    ) {
        this.reservationRepo = reservationRepo;
        this.roomRepo = roomRepo;
        this.guestRepo = guestRepo;
    }

    public String makeReservation(Guest guest, String roomType, LocalDateTime startDate, LocalDateTime endDate) {
        if (endDate.isBefore(startDate) || endDate.isEqual(startDate)) {
            throw new InvalidRequestException("endDate must be after startDate");
        }

        // Parse the single-string roomType (e.g. "Single AC" -> occupancyType="Single", acStatus="AC")
        String[] parts = roomType.trim().split("\\s+", 2);
        if (parts.length < 2) {
            throw new InvalidRequestException("Invalid roomType format. Expected: '<OccupancyType> <AcStatus>' (e.g. 'Single AC')");
        }
        String occupancyType = parts[0];
        String acStatus = parts[1];

        // Find candidate rooms matching the requested type, excluding out-of-service rooms
        List<Room> candidateRooms = roomRepo.findByOccupancyTypeAndAcStatus(occupancyType, acStatus).stream()
                .filter(r -> !"OUT_OF_SERVICE".equalsIgnoreCase(r.getAvailabilityStatus()))
                .toList();

        if (candidateRooms.isEmpty()) {
            throw new ResourceNotFoundException("No rooms exist of type: " + roomType);
        }

        // Find the first room with no overlapping reservations for the requested dates
        Room availableRoom = candidateRooms.stream()
                .filter(r -> reservationRepo.findOverlappingReservations(r.getRoomId(), startDate, endDate).isEmpty())
                .findFirst()
                .orElseThrow(() -> new RoomNotAvailableException(
                        "Sorry! No available rooms of type '" + roomType + "' for the requested dates"));

        guestRepo.save(guest);

        // Token is generated and stored internally — not returned to the guest
        String token = UUID.randomUUID().toString();
        Reservation res = new Reservation();
        res.setGuest(guest);
        res.setRoom(availableRoom);
        res.setRoomType(roomType);
        res.setStartDate(startDate);
        res.setEndDate(endDate);
        res.setTokenNumber(token);
        reservationRepo.save(res);

        return "Reservation confirmed for " + guest.getName() + " (" + roomType + ") from " + startDate + " to " + endDate;
    }

    public Reservation getReservationByToken(String tokenNumber) {
        return reservationRepo.findByTokenNumber(tokenNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found for token: " + tokenNumber));
    }

    public List<Reservation> getAllReservations() {
        return reservationRepo.findAll();
    }

    /**
     * Looks up reservations by guest name and contact number.
     * Used by the receptionist at check-in to find a guest's reservation.
     */
    public List<Reservation> findReservationsByGuestDetails(String name, String contactNumber) {
        return reservationRepo.findByGuest_NameAndGuest_ContactNumber(name, contactNumber);
    }

    public void cancelReservation(String tokenNumber) {
        Reservation reservation = reservationRepo.findByTokenNumber(tokenNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found for token: " + tokenNumber));

        reservationRepo.delete(reservation);
    }
}
