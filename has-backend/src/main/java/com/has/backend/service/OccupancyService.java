package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.exception.ResourceNotFoundException;
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
    private final TariffRevisionPlanRepository tariffPlanRepo;

    public OccupancyService(OccupancyRecordRepository occRepo,
                            RoomRepository roomRepo,
                            TariffRevisionPlanRepository tariffPlanRepo) {
        this.occRepo = occRepo;
        this.roomRepo = roomRepo;
        this.tariffPlanRepo = tariffPlanRepo;
    }

    /**
     * Returns all historical occupancy records (static report).
     */
    public List<OccupancyRecord> getOccupancyReport() {
        return occRepo.findAll();
    }

    public Map<String, Object> getAverageOccupancyForMonth(String month) {
        List<OccupancyRecord> records = occRepo.findByMonth(month);
        if (records.isEmpty()) {
            throw new ResourceNotFoundException("No occupancy records found for month: " + month);
        }

        double average = records.stream()
                .mapToDouble(record -> record.getOccupancyRate() != null ? record.getOccupancyRate() : 0.0)
                .average()
                .orElse(0.0);

        Map<String, Object> result = new HashMap<>();
        result.put("month", month);
        result.put("averageOccupancyRate", Math.round(average * 100.0) / 100.0);
        result.put("recordCount", records.size());
        return result;
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
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));
        Double oldTariff = room.getCurrentTariff() != null ? room.getCurrentTariff() : room.getBaseTariff();
        Double newTariff = oldTariff + (oldTariff * percentage / 100);
        room.setCurrentTariff(newTariff);
        roomRepo.save(room);
    }

    public TariffRevisionPlan scheduleTariffForNextWeek(Long roomId, Double percentage) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));

        Double oldTariff = room.getCurrentTariff() != null ? room.getCurrentTariff() : room.getBaseTariff();
        Double revisedTariff = oldTariff + (oldTariff * percentage / 100);

        LocalDate effectiveFrom = LocalDate.now().plusWeeks(1);
        LocalDate effectiveTo = effectiveFrom.plusDays(6);

        TariffRevisionPlan plan = new TariffRevisionPlan();
        plan.setRoom(room);
        plan.setPercentage(percentage);
        plan.setOriginalTariff(oldTariff);
        plan.setRevisedTariff(revisedTariff);
        plan.setEffectiveFrom(effectiveFrom);
        plan.setEffectiveTo(effectiveTo);
        plan.setApplied(false);

        return tariffPlanRepo.save(plan);
    }

    public List<TariffRevisionPlan> getTariffRevisionPlans() {
        return tariffPlanRepo.findAll();
    }

    @Scheduled(cron = "0 0 1 * * *")
    public void applyDueTariffPlans() {
        LocalDate today = LocalDate.now();
        List<TariffRevisionPlan> duePlans = tariffPlanRepo.findByAppliedFalseAndEffectiveFromLessThanEqual(today);

        for (TariffRevisionPlan plan : duePlans) {
            Room room = plan.getRoom();
            room.setCurrentTariff(plan.getRevisedTariff());
            roomRepo.save(room);

            plan.setApplied(true);
            tariffPlanRepo.save(plan);
        }
    }
}
