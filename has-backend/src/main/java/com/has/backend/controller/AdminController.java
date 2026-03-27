package com.has.backend.controller;

import com.has.backend.entity.Room;
import com.has.backend.entity.SystemSettings;
import com.has.backend.entity.SystemUser;
import com.has.backend.service.AdminService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
