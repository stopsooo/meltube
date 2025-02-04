package com.stopsoo.meltube.mappers;

import com.stopsoo.meltube.entities.PlaylistMusicEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PlaylistMusicMapper {
    int deletePlaylistMusic(@Param("index") int index);

    int insertPlaylistMusic(PlaylistMusicEntity playlistMusic);

    PlaylistMusicEntity selectPlaylistMusicByPlaylistIndexAndMusicIndex(@Param("playlistIndex") int playlistIndex,
                                                                        @Param("musicIndex") int musicIndex);
}