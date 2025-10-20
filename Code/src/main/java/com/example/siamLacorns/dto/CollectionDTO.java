package com.example.siamLacorns.dto;


import java.util.List;

public class CollectionDTO {
    private Long id;
    private String name;
    private List<Long> seriesIds;

    // Конструкторы, геттеры и сеттеры
    public CollectionDTO() {}

    public CollectionDTO(Long id, String name, List<Long> seriesIds) {
        this.id = id;
        this.name = name;
        this.seriesIds = seriesIds;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<Long> getSeriesIds() { return seriesIds; }
    public void setSeriesIds(List<Long> seriesIds) { this.seriesIds = seriesIds; }
}
