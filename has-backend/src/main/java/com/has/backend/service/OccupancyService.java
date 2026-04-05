package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OccupancyService {
    private final OccupancyRecordRepository occRepo;
    private final RoomRepository roomRepo;

    public OccupancyService(OccupancyRecordRepository occRepo, RoomRepository roomRepo) {
        this.occRepo = occRepo;
        this.roomRepo = roomRepo;
    }

    /**
     * Returns all historical occupancy records (static report).
     */
    public List<OccupancyRecord> getOccupancyReport() {
        return occRepo.findAll();
    }

    /**
     * Dynamically calculates real-time occupancy by scanning the RoomRepository.
     * Returns a map with totalRooms, occupiedRooms, and occupancyPercentage.
     */
    public Map<String, Object> calculateRealTimeOccupancy() {
        List<Room> allRooms = roomRepo.findAll();
        long totalRooms = allRooms.size();
        long occupiedRooms = allRooms.stream()
                .filter(r -> "OCCUPIED".equalsIgnoreCase(r.getAvailabilityStatus()))
                .count();

        double occupancyPercentage = totalRooms > 0
                ? (occupiedRooms * 100.0) / totalRooms
                : 0.0;

        Map<String, Object> result = new HashMap<>();
        result.put("totalRooms", totalRooms);
        result.put("occupiedRooms", occupiedRooms);
        result.put("occupancyPercentage", Math.round(occupancyPercentage * 100.0) / 100.0);
        return result;
    }

    /**
     * Scheduled daily at midnight — snapshots the current occupancy into OccupancyRecord.
     * One record per occupied room is saved with the current month label.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void recordDailyOccupancySnapshot() {
        List<Room> allRooms = roomRepo.findAll();
        long totalRooms = allRooms.size();
        long occupiedRooms = allRooms.stream()
                .filter(r -> "OCCUPIED".equalsIgnoreCase(r.getAvailabilityStatus()))
                .count();

        double occupancyRate = totalRooms > 0
                ? (occupiedRooms * 100.0) / totalRooms
                : 0.0;

        String monthLabel = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        // Save a snapshot record for each occupied room
        allRooms.stream()
                .filter(r -> "OCCUPIED".equalsIgnoreCase(r.getAvailabilityStatus()))
                .forEach(room -> {
                    OccupancyRecord record = new OccupancyRecord();
                    record.setRoom(room);
                    record.setOccupancyRate(occupancyRate);
                    record.setMonth(monthLabel);
                    record.setRevisedTariff(room.getCurrentTariff() != null
                            ? room.getCurrentTariff() : room.getBaseTariff());
                    occRepo.save(record);
                });
    }

    public void reviseTariff(Long roomId, Double percentage) {
        Room room = roomRepo.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
        Double oldTariff = room.getCurrentTariff() != null ? room.getCurrentTariff() : room.getBaseTariff();
        Double newTariff = oldTariff + (oldTariff * percentage / 100);
        room.setCurrentTariff(newTariff);
        roomRepo.save(room);
    }
}
