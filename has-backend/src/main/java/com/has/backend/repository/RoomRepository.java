package com.has.backend.repository;

import com.has.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByAvailabilityStatus(String status);
    List<Room> findByOccupancyTypeAndAcStatus(String occupancyType, String acStatus);
}
