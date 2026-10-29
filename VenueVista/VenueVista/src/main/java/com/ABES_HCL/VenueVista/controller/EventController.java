package com.ABES_HCL.VenueVista.controller;

import com.ABES_HCL.VenueVista.entity.Event;
import com.ABES_HCL.VenueVista.repository.EventRepository;
import jakarta.validation.Valid; // Import jakarta validation
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @GetMapping
    public List<Event> getAllEvents() {
        return eventRepository.findByDateGreaterThanEqual(LocalDate.now());
    }

    @PostMapping
    public Event createEvent(@Valid @RequestBody Event event) { // Added @Valid
        return eventRepository.save(event);
    }
}