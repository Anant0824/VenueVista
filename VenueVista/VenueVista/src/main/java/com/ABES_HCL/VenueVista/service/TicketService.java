package com.ABES_HCL.VenueVista.service;

import com.ABES_HCL.VenueVista.dto.PurchaseRequestDto;
import com.ABES_HCL.VenueVista.dto.TicketResponseDto;
import com.ABES_HCL.VenueVista.entity.Event;
import com.ABES_HCL.VenueVista.entity.RazorpayOrder;
import com.ABES_HCL.VenueVista.entity.Ticket;
import com.ABES_HCL.VenueVista.repository.EventRepository;
import com.ABES_HCL.VenueVista.repository.RazorpayOrderRepository;
import com.ABES_HCL.VenueVista.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;

@Service
public class TicketService {

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final RazorpayOrderRepository razorpayOrderRepository;

    public TicketService(
            EventRepository eventRepository,
            TicketRepository ticketRepository,
            RazorpayOrderRepository razorpayOrderRepository
    ) {
        this.eventRepository = eventRepository;
        this.ticketRepository = ticketRepository;
        this.razorpayOrderRepository = razorpayOrderRepository;
    }

    public long validateRazorpayOrderRequest(PurchaseRequestDto request) {
        if (request.getQuantity() <= 0 || request.getQuantity() > 10) {
            throw new IllegalArgumentException("Quantity must be between 1 and 10.");
        }

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + request.getEventId()));
        if (event.getCapacity() - event.getSoldCount() < request.getQuantity()) {
            throw new IllegalStateException("Not enough tickets are available.");
        }

        String ticketType = normalizeTicketType(request.getTicketType());
        try {
            return calculateUnitPrice(event, ticketType)
                    .movePointRight(2)
                    .longValueExact();
        } catch (ArithmeticException e) {
            throw new IllegalArgumentException("Ticket price is outside Razorpay's supported range.", e);
        }
    }

    @Transactional
    public RazorpayOrder createRazorpayOrderRecord(
            String orderId,
            PurchaseRequestDto request,
            String buyerUsername,
            long unitPricePaise
    ) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + request.getEventId()));

        int requestedQuantity = request.getQuantity();

        if (requestedQuantity <= 0 || requestedQuantity > 10) {
            throw new IllegalArgumentException("Quantity must be between 1 and 10.");
        }

        if (event.getCapacity() - event.getSoldCount() < requestedQuantity) {
            throw new IllegalStateException("Not enough tickets are available.");
        }

        String ticketType = normalizeTicketType(request.getTicketType());

        return razorpayOrderRepository.save(new RazorpayOrder(
                orderId,
                event.getId(),
                buyerUsername,
                ticketType,
                requestedQuantity,
                unitPricePaise
        ));
    }

    @Transactional
    public TicketResponseDto fulfillRazorpayOrder(String orderId, String paymentId, String buyerUsername) {
        RazorpayOrder order = razorpayOrderRepository.findByIdWithLock(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Razorpay order was not found."));
        if (!order.getBuyerUsername().equals(buyerUsername)) {
            throw new IllegalArgumentException("Razorpay order does not belong to the authenticated user.");
        }

        Ticket existingTicket = ticketRepository.findByRazorpayOrderId(orderId).orElse(null);
        if (existingTicket != null) {
            if (!paymentId.equals(existingTicket.getRazorpayPaymentId())) {
                throw new IllegalArgumentException("This order has already been fulfilled by another payment.");
            }
            return toResponse(existingTicket);
        }

        Event event = eventRepository.findByIdWithLock(order.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + order.getEventId()));
        if (event.getCapacity() - event.getSoldCount() < order.getQuantity()) {
            throw new IllegalStateException("Not enough tickets remain to fulfill this paid order.");
        }

        BigDecimal unitPrice = BigDecimal.valueOf(order.getUnitPricePaise(), 2);
        Ticket ticket = new Ticket();
        ticket.setRazorpayOrderId(orderId);
        ticket.setRazorpayPaymentId(paymentId);
        ticket.setEventId(event.getId());
        ticket.setBuyerUsername(buyerUsername);
        ticket.setEventTitle(event.getTitle());
        ticket.setEventDate(event.getDate().toString());
        ticket.setEventVenue(event.getVenue());
        ticket.setTicketType(order.getTicketType());
        ticket.setQuantity(order.getQuantity());
        ticket.setUnitPrice(unitPrice);
        ticket.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(order.getQuantity())));
        Ticket savedTicket = ticketRepository.save(ticket);

        event.setSoldCount(event.getSoldCount() + order.getQuantity());
        eventRepository.save(event);
        order.setFulfilled(true);
        razorpayOrderRepository.save(order);

        return toResponse(savedTicket);
    }

    private BigDecimal calculateUnitPrice(Event event, String ticketType) {
        BigDecimal unitPrice = event.getBasePrice().setScale(2, RoundingMode.HALF_UP);
        if ("VIP".equals(ticketType)) {
            unitPrice = unitPrice.multiply(new BigDecimal("2.5")).setScale(2, RoundingMode.HALF_UP);
        }
        return unitPrice;
    }

    private String normalizeTicketType(String ticketType) {
        String normalized = ticketType == null ? "GA" : ticketType.trim().toUpperCase(Locale.ROOT);
        if (!normalized.equals("GA") && !normalized.equals("VIP")) {
            throw new IllegalArgumentException("Ticket type must be GA or VIP.");
        }
        return normalized;
    }

    private TicketResponseDto toResponse(Ticket ticket) {
        return new TicketResponseDto(
                ticket.getId(),
                ticket.getEventId(),
                ticket.getEventTitle(),
                ticket.getEventDate(),
                ticket.getEventVenue(),
                ticket.getTicketType(),
                ticket.getQuantity(),
                ticket.getUnitPrice(),
                ticket.getTotalPrice()
        );
    }
}