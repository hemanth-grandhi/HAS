package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OccupancyService {
    private final OccupancyRecordRepository occRepo;
    private final RoomRepository roomRepo;

    public OccupancyService(OccupancyRecordRepository occRepo, RoomRepository roomRepo) {
        this.occRepo = occRepo;
        this.roomRepo = roomRepo;
    }

    public List<OccupancyRecord> getOccupancyReport() {
        return occRepo.findAll();
    }

    public void reviseTariff(Long roomId, Double percentage) {
        Room room = roomRepo.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
        Double oldTariff = room.getCurrentTariff() != null ? room.getCurrentTariff() : room.getBaseTariff();
        Double newTariff = oldTariff + (oldTariff * percentage / 100);
        room.setCurrentTariff(newTariff);
        roomRepo.save(room);
    }
}
