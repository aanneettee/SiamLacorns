package com.example.siamLacorns.service;

import com.example.siamLacorns.dto.ActorDTO;
import com.example.siamLacorns.repository.ActorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ActorService {
    @Autowired
    private ActorRepository actorRepository;

    @Transactional
    public ActorDTO getActorById(Long id) {
        try {
            var actor = actorRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Актер не найден с ID: " + id));

            return new ActorDTO(actor);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при загрузке сериала: " + e.getMessage(), e);
        }
    }
}
