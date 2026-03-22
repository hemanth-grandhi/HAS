package com.has.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomId;

    private String occupancyType; // Single, Double
    private String acStatus; // AC, Non-AC
    private Double baseTariff;
    private Double currentTariff;

    // AVAILABLE, RESERVED, OCCUPIED, VACANT
    private String availabilityStatus;

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public String getOccupancyType() {
        return occupancyType;
    }

    public void setOccupancyType(String occupancyType) {
        this.occupancyType = occupancyType;
    }

    public String getAcStatus() {
        return acStatus;
    }

    public void setAcStatus(String acStatus) {
        this.acStatus = acStatus;
    }

    public Double getBaseTariff() {
        return baseTariff;
    }

    public void setBaseTariff(Double baseTariff) {
        this.baseTariff = baseTariff;
    }

    public Double getCurrentTariff() {
        return currentTariff;
    }

    public void setCurrentTariff(Double currentTariff) {
        this.currentTariff = currentTariff;
    }

    public String getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(String availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }
}
