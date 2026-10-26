package com.ABES_HCL.VenueVista.controller;

import com.ABES_HCL.VenueVista.dto.PurchaseRequestDto;
import com.ABES_HCL.VenueVista.dto.TicketResponseDto;
import com.ABES_HCL.VenueVista.entity.Ticket;
import com.ABES_HCL.VenueVista.repository.TicketRepository;
import com.ABES_HCL.VenueVista.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final TicketService ticketService;

    public TicketController(TicketRepository ticketRepository, TicketService ticketService) {
        this.ticketRepository = ticketRepository;
        this.ticketService = ticketService;
    }

    @GetMapping
    public List<Ticket> getAllTickets(@AuthenticationPrincipal UserDetails user) {
        return ticketRepository.findByBuyerUsername(user.getUsername());
    }

    @PostMapping("/register-free")
    public ResponseEntity<?> registerFreeTicket(
            @Valid @RequestBody PurchaseRequestDto request,
            @AuthenticationPrincipal UserDetails user
    ) {
        try {
            TicketResponseDto ticket = ticketService.registerFreeTicket(request, user.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }

}