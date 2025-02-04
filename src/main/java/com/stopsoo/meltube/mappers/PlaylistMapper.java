package com.stopsoo.meltube.mappers;

import com.stopsoo.meltube.entities.MusicEntity;
import com.stopsoo.meltube.entities.PlaylistEntity;
import com.stopsoo.meltube.vos.PlaylistVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PlaylistMapper {
    int deletePlaylist(@Param("index") int index);

    int insertPlaylist(PlaylistEntity playlist);

    MusicEntity[] selectMusicsByPlaylistIndex(@Param("playlistIndex") int playlistIndex);

    PlaylistEntity selectPlaylist(@Param("index") int index);

    PlaylistVo[] selectPlaylistVosByUserEmail(@Param("userEmail") String userEmail);

    int updatePlaylist(PlaylistEntity playlist);
}