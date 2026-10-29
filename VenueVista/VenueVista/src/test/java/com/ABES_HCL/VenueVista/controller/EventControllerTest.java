package com.ABES_HCL.VenueVista.controller;

import com.ABES_HCL.VenueVista.entity.Event;
import com.ABES_HCL.VenueVista.repository.EventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventControllerTest {

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private EventController eventController;

    @Test
    void getAllEventsReturnsEventsFromTodayOnward() {
        LocalDate beforeCall = LocalDate.now();
        List<Event> events = List.of(new Event());
        when(eventRepository.findByDateGreaterThanEqual(any(LocalDate.class))).thenReturn(events);

        List<Event> result = eventController.getAllEvents();

        assertSame(events, result);
        ArgumentCaptor<LocalDate> dateCaptor = ArgumentCaptor.forClass(LocalDate.class);
        verify(eventRepository).findByDateGreaterThanEqual(dateCaptor.capture());
        LocalDate afterCall = LocalDate.now();
        assertTrue(dateCaptor.getValue().equals(beforeCall) || dateCaptor.getValue().equals(afterCall));
    }
}
