package com.ABES_HCL.VenueVista.entity;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertTrue;

class EventValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void acceptsZeroBasePrice() {
        Event event = validEvent();
        event.setBasePrice(BigDecimal.ZERO);

        assertTrue(validator.validate(event).isEmpty());
    }

    @Test
    void rejectsNegativeBasePrice() {
        Event event = validEvent();
        event.setBasePrice(new BigDecimal("-0.01"));

        assertTrue(validator.validate(event).stream()
                .anyMatch(error -> error.getPropertyPath().toString().equals("basePrice")));
    }

    private Event validEvent() {
        Event event = new Event();
        event.setTitle("Free Event");
        event.setArtist("VenueVista");
        event.setGenre("Live");
        event.setDate(LocalDate.of(2026, 12, 1));
        event.setTime("19:00");
        event.setVenue("Main Hall");
        event.setCity("Mumbai");
        event.setBasePrice(BigDecimal.ZERO);
        event.setCapacity(100);
        event.setSoldCount(0);
        event.setImage("https://example.com/event.jpg");
        return event;
    }
}
