package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.exception.ResourceNotFoundException;
import com.has.backend.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.Locale;
import java.util.Optional;

@Service
public class BillingService {
    private final CheckInRepository checkInRepo;
    private final CateringOrderRepository cateringRepo;
    private final BillRepository billRepo;
    private final RoomRepository roomRepo;
    private final FrequentGuestRepository frequentGuestRepo;
    private final SystemSettingsRepository systemSettingsRepo;

    public BillingService(
            CheckInRepository checkInRepo,
            CateringOrderRepository cateringRepo,
            BillRepository billRepo,
            RoomRepository roomRepo,
            FrequentGuestRepository frequentGuestRepo,
            SystemSettingsRepository systemSettingsRepo
    ) {
        this.checkInRepo = checkInRepo;
        this.cateringRepo = cateringRepo;
        this.billRepo = billRepo;
        this.roomRepo = roomRepo;
        this.frequentGuestRepo = frequentGuestRepo;
        this.systemSettingsRepo = systemSettingsRepo;
    }

    public Bill processCheckout(String tokenNumber) {
        return processCheckout(tokenNumber, false);
    }

    public Bill processCheckout(String tokenNumber, boolean registerFrequentGuest) {
        CheckIn checkIn = checkInRepo.findByTokenNumber(tokenNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Check-in not found for token: " + tokenNumber));
        checkIn.setActualCheckOutDate(LocalDateTime.now());
        checkInRepo.save(checkIn);

        Room room = checkIn.getRoom();
        long days = Duration.between(checkIn.getCheckInDate(), checkIn.getActualCheckOutDate()).toDays();
        if (days == 0) days = 1;

        Double currentTariff = room.getCurrentTariff() != null ? room.getCurrentTariff() : room.getBaseTariff();
        double roomCharges = days * currentTariff;

        double cateringCharges = cateringRepo.findByTokenNumber(tokenNumber)
                .stream().mapToDouble(CateringOrder::getCharges).sum();

        double subtotal = roomCharges + cateringCharges;

        // --- Frequent Guest Discount Logic ---
        double discount = 0.0;
        Guest guest = checkIn.getGuest();
        Optional<FrequentGuest> frequentGuestOpt = frequentGuestRepo.findByGuest_GuestId(guest.getGuestId());

        if (frequentGuestOpt.isPresent()) {
            FrequentGuest frequentGuest = frequentGuestOpt.get();
            String tier = frequentGuest.getDiscountTier();

            if (tier != null) {
                // Look up the discount percentage for this tier from SystemSettings
                Optional<SystemSettings> settingsOpt = systemSettingsRepo.findByDiscountTier(tier);
                if (settingsOpt.isPresent()) {
                    SystemSettings settings = settingsOpt.get();
                    Double discountPct = settings.getDiscountPercentage();
                    if (discountPct != null && discountPct > 0) {
                        discount = subtotal * (discountPct / 100.0);
                    }

                    // Award reward points for this stay
                    Integer pointsPerStay = settings.getRewardPointsPerStay();
                    if (pointsPerStay != null && pointsPerStay > 0) {
                        int currentPoints = frequentGuest.getRewardPoints() != null
                                ? frequentGuest.getRewardPoints() : 0;
                        frequentGuest.setRewardPoints(currentPoints + pointsPerStay);
                        frequentGuestRepo.save(frequentGuest);
                    }
                }
            }
        }

        double advance = checkIn.getAdvancePayment() != null ? checkIn.getAdvancePayment() : 0.0;

        Bill bill = new Bill();
        bill.setCheckIn(checkIn);
        bill.setRoomCharges(roomCharges);
        bill.setCateringCharges(cateringCharges);
        bill.setDiscountAmount(discount);
        bill.setAdvancePayment(advance);
        bill.setBalancePayable(subtotal - discount - advance);

        Bill savedBill = billRepo.save(bill);

        if (registerFrequentGuest) {
            registerFrequentGuest(checkIn.getGuest());
        }

        return savedBill;
    }

    public void confirmPayment(Long billId) {
        Bill bill = billRepo.findById(billId).orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + billId));
        Room room = bill.getCheckIn().getRoom();
        room.setAvailabilityStatus("AVAILABLE");
        roomRepo.save(room);
    }

    public Bill getBillById(Long billId) {
        return billRepo.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + billId));
    }

    public Bill getBillByToken(String tokenNumber) {
        return billRepo.findByCheckIn_TokenNumber(tokenNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found for token: " + tokenNumber));
    }

    public String generatePrintableBill(Long billId) {
        Bill bill = getBillById(billId);
        CheckIn checkIn = bill.getCheckIn();
        Guest guest = checkIn.getGuest();
        Room room = checkIn.getRoom();

        return String.format(Locale.US,
                """
                HOTEL AUTOMATION SYSTEM - CUSTOMER BILL
                ---------------------------------------
                Bill ID: %d
                Token Number: %s
                Guest Name: %s
                Room: %s %s (ID: %d)
                Check-In: %s
                Check-Out: %s

                Room Charges: %.2f
                Catering Charges: %.2f
                Discount: %.2f
                Advance Paid: %.2f
                ---------------------------------------
                Balance Amount Payable: %.2f
                """,
                bill.getBillId(),
                checkIn.getTokenNumber(),
                guest.getName(),
                room.getOccupancyType(),
                room.getAcStatus(),
                room.getRoomId(),
                checkIn.getCheckInDate(),
                checkIn.getActualCheckOutDate(),
                bill.getRoomCharges() != null ? bill.getRoomCharges() : 0.0,
                bill.getCateringCharges() != null ? bill.getCateringCharges() : 0.0,
                bill.getDiscountAmount() != null ? bill.getDiscountAmount() : 0.0,
                bill.getAdvancePayment() != null ? bill.getAdvancePayment() : 0.0,
                bill.getBalancePayable() != null ? bill.getBalancePayable() : 0.0);
    }

    private void registerFrequentGuest(Guest guest) {
        if (frequentGuestRepo.findByGuest_GuestId(guest.getGuestId()).isPresent()) {
            return;
        }

        FrequentGuest frequentGuest = new FrequentGuest();
        frequentGuest.setFrequentGuestId(Math.toIntExact(guest.getGuestId()));
        frequentGuest.setGuest(guest);
        frequentGuest.setDiscountTier("BRONZE");
        frequentGuest.setRewardPoints(0);
        frequentGuestRepo.save(frequentGuest);
    }
}
