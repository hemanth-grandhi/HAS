package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.exception.InvalidRequestException;
import com.has.backend.exception.ResourceNotFoundException;
import com.has.backend.exception.RoomNotAvailableException;
import com.has.backend.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.List;
import java.util.Locale;

@Service
public class ReservationService {
    private static final Set<String> ALLOWED_ROOM_TYPES = Set.of(
            "SINGLE AC",
            "SINGLE NON-AC",
            "DOUBLE AC",
            "DOUBLE NON-AC"
    );
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

        String normalizedRoomType = roomType == null ? "" : roomType.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_ROOM_TYPES.contains(normalizedRoomType)) {
            throw new InvalidRequestException("Unsupported roomType. Allowed values: Single AC, Single Non-AC, Double AC, Double Non-AC");
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

        Reservation res = new Reservation();
        res.setGuest(guest);
        res.setRoom(availableRoom);
        res.setRoomType(roomType);
        res.setStartDate(startDate);
        res.setEndDate(endDate);
        reservationRepo.save(res);

        return "Reservation confirmed for " + guest.getName() + " (" + roomType + ") from " + startDate + " to " + endDate
                + ". Reservation ID: " + res.getReservationId();
    }

    public Reservation getReservationById(Long reservationId) {
        return reservationRepo.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found for ID: " + reservationId));
    }

    public List<Reservation> getAllReservations() {
        return reservationRepo.findAll();
    }

    /**
     * Looks up reservations by guest name and contact number.
     * Used by the receptionist at check-in to find a guest's reservation.
     */
    public List<Reservation> findReservationsByGuestDetails(String name, String contactNumber) {
        String normalizedName = normalizeName(name);
        String normalizedContact = normalizeContact(contactNumber);

        return reservationRepo.findAll().stream()
                .filter(reservation -> reservation.getGuest() != null)
                .filter(reservation -> normalizeName(reservation.getGuest().getName()).contains(normalizedName))
                .filter(reservation -> contactsMatch(
                        normalizeContact(reservation.getGuest().getContactNumber()),
                        normalizedContact))
                .toList();
    }

    public void cancelReservation(Long reservationId) {
        Reservation reservation = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found for ID: " + reservationId));

        reservationRepo.delete(reservation);
    }

    private String normalizeName(String value) {
        if (value == null) {
            return "";
        }
        return value.trim()
                .replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT);
    }

    private String normalizeContact(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("\\D", "");
    }

    private boolean contactsMatch(String storedContact, String searchContact) {
        if (storedContact.isEmpty() || searchContact.isEmpty()) {
            return false;
        }
        if (storedContact.equals(searchContact)) {
            return true;
        }
        // Allow lookup with/without country code (e.g., +91XXXXXXXXXX vs XXXXXXXXXX).
        if (storedContact.length() >= 7 && searchContact.length() >= 7) {
            return storedContact.endsWith(searchContact) || searchContact.endsWith(storedContact);
        }
        return false;
    }
}
