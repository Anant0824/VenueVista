package com.ABES_HCL.VenueVista.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "razorpay_orders")
public class RazorpayOrder {

    @Id
    private String id;

    @Column(nullable = false)
    private Long eventId;

    @Column(nullable = false)
    private String buyerUsername;

    @Column(nullable = false)
    private String ticketType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Long unitPricePaise;

    @Column(nullable = false)
    private Boolean fulfilled = false;

    protected RazorpayOrder() {
    }

    public RazorpayOrder(
            String id,
            Long eventId,
            String buyerUsername,
            String ticketType,
            Integer quantity,
            Long unitPricePaise
    ) {
        this.id = id;
        this.eventId = eventId;
        this.buyerUsername = buyerUsername;
        this.ticketType = ticketType;
        this.quantity = quantity;
        this.unitPricePaise = unitPricePaise;
    }

    public String getId() { return id; }
    public Long getEventId() { return eventId; }
    public String getBuyerUsername() { return buyerUsername; }
    public String getTicketType() { return ticketType; }
    public Integer getQuantity() { return quantity; }
    public Long getUnitPricePaise() { return unitPricePaise; }
    public Boolean getFulfilled() { return fulfilled; }
    public void setFulfilled(Boolean fulfilled) { this.fulfilled = fulfilled; }
}
