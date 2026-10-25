package com.ABES_HCL.VenueVista.repository;

import com.ABES_HCL.VenueVista.entity.RazorpayOrder;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RazorpayOrderRepository extends JpaRepository<RazorpayOrder, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM RazorpayOrder o WHERE o.id = :id")
    Optional<RazorpayOrder> findByIdWithLock(@Param("id") String id);
}
