package com.ABES_HCL.VenueVista.controller;

import com.ABES_HCL.VenueVista.entity.Ticket;
import com.ABES_HCL.VenueVista.repository.TicketRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketRepository ticketRepository;

    public TicketController(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @GetMapping
    public List<Ticket> getAllTickets(@AuthenticationPrincipal UserDetails user) {
        return ticketRepository.findByBuyerUsername(user.getUsername());
    }

}