package com.has.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "check_ins")
public class CheckIn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long checkInId;

    @Column(unique = true, nullable = false)
    private String tokenNumber;

    @ManyToOne
    @JoinColumn(name = "guest_id", nullable = false)
    private Guest guest;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    private Double advancePayment;

    private LocalDateTime checkInDate;
    private LocalDateTime expectedCheckOutDate;
    private LocalDateTime actualCheckOutDate;

    public Long getCheckInId() {
        return checkInId;
    }

    public void setCheckInId(Long checkInId) {
        this.checkInId = checkInId;
    }

    public String getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(String tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public Guest getGuest() {
        return guest;
    }

    public void setGuest(Guest guest) {
        this.guest = guest;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public Double getAdvancePayment() {
        return advancePayment;
    }

    public void setAdvancePayment(Double advancePayment) {
        this.advancePayment = advancePayment;
    }

    public LocalDateTime getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDateTime checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDateTime getExpectedCheckOutDate() {
        return expectedCheckOutDate;
    }

    public void setExpectedCheckOutDate(LocalDateTime expectedCheckOutDate) {
        this.expectedCheckOutDate = expectedCheckOutDate;
    }

    public LocalDateTime getActualCheckOutDate() {
        return actualCheckOutDate;
    }

    public void setActualCheckOutDate(LocalDateTime actualCheckOutDate) {
        this.actualCheckOutDate = actualCheckOutDate;
    }
}
