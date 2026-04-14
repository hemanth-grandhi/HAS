package com.has.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "occupancy_records")
public class OccupancyRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recordId;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    private Double occupancyRate;
    @Column(name = "occupancy_month")
    private String month;
    private Double revisedTariff;

    public Long getRecordId() {
        return recordId;
    }

    public void setRecordId(Long recordId) {
        this.recordId = recordId;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public Double getOccupancyRate() {
        return occupancyRate;
    }

    public void setOccupancyRate(Double occupancyRate) {
        this.occupancyRate = occupancyRate;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public Double getRevisedTariff() {
        return revisedTariff;
    }

    public void setRevisedTariff(Double revisedTariff) {
        this.revisedTariff = revisedTariff;
    }
}
