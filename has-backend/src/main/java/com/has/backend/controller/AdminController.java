package com.has.backend.controller;

import com.has.backend.dto.CreateUserRequest;
import com.has.backend.dto.UserResponse;
import com.has.backend.entity.Room;
import com.has.backend.entity.SystemSettings;
import com.has.backend.entity.SystemUser;
import com.has.backend.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService service;

    public AdminController(AdminService service) {
        this.service = service;
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        SystemUser createdUser = service.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toUserResponse(createdUser));
    }

    @PostMapping("/rooms")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<Room> configureRoom(@RequestBody Room room) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.configureRoom(room));
    }

    @PutMapping("/settings")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<SystemSettings> updateSettings(@RequestBody SystemSettings settings) {
        return ResponseEntity.ok(service.updateSettings(settings));
    }

    @GetMapping("/rooms")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOTEL_MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(service.getAllRooms());
    }

    @GetMapping("/rooms/{roomId}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<Room> getRoomById(@PathVariable Long roomId) {
        return ResponseEntity.ok(service.getRoomById(roomId));
    }

    @PutMapping("/rooms/{roomId}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<Room> updateRoom(@PathVariable Long roomId, @RequestBody Room roomData) {
        return ResponseEntity.ok(service.updateRoom(roomId, roomData));
    }

    @DeleteMapping("/rooms/{roomId}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId) {
        service.deleteRoom(roomId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers().stream()
                .map(this::toUserResponse)
                .toList());
    }

    @GetMapping("/settings")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<SystemSettings> getSettings() {
        return ResponseEntity.ok(service.getSettings());
    }

    private UserResponse toUserResponse(SystemUser user) {
        UserResponse response = new UserResponse();
        response.setUserId(user.getUserId());
        response.setName(user.getName());
        response.setRole(user.getRole());
        response.setActive(user.isActive());
        return response;
    }
}
