package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.repository.*;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class FrequentGuestService {
    private final FrequentGuestRepository fgRepo;
    private final GuestRepository guestRepo;

    public FrequentGuestService(FrequentGuestRepository fgRepo, GuestRepository guestRepo) {
        this.fgRepo = fgRepo;
        this.guestRepo = guestRepo;
    }

    public FrequentGuest registerFrequentGuest(Long guestId) {
        Guest guest = guestRepo.findById(guestId).orElseThrow();
        FrequentGuest fg = new FrequentGuest();
        fg.setFrequentGuestId("FG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        fg.setGuest(guest);
        fg.setRewardPoints(0);
        fg.setDiscountTier("BRONZE");
        return fgRepo.save(fg);
    }

    public FrequentGuest getFrequentGuest(String frequentGuestId) {
        return fgRepo.findById(frequentGuestId)
                .orElseThrow(() -> new RuntimeException("Frequent guest not found: " + frequentGuestId));
    }

    public FrequentGuest updateRewards(String frequentGuestId, Integer rewardPoints, String discountTier) {
        FrequentGuest fg = fgRepo.findById(frequentGuestId)
                .orElseThrow(() -> new RuntimeException("Frequent guest not found: " + frequentGuestId));

        if (rewardPoints != null) {
            fg.setRewardPoints(rewardPoints);
        }
        if (discountTier != null) {
            fg.setDiscountTier(discountTier);
        }
        return fgRepo.save(fg);
    }
}
