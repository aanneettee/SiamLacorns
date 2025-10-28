package com.example.siamLacorns.controller;

import com.example.siamLacorns.service.LacornService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lacorns/episodes")
public class VideoController {

    @Autowired
    private LacornService lacornService;

    @GetMapping("/{episodeId}/video")
    public ResponseEntity<String> getVideoUrl(
            @PathVariable Long episodeId,
            @RequestParam String voicecover) {
        try {
            String videoUrl = lacornService.generateVideoUrl(episodeId, voicecover);
            return ResponseEntity.ok(videoUrl);
        } catch (Exception e) {
            // Fallback URL
            String fallbackUrl = "/videos/episode_" + episodeId + "_" + voicecover + ".mp4";
            return ResponseEntity.ok(fallbackUrl);
        }
    }
}