package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.repository.*;
import org.springframework.stereotype.Service;

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
}
