package com.ABES_HCL.VenueVista.repository;

import com.ABES_HCL.VenueVista.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByBuyerUsername(String buyerUsername);
    java.util.Optional<Ticket> findByRazorpayOrderId(String razorpayOrderId);
}