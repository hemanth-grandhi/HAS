package com.has.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateUserRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String role; // administrator, hotelmanager, cateringmanager, receptionist

    @NotBlank
    private String credentials; // raw password — will be encoded in service

    private boolean active = true;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getCredentials() {
        return credentials;
    }

    public void setCredentials(String credentials) {
        this.credentials = credentials;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
