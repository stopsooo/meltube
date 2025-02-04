package com.stopsoo.meltube.entities;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@EqualsAndHashCode(of = "index")
@AllArgsConstructor
@NoArgsConstructor
public class PlaylistMusicEntity {
    private int index;
    private int playlistIndex;
    private int musicIndex;
    private LocalDateTime createdAt;
}
