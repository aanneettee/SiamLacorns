package com.example.siamLacorns.service;

import com.example.siamLacorns.dto.CollectionDTO;
import com.example.siamLacorns.dto.UserDTO;
import com.example.siamLacorns.exception.ResourceNotFoundException;
import com.example.siamLacorns.exception.ValidationException;
import com.example.siamLacorns.model.Lacorn;
import com.example.siamLacorns.model.SeriesCollection;
import com.example.siamLacorns.model.User;
import com.example.siamLacorns.repository.LacornRepository;
import com.example.siamLacorns.repository.SeriesCollectionRepository;
import com.example.siamLacorns.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private LacornRepository lacornRepository;
    @Autowired
    private SeriesCollectionRepository collectionRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    private static final String[] DEFAULT_COLLECTIONS = {
            "Favourites",
            "Watch later",
            "Started",
            "Forsaken"
    };

    // UserService.java - добавьте этот метод
    public UserDTO getUserByUsername(String username) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Конвертируем User в UserDTO с ВСЕМИ полями
            UserDTO userDTO = new UserDTO();
            userDTO.setId(user.getId());
            userDTO.setUsername(user.getUsername());
            userDTO.setEmail(user.getEmail());
            userDTO.setRole(user.getRole());
            userDTO.setBirthDate(user.getBirthDate()); // ✅ ДОБАВЛЕНО
            userDTO.setAvatar(user.getAvatar()); // ✅ ДОБАВЛЕНО

            return userDTO;

        } catch (Exception e) {
            throw e;
        }
    }

    @Transactional
    public UserDTO getUserByUsernameWithCollections(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден: " + username));

        // Принудительно загружаем коллекции если они LAZY
        if (user.getCollections() != null) {
            user.getCollections().size(); // Это загрузит коллекции
        }

        return convertToDTO(user);
    }

    @Transactional
    public void updateAvatar(String username, String avatarUrl) {
        User user = userRepository.findByUsername(username).get();
        if (user == null) {
            throw new RuntimeException("Пользователь не найден");
        }
        user.setAvatar(avatarUrl);
        userRepository.save(user);
    }


    // Создание пользователя с валидацией
    @Transactional
    public User createUser(User user) {
        if (user == null) {
            throw new ValidationException("Данные пользователя не могут быть пустыми");
        }

        // ✅ Валидация username
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            throw new ValidationException("Имя пользователя не может быть пустым");
        }

        // ✅ Валидация email
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new ValidationException("Email не может быть пустым");
        }

        // ✅ Валидация пароля
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new ValidationException("Пароль не может быть пустым");
        }

        // ✅ Валидация даты рождения
        if (user.getBirthDate() == null) {
            throw new ValidationException("Дата рождения не может быть пустой");
        }

        // ✅ Проверяем уникальность username
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new ValidationException("Пользователь с именем '" + user.getUsername() + "' уже существует");
        }

        // ✅ Проверяем уникальность email
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ValidationException("Пользователь с email '" + user.getEmail() + "' уже существует");
        }

        // ✅ Проверяем, что дата рождения не в будущем
        if (user.getBirthDate().isAfter(LocalDate.now())) {
            throw new ValidationException("Дата рождения не может быть в будущем");
        }

        // ✅ Хэшируем пароль
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // ✅ Проверяем, является ли пользователь администратором
        if (isAdminUser(user)) {
            user.setRole("ADMIN");
        } else {
            user.setRole("USER");
        }

        User savedUser = userRepository.save(user);

        // ✅ Создаем базовые коллекции для пользователя
        createDefaultCollections(savedUser);

        return userRepository.findByIdWithCollections(savedUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден после создания"));
    }

    // ✅ Проверка администратора
    private boolean isAdminUser(User user) {
        return "admin".equalsIgnoreCase(user.getUsername());
    }

    // ✅ Метод для парсинга даты из строки "12.09.2006"
    public LocalDate parseBirthDate(String birthDateString) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
            return LocalDate.parse(birthDateString, formatter);
        } catch (DateTimeParseException e) {
            throw new ValidationException("Неверный формат даты. Используйте формат: дд.мм.гггг (например: 12.09.2006)");
        }
    }

    private void createDefaultCollections(User user) {
        for (String collectionName : DEFAULT_COLLECTIONS) {
            SeriesCollection collection = new SeriesCollection(collectionName, user);
            collectionRepository.save(collection);
        }
    }

    // Получение пользователя по ID
    public UserDTO getUserById(Long id) {
        User user = userRepository.findByIdWithCollections(id)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден с ID: " + id));
        return convertToDTO(user);
    }

    // Получение всех пользователей
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Обновление пользователя
    @Transactional
    public UserDTO updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден с ID: " + id));

        // ✅ Проверяем уникальность username при обновлении
        if (!user.getUsername().equals(userDetails.getUsername()) &&
                userRepository.existsByUsername(userDetails.getUsername())) {
            throw new ValidationException("Пользователь с именем '" + userDetails.getUsername() + "' уже существует");
        }

        // ✅ Проверяем уникальность email при обновлении
        if (!user.getEmail().equals(userDetails.getEmail()) &&
                userRepository.existsByEmail(userDetails.getEmail())) {
            throw new ValidationException("Пользователь с email '" + userDetails.getEmail() + "' уже существует");
        }

        user.setUsername(userDetails.getUsername());
        user.setBirthDate(userDetails.getBirthDate());
        user.setEmail(userDetails.getEmail());

        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        // Обновляем роль, если предоставлены административные данные
        if (isAdminUser(userDetails)) {
            user.setRole("ADMIN");
        }

        return convertToDTO(userRepository.save(user));
    }

    // Удаление пользователя
    @Transactional
    public boolean deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден с ID: " + id));

        userRepository.delete(user);
        return true;
    }

    // Добавление сериала в коллекцию
    @Transactional
    public boolean addLacornToCollection(Long userId, String collectionName, Long lacornId) {
        if (collectionName == null || collectionName.trim().isEmpty()) {
            throw new ValidationException("Название коллекции не может быть пустым");
        }

        if (!isDefaultCollection(collectionName)) {
            throw new ValidationException("Коллекция " + collectionName + " не существует или недоступна");
        }

        SeriesCollection collection = collectionRepository
                .findByUserIdAndName(userId, collectionName)
                .orElseThrow(() -> new ResourceNotFoundException("Коллекция не найдена: " + collectionName));

        Lacorn lacorn = lacornRepository.findById(lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Сериал не найден с ID: " + lacornId));

        collection.addLacorn(lacorn);
        collectionRepository.save(collection);
        return true;
    }

    // Удаление сериала из коллекции
    @Transactional
    public boolean removeLacornFromCollection(Long userId, String collectionName, Long lacornId) {
        if (collectionName == null || collectionName.trim().isEmpty()) {
            throw new ValidationException("Название коллекции не может быть пустым");
        }

        if (!isDefaultCollection(collectionName)) {
            throw new ValidationException("Коллекция " + collectionName + " не существует или недоступна");
        }

        SeriesCollection collection = collectionRepository
                .findByUserIdAndName(userId, collectionName)
                .orElseThrow(() -> new ResourceNotFoundException("Коллекция не найдена: " + collectionName));

        Lacorn lacorn = lacornRepository.findById(lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Сериал не найден с ID: " + lacornId));

        collection.removeLacorn(lacorn);
        collectionRepository.save(collection);
        return true;
    }

    // Проверка, является ли коллекция базовой
    private boolean isDefaultCollection(String collectionName) {
        for (String defaultCollection : DEFAULT_COLLECTIONS) {
            if (defaultCollection.equalsIgnoreCase(collectionName)) {
                return true;
            }
        }
        return false;
    }

    // Получение базовых коллекций пользователя
    public List<SeriesCollection> getUserCollections(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден с ID: " + userId));

        return collectionRepository.findByUserId(userId).stream()
                .filter(collection -> isDefaultCollection(collection.getName()))
                .collect(Collectors.toList());
    }

    // Конвертация Entity в DTO
    private UserDTO convertToDTO(User user) {
        UserDTO userDTO = new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );
        userDTO.setBirthDate(user.getBirthDate()); // ✅ ДОБАВЛЕНО
        userDTO.setAvatar(user.getAvatar()); // ✅ ДОБАВЛЕНО

        if (user.getCollections() != null && !user.getCollections().isEmpty()) {
            List<CollectionDTO> collectionDTOs = user.getCollections().stream()
                    .filter(collection -> isDefaultCollection(collection.getName()))
                    .map(collection -> new CollectionDTO(
                            collection.getId(),
                            collection.getName(),
                            new ArrayList<>() // ← пустой список вместо вызова getSeriesIds()
                    ))
                    .collect(Collectors.toList());userDTO.setCollections(collectionDTOs);
        }

        return userDTO;
    }

    // Проверка прав администратора
    public boolean isAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден с ID: " + userId));
        return "ADMIN".equals(user.getRole());
    }
}