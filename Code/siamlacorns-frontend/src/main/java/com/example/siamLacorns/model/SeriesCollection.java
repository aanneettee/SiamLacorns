package com.example.siamLacorns.model;

import jakarta.persistence.*;
import org.hibernate.LazyInitializationException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "series_collections")
public class SeriesCollection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ИСПРАВЛЕННАЯ СВЯЗЬ: многие-ко-многим с Lacorn
    @ManyToMany
    @JoinTable(
            name = "collection_lacorns",
            joinColumns = @JoinColumn(name = "collection_id"),
            inverseJoinColumns = @JoinColumn(name = "lacorn_id")
    )
    private List<Lacorn> lacorns = new ArrayList<>();

    // Конструкторы
    public SeriesCollection() {}

    public SeriesCollection(String name, User user) {
        this.name = name;
        this.user = user;
    }

    // ГЕТТЕРЫ И СЕТТЕРЫ (ДОБАВЬТЕ ЭТО)
    public Long getId() {
        return id;
    }

    // В методе getSeriesIds лучше использовать безопасный подход:
    public List<Long> getSeriesIds() {
        if (lacorns == null) {
            return new ArrayList<>();
        }
        try {
            return lacorns.stream()
                    .map(Lacorn::getId)
                    .collect(Collectors.toList());
        } catch (LazyInitializationException e) {
            return new ArrayList<>();
        }
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<Lacorn> getLacorns() {
        return lacorns;
    }

    public void setLacorns(List<Lacorn> lacorns) {
        this.lacorns = lacorns;
    }

    // Обновленные вспомогательные методы
    public void addLacorn(Lacorn lacorn) {
        if (!lacorns.contains(lacorn)) {
            lacorns.add(lacorn);
        }
    }

    public void removeLacorn(Lacorn lacorn) {
        lacorns.remove(lacorn);
    }

    public boolean containsLacorn(Lacorn lacorn) {
        return lacorns.contains(lacorn);
    }
}