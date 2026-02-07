package com.example.siamLacorns.service;

import com.example.siamLacorns.dto.CollectionDTO;
import com.example.siamLacorns.exception.ResourceNotFoundException;
import com.example.siamLacorns.model.Lacorn;
import com.example.siamLacorns.model.SeriesCollection;
import com.example.siamLacorns.model.User;
import com.example.siamLacorns.repository.LacornRepository;
import com.example.siamLacorns.repository.SeriesCollectionRepository;
import com.example.siamLacorns.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserCollectionService {

    @Autowired
    private SeriesCollectionRepository collectionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LacornRepository lacornRepository;

    private final List<String> DEFAULT_COLLECTIONS = Arrays.asList(
            "Favourites", "Watch later", "Started", "Forsaken"
    );

    // Инициализация коллекций по умолчанию для нового пользователя
    public void initializeDefaultCollections(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден с ID: " + userId));

        for (String collectionName : DEFAULT_COLLECTIONS) {
            if (!collectionRepository.existsByUserIdAndName(userId, collectionName)) {
                SeriesCollection collection = new SeriesCollection(collectionName, user);
                collectionRepository.save(collection);
            }
        }
    }

    // Получение всех коллекций пользователя
    @Transactional(readOnly = true)
    public List<CollectionDTO> getUserCollections(Long userId) {
        List<SeriesCollection> collections = collectionRepository.findByUserIdWithSeries(userId);

        // Если коллекций нет - инициализируем дефолтные
        if (collections.isEmpty()) {
            initializeDefaultCollections(userId);
            collections = collectionRepository.findByUserIdWithSeries(userId);
        }

        return collections.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Добавление сериала в коллекцию
    public CollectionDTO addToCollection(Long userId, String collectionName, Long lacornId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден с ID: " + userId));

        Lacorn lacorn = lacornRepository.findById(lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Сериал не найден с ID: " + lacornId));

        SeriesCollection collection = collectionRepository.findByUserIdAndName(userId, collectionName)
                .orElseGet(() -> {
                    SeriesCollection newCollection = new SeriesCollection(collectionName, user);
                    return collectionRepository.save(newCollection);
                });

        // Проверяем, нет ли уже этого сериала в коллекции
        if (!collection.getLacorns().contains(lacorn)) {
            collection.addLacorn(lacorn);
            collection = collectionRepository.save(collection);
        }

        return convertToDTO(collection);
    }

    // Удаление сериала из коллекции
    public void removeFromCollection(Long userId, String collectionName, Long lacornId) {
        SeriesCollection collection = collectionRepository.findByUserIdAndName(userId, collectionName)
                .orElseThrow(() -> new ResourceNotFoundException("Коллекция не найдена: " + collectionName));

        Lacorn lacorn = lacornRepository.findById(lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Сериал не найден с ID: " + lacornId));

        if (collection.getLacorns().contains(lacorn)) {
            collection.removeLacorn(lacorn);
            collectionRepository.save(collection);
        }
    }

    // Получение конкретной коллекции
    @Transactional(readOnly = true)
    public CollectionDTO getCollectionByName(Long userId, String collectionName) {
        SeriesCollection collection = collectionRepository.findByUserIdAndName(userId, collectionName)
                .orElseThrow(() -> new ResourceNotFoundException("Коллекция не найдена: " + collectionName));

        return convertToDTO(collection);
    }

    // Конвертация в DTO
    private CollectionDTO convertToDTO(SeriesCollection collection) {
        List<Long> seriesIds = collection.getLacorns().stream()
                .map(Lacorn::getId)
                .collect(Collectors.toList());

        return new CollectionDTO(collection.getId(), collection.getName(), seriesIds);
    }
}