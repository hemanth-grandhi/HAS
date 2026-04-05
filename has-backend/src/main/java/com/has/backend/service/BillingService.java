package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.Duration;

@Service
public class BillingService {
    private final CheckInRepository checkInRepo;
    private final CateringOrderRepository cateringRepo;
    private final BillRepository billRepo;
    private final RoomRepository roomRepo;

    public BillingService(
            CheckInRepository checkInRepo,
            CateringOrderRepository cateringRepo,
            BillRepository billRepo,
            RoomRepository roomRepo
    ) {
        this.checkInRepo = checkInRepo;
        this.cateringRepo = cateringRepo;
        this.billRepo = billRepo;
        this.roomRepo = roomRepo;
    }

    public Bill processCheckout(String tokenNumber) {
        CheckIn checkIn = checkInRepo.findByTokenNumber(tokenNumber).orElseThrow(() -> new RuntimeException("Check-in not found"));
        checkIn.setActualCheckOutDate(LocalDateTime.now());
        checkInRepo.save(checkIn);

        Room room = checkIn.getRoom();
        long days = Duration.between(checkIn.getCheckInDate(), checkIn.getActualCheckOutDate()).toDays();
        if (days == 0) days = 1;

        Double currentTariff = room.getCurrentTariff() != null ? room.getCurrentTariff() : room.getBaseTariff();
        double roomCharges = days * currentTariff;

        double cateringCharges = cateringRepo.findByTokenNumber(tokenNumber)
                .stream().mapToDouble(CateringOrder::getCharges).sum();

        double discount = 0.0;
        double advance = checkIn.getAdvancePayment() != null ? checkIn.getAdvancePayment() : 0.0;

        Bill bill = new Bill();
        bill.setCheckIn(checkIn);
        bill.setRoomCharges(roomCharges);
        bill.setCateringCharges(cateringCharges);
        bill.setDiscountAmount(discount);
        bill.setAdvancePayment(advance);
        bill.setBalancePayable(roomCharges + cateringCharges - discount - advance);

        return billRepo.save(bill);
    }

    public void confirmPayment(Long billId) {
        Bill bill = billRepo.findById(billId).orElseThrow(() -> new RuntimeException("Bill not found"));
        Room room = bill.getCheckIn().getRoom();
        room.setAvailabilityStatus("AVAILABLE");
        roomRepo.save(room);
    }

    public Bill getBillById(Long billId) {
        return billRepo.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found with ID: " + billId));
    }

    public Bill getBillByToken(String tokenNumber) {
        return billRepo.findByCheckIn_TokenNumber(tokenNumber)
                .orElseThrow(() -> new RuntimeException("Bill not found for token: " + tokenNumber));
    }
}
