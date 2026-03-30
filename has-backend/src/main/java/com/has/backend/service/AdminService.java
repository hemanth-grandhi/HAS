package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminService {
    private final SystemUserRepository userRepo;
    private final RoomRepository roomRepo;
    private final SystemSettingsRepository settingsRepo;

    public AdminService(
            SystemUserRepository userRepo,
            RoomRepository roomRepo,
            SystemSettingsRepository settingsRepo
    ) {
        this.userRepo = userRepo;
        this.roomRepo = roomRepo;
        this.settingsRepo = settingsRepo;
    }

    public SystemUser createUser(SystemUser user) {
        return userRepo.save(user);
    }

    public Room configureRoom(Room room) {
        return roomRepo.save(room);
    }

    public SystemSettings updateSettings(SystemSettings settings) {
        return settingsRepo.save(settings);
    }

    public List<Room> getAllRooms() {
        return roomRepo.findAll();
    }

    public Room getRoomById(Long roomId) {
        return roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found with ID: " + roomId));
    }

    public Room updateRoom(Long roomId, Room roomData) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found with ID: " + roomId));

        if (roomData.getOccupancyType() != null) {
            room.setOccupancyType(roomData.getOccupancyType());
        }
        if (roomData.getAcStatus() != null) {
            room.setAcStatus(roomData.getAcStatus());
        }
        if (roomData.getBaseTariff() != null) {
            room.setBaseTariff(roomData.getBaseTariff());
        }
        if (roomData.getCurrentTariff() != null) {
            room.setCurrentTariff(roomData.getCurrentTariff());
        }
        if (roomData.getAvailabilityStatus() != null) {
            room.setAvailabilityStatus(roomData.getAvailabilityStatus());
        }
        return roomRepo.save(room);
    }

    public void deleteRoom(Long roomId) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found with ID: " + roomId));
        roomRepo.delete(room);
    }

    public List<SystemUser> getAllUsers() {
        return userRepo.findAll();
    }

    public SystemSettings getSettings() {
        return settingsRepo.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No system settings configured"));
    }
}
