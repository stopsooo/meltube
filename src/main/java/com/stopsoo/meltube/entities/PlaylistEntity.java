package com.stopsoo.meltube.entities;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@EqualsAndHashCode(of = "index")
@AllArgsConstructor
@NoArgsConstructor
public class PlaylistEntity {
    private int index;
    private String userEmail;
    private String text;
    private LocalDateTime createdAt;
}