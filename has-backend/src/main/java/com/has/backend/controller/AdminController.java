package com.has.backend.controller;

import com.has.backend.dto.CreateUserRequest;
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
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AdminController {
    private final AdminService service;

    public AdminController(AdminService service) {
        this.service = service;
    }

    @PostMapping("/users")
    public ResponseEntity<SystemUser> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createUser(request));
    }

    @PostMapping("/rooms")
    public ResponseEntity<Room> configureRoom(@RequestBody Room room) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.configureRoom(room));
    }

    @PutMapping("/settings")
    public ResponseEntity<SystemSettings> updateSettings(@RequestBody SystemSettings settings) {
        return ResponseEntity.ok(service.updateSettings(settings));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(service.getAllRooms());
    }

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long roomId) {
        return ResponseEntity.ok(service.getRoomById(roomId));
    }

    @PutMapping("/rooms/{roomId}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long roomId, @RequestBody Room roomData) {
        return ResponseEntity.ok(service.updateRoom(roomId, roomData));
    }

    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId) {
        service.deleteRoom(roomId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<SystemUser>> getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @GetMapping("/settings")
    public ResponseEntity<SystemSettings> getSettings() {
        return ResponseEntity.ok(service.getSettings());
    }
}
