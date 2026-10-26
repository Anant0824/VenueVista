package com.ABES_HCL.VenueVista.service;

import com.ABES_HCL.VenueVista.dto.PurchaseRequestDto;
import com.ABES_HCL.VenueVista.dto.TicketResponseDto;
import com.ABES_HCL.VenueVista.entity.Event;
import com.ABES_HCL.VenueVista.entity.Ticket;
import com.ABES_HCL.VenueVista.repository.EventRepository;
import com.ABES_HCL.VenueVista.repository.RazorpayOrderRepository;
import com.ABES_HCL.VenueVista.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private RazorpayOrderRepository razorpayOrderRepository;

    private TicketService ticketService;

    @BeforeEach
    void setUp() {
        ticketService = new TicketService(eventRepository, ticketRepository, razorpayOrderRepository);
    }

    @Test
    void registersFreeTicketWithoutRazorpayPaymentDetails() {
        Event event = eventWithPrice("0.00");
        when(eventRepository.findByIdWithLock(7L)).thenReturn(Optional.of(event));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TicketResponseDto response = ticketService.registerFreeTicket(
                new PurchaseRequestDto(7L, 2, "GA"),
                "attendee"
        );

        ArgumentCaptor<Ticket> ticketCaptor = ArgumentCaptor.forClass(Ticket.class);
        verify(ticketRepository).save(ticketCaptor.capture());
        Ticket savedTicket = ticketCaptor.getValue();
        assertEquals("attendee", savedTicket.getBuyerUsername());
        assertEquals(2, savedTicket.getQuantity());
        assertEquals(BigDecimal.ZERO.setScale(2), savedTicket.getUnitPrice());
        assertEquals(BigDecimal.ZERO.setScale(2), savedTicket.getTotalPrice());
        assertNull(savedTicket.getRazorpayOrderId());
        assertNull(savedTicket.getRazorpayPaymentId());
        assertEquals(BigDecimal.ZERO.setScale(2), response.getTotalPrice());
        assertEquals(2, event.getSoldCount());
        verify(eventRepository).save(event);
        verifyNoInteractions(razorpayOrderRepository);
    }

    @Test
    void rejectsFreeRegistrationForPaidEvent() {
        Event event = eventWithPrice("25.00");
        when(eventRepository.findByIdWithLock(7L)).thenReturn(Optional.of(event));

        assertThrows(IllegalArgumentException.class, () -> ticketService.registerFreeTicket(
                new PurchaseRequestDto(7L, 1, "GA"),
                "attendee"
        ));

        verify(ticketRepository, never()).save(any(Ticket.class));
        verify(eventRepository, never()).save(any(Event.class));
        verifyNoInteractions(razorpayOrderRepository);
    }

    private Event eventWithPrice(String price) {
        Event event = new Event();
        event.setId(7L);
        event.setTitle("Test Event");
        event.setDate(LocalDate.of(2026, 11, 1));
        event.setVenue("Test Venue");
        event.setBasePrice(new BigDecimal(price));
        event.setCapacity(10);
        event.setSoldCount(0);
        return event;
    }
}
