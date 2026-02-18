package com.example.siamLacorns.controller;

import com.example.siamLacorns.dto.ActorDTO;
import com.example.siamLacorns.model.Actor;
import com.example.siamLacorns.repository.ActorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin
@RestController
@RequestMapping("/api/actors")
public class ActorController {

    @Autowired
    private ActorRepository actorRepository;

    @GetMapping
    public ResponseEntity<List<ActorDTO>> getAllActors() {
        List<Actor> actors = actorRepository.findAll();
        if (actors.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        List<ActorDTO> actorDTOS = actors.stream()
                .map(ActorDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(actorDTOS);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActorDTO> getActorById(@PathVariable Long id) {
        Actor actor = actorRepository.findById(id)
                .orElse(null);
        if (actor == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new ActorDTO(actor));
    }
}