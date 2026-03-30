package com.has.backend.controller;

import com.has.backend.entity.Room;
import com.has.backend.entity.SystemSettings;
import com.has.backend.entity.SystemUser;
import com.has.backend.service.AdminService;
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
    public SystemUser createUser(@RequestBody SystemUser user) {
        return service.createUser(user);
    }

    @PostMapping("/rooms")
    public Room configureRoom(@RequestBody Room room) {
        return service.configureRoom(room);
    }

    @PostMapping("/settings")
    public SystemSettings updateSettings(@RequestBody SystemSettings settings) {
        return service.updateSettings(settings);
    }

    @GetMapping("/rooms")
    public List<Room> getAllRooms() {
        return service.getAllRooms();
    }

    @GetMapping("/rooms/{roomId}")
    public Room getRoomById(@PathVariable Long roomId) {
        return service.getRoomById(roomId);
    }

    @PutMapping("/rooms/{roomId}")
    public Room updateRoom(@PathVariable Long roomId, @RequestBody Room roomData) {
        return service.updateRoom(roomId, roomData);
    }

    @DeleteMapping("/rooms/{roomId}")
    public void deleteRoom(@PathVariable Long roomId) {
        service.deleteRoom(roomId);
    }

    @GetMapping("/users")
    public List<SystemUser> getAllUsers() {
        return service.getAllUsers();
    }

    @GetMapping("/settings")
    public SystemSettings getSettings() {
        return service.getSettings();
    }
}
