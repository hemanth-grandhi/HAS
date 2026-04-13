package com.has.backend.service;

import com.has.backend.entity.*;
import com.has.backend.exception.DuplicateResourceException;
import com.has.backend.exception.ResourceNotFoundException;
import com.has.backend.repository.*;
import org.springframework.stereotype.Service;

@Service
public class FrequentGuestService {
    private final FrequentGuestRepository fgRepo;
    private final GuestRepository guestRepo;

    public FrequentGuestService(FrequentGuestRepository fgRepo, GuestRepository guestRepo) {
        this.fgRepo = fgRepo;
        this.guestRepo = guestRepo;
    }

    public FrequentGuest registerFrequentGuest(Long guestId) {
        Guest guest = guestRepo.findById(guestId)
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found with ID: " + guestId));
        if (fgRepo.findById(Math.toIntExact(guestId)).isPresent()) {
            throw new DuplicateResourceException("Guest with ID " + guestId + " is already a frequent guest");
        }
        FrequentGuest fg = new FrequentGuest();
        fg.setFrequentGuestId(Math.toIntExact(guestId));
        fg.setGuest(guest);
        fg.setRewardPoints(0);
        fg.setDiscountTier("BRONZE");
        return fgRepo.save(fg);
    }

    public FrequentGuest getFrequentGuest(int frequentGuestId) {
        return fgRepo.findById(frequentGuestId)
                .orElseThrow(() -> new ResourceNotFoundException("Frequent guest not found with ID: " + frequentGuestId));
    }

    public FrequentGuest updateRewards(int frequentGuestId, Integer rewardPoints, String discountTier) {
        FrequentGuest fg = fgRepo.findById(frequentGuestId)
                .orElseThrow(() -> new ResourceNotFoundException("Frequent guest not found with ID: " + frequentGuestId));

        if (rewardPoints != null) {
            fg.setRewardPoints(rewardPoints);
        }
        if (discountTier != null) {
            fg.setDiscountTier(discountTier);
        }
        return fgRepo.save(fg);
    }
}
