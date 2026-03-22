package com.has.backend.repository;

import com.has.backend.entity.Room;

import java.util.List;

public interface RoomRepository extends CrudRepository<Room, Long> {
    List<Room> findByAvailabilityStatus(String status);
}
