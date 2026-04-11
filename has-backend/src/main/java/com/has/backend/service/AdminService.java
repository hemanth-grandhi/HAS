package com.has.backend.service;

import com.has.backend.dto.CreateUserRequest;
import com.has.backend.entity.*;
import com.has.backend.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminService {
    private static final long SETTINGS_ID = 1L;

    private final SystemUserRepository userRepo;
    private final RoomRepository roomRepo;
    private final SystemSettingsRepository settingsRepo;
    private final PasswordEncoder passwordEncoder;

    public AdminService(
            SystemUserRepository userRepo,
            RoomRepository roomRepo,
            SystemSettingsRepository settingsRepo,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepo = userRepo;
        this.roomRepo = roomRepo;
        this.settingsRepo = settingsRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public SystemUser createUser(CreateUserRequest request) {
        SystemUser user = new SystemUser();
        user.setName(request.getName());
        user.setRole(request.getRole());
        user.setCredentials(request.getCredentials());
        user.setActive(request.isActive());
        return userRepo.save(toConcreteUser(user));
    }

    public Room configureRoom(Room room) {
        return roomRepo.save(room);
    }

    public SystemSettings updateSettings(SystemSettings settings) {
        SystemSettings singletonSettings = settingsRepo.findById(SETTINGS_ID)
                .orElseGet(() -> createDefaultSettings(SETTINGS_ID));
        singletonSettings.setDiscountTier(settings.getDiscountTier());
        singletonSettings.setRewardPointThreshold(settings.getRewardPointThreshold());
        singletonSettings.setOccupancyThreshold(settings.getOccupancyThreshold());
        return settingsRepo.save(singletonSettings);
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
        return settingsRepo.findById(SETTINGS_ID)
                .orElseThrow(() -> new RuntimeException("No system settings configured"));
    }

    @PostConstruct
    public void initializeSettings() {
        if (settingsRepo.findFirstByOrderBySettingIdAsc().isEmpty()) {
            settingsRepo.save(createDefaultSettings(SETTINGS_ID));
        }
    }

    private SystemUser toConcreteUser(SystemUser user) {
        String role = user.getRole();
        if (role == null) {
            throw new RuntimeException("User role is required");
        }

        SystemUser concreteUser = switch (role.trim().toLowerCase()) {
            case "administrator" -> new Administrator();
            case "hotelmanager", "hotel manager" -> new HotelManager();
            case "cateringmanager", "catering manager" -> new CateringManager();
            case "receptionist" -> new Receptionist();
            default -> throw new RuntimeException("Unsupported user role: " + role);
        };

        String normalizedRole = normalizeRole(role);
        concreteUser.setName(user.getName());
        concreteUser.setRole(normalizedRole);
        concreteUser.setCredentials(passwordEncoder.encode(user.getCredentials()));
        concreteUser.setActive(user.isActive());
        return concreteUser;
    }

    private SystemSettings createDefaultSettings(Long settingId) {
        SystemSettings settings = new SystemSettings();
        settings.setSettingId(settingId);
        return settings;
    }

    private String normalizeRole(String role) {
        return role.trim()
                .replace(' ', '_')
                .replaceAll("([a-z])([A-Z])", "$1_$2")
                .toUpperCase();
    }
}
