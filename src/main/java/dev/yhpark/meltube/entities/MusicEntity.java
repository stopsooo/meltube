package com.stopsoo.meltube.entities;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@EqualsAndHashCode(of = {"index"})
public class MusicEntity {
    public enum Status {
        ALLOWED,
        DENIED,
        PENDING,
    }

    private int index;
    private String userEmail;
    private String artist;
    private String album;
    private LocalDate releaseDate;
    private String genre;
    private String name;
    private String lyrics;
    private byte[] coverData;
    private String coverContentType;
    private String coverFileName;
    private String youtubeId;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isDeleted;
}