package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
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

    public String makeReservation(Guest guest, String roomType, LocalDateTime date) {
        Room room = roomRepo.findByAvailabilityStatus("AVAILABLE").stream()
                .filter(r -> roomType.equalsIgnoreCase(r.getOccupancyType() + " " + r.getAcStatus()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sorry! No available rooms of type: " + roomType));

        room.setAvailabilityStatus("RESERVED");
        roomRepo.save(room);

        guestRepo.save(guest);

        String token = UUID.randomUUID().toString();
        Reservation res = new Reservation();
        res.setGuest(guest);
        res.setRoom(room);
        res.setRoomType(roomType);
        res.setReservationDate(date);
        res.setTokenNumber(token);
        reservationRepo.save(res);

        return token;
    }
}
