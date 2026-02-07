package com.example.siamLacorns.controller;

import com.example.siamLacorns.dto.ActorDTO;
import com.example.siamLacorns.service.ActorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/actors")
public class ActorController {

    @Autowired
    private ActorService actorService;

    @GetMapping("/{id}")
    public ResponseEntity<ActorDTO> getActorById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        var actor = actorService.getActorById(id);
        return ResponseEntity.ok(actor);
    }
}
