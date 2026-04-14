package com.has.backend.service;

import com.has.backend.dto.CreateUserRequest;
import com.has.backend.entity.*;
import com.has.backend.exception.InvalidRequestException;
import com.has.backend.exception.ResourceNotFoundException;
import com.has.backend.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminService {
    private static final long SETTINGS_ID = 1L;
    private static final String DEFAULT_ADMIN_ROLE = "ADMINISTRATOR";

    private final SystemUserRepository userRepo;
    private final RoomRepository roomRepo;
    private final SystemSettingsRepository settingsRepo;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin.username:admin}")
    private String bootstrapAdminUsername;

    @Value("${app.bootstrap.admin.password:admin123}")
    private String bootstrapAdminPassword;

    @Value("${app.bootstrap.receptionist.username:reception}")
    private String bootstrapReceptionistUsername;

    @Value("${app.bootstrap.receptionist.password:reception123}")
    private String bootstrapReceptionistPassword;

    @Value("${app.bootstrap.catering.username:catering}")
    private String bootstrapCateringUsername;

    @Value("${app.bootstrap.catering.password:catering123}")
    private String bootstrapCateringPassword;

    @Value("${app.bootstrap.manager.username:manager}")
    private String bootstrapManagerUsername;

    @Value("${app.bootstrap.manager.password:manager123}")
    private String bootstrapManagerPassword;

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
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));
    }

    public Room updateRoom(Long roomId, Room roomData) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));

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
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));
        roomRepo.delete(room);
    }

    public List<SystemUser> getAllUsers() {
        return userRepo.findAll();
    }

    public SystemSettings getSettings() {
        return settingsRepo.findById(SETTINGS_ID)
                .orElseThrow(() -> new ResourceNotFoundException("No system settings configured"));
    }

    @PostConstruct
    public void initializeDefaults() {
        if (settingsRepo.findFirstByOrderBySettingIdAsc().isEmpty()) {
            settingsRepo.save(createDefaultSettings(SETTINGS_ID));
        }
        initializeDefaultUsers();
        initializeDefaultRooms();
    }

    private SystemUser toConcreteUser(SystemUser user) {
        String role = user.getRole();
        if (role == null) {
            throw new InvalidRequestException("User role is required");
        }
        String normalizedRole = normalizeRole(role);
        SystemUser concreteUser = switch (role.trim().toLowerCase()) {
            case "administrator" -> new Administrator();
            case "hotelmanager", "hotel manager" -> new HotelManager();
            case "cateringmanager", "catering manager" -> new CateringManager();
            case "receptionist" -> new Receptionist();
            default -> throw new InvalidRequestException("Unsupported user role: " + role);
        };

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
        String trimmed = role.trim();
        if (trimmed.isEmpty()) {
            return trimmed;
        }

        String normalized = trimmed
                .replace('-', '_')
                .replace(' ', '_')
                .replaceAll("([a-z])([A-Z])", "$1_$2")
                .replaceAll("_+", "_")
                .toUpperCase();

        return switch (normalized) {
            case "HOTELMANAGER" -> "HOTEL_MANAGER";
            case "CATERINGMANAGER" -> "CATERING_MANAGER";
            default -> normalized;
        };
    }

    private void initializeDefaultUsers() {
        createUserIfMissing(new Administrator(), bootstrapAdminUsername, DEFAULT_ADMIN_ROLE, bootstrapAdminPassword);
        createUserIfMissing(new Receptionist(), bootstrapReceptionistUsername, "RECEPTIONIST", bootstrapReceptionistPassword);
        createUserIfMissing(new CateringManager(), bootstrapCateringUsername, "CATERING_MANAGER", bootstrapCateringPassword);
        createUserIfMissing(new HotelManager(), bootstrapManagerUsername, "HOTEL_MANAGER", bootstrapManagerPassword);
    }

    private void createUserIfMissing(SystemUser user, String username, String role, String password) {
        if (userRepo.findByName(username).isPresent()) {
            return;
        }

        user.setName(username);
        user.setRole(role);
        user.setCredentials(passwordEncoder.encode(password));
        user.setActive(true);
        userRepo.save(user);
    }

    private void initializeDefaultRooms() {
        if (roomRepo.count() > 0) {
            return;
        }

        roomRepo.save(createRoom("Single", "Non-AC", 2800.0));
        roomRepo.save(createRoom("Single", "AC", 3400.0));
        roomRepo.save(createRoom("Double", "Non-AC", 4300.0));
        roomRepo.save(createRoom("Double", "AC", 4900.0));
        roomRepo.save(createRoom("Deluxe", "AC", 6500.0));
        roomRepo.save(createRoom("Suite", "AC", 10800.0));
    }

    private Room createRoom(String occupancyType, String acStatus, Double tariff) {
        Room room = new Room();
        room.setOccupancyType(occupancyType);
        room.setAcStatus(acStatus);
        room.setBaseTariff(tariff);
        room.setCurrentTariff(tariff);
        room.setAvailabilityStatus("AVAILABLE");
        return room;
    }
}
