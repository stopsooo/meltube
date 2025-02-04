package com.stopsoo.meltube.services;

import com.stopsoo.meltube.entities.MusicEntity;
import com.stopsoo.meltube.entities.PlaylistEntity;
import com.stopsoo.meltube.entities.PlaylistMusicEntity;
import com.stopsoo.meltube.entities.UserEntity;
import com.stopsoo.meltube.exceptions.TransactionalException;
import com.stopsoo.meltube.mappers.MusicMapper;
import com.stopsoo.meltube.mappers.PlaylistMapper;
import com.stopsoo.meltube.mappers.PlaylistMusicMapper;
import com.stopsoo.meltube.results.CommonResult;
import com.stopsoo.meltube.results.Result;
import com.stopsoo.meltube.vos.PlaylistVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PlaylistService {
    private final MusicMapper musicMapper;
    private final PlaylistMapper playlistMapper;
    private final PlaylistMusicMapper playlistMusicMapper;

    @Autowired
    public PlaylistService(MusicMapper musicMapper, PlaylistMapper playlistMapper, PlaylistMusicMapper playlistMusicMapper) {
        this.musicMapper = musicMapper;
        this.playlistMapper = playlistMapper;
        this.playlistMusicMapper = playlistMusicMapper;
    }

    @Transactional
    public Result addMusicsToPlaylist(UserEntity user, Integer playlistIndex, int[] musicIndexes) {
        if (user == null || user.isSuspended() || user.getDeletedAt() != null) {
            return CommonResult.FAILURE_UNSIGNED;
        }
        if (playlistIndex == null || playlistIndex < 1 || musicIndexes == null || musicIndexes.length == 0) {
            return CommonResult.FAILURE;
        }
        PlaylistEntity playlist = this.playlistMapper.selectPlaylist(playlistIndex);
        if (playlist == null || !playlist.getUserEmail().equals(user.getEmail())) {
            return CommonResult.FAILURE;
        }
        for (int musicIndex : musicIndexes) {
            MusicEntity music = this.musicMapper.selectMusicByIndex(musicIndex, false);
            if (music == null || music.isDeleted() || !music.getStatus().equals(MusicEntity.Status.ALLOWED.name())) {
                throw new TransactionalException();
            }
            PlaylistMusicEntity playlistMusic = PlaylistMusicEntity.builder()
                    .playlistIndex(playlistIndex)
                    .musicIndex(music.getIndex())
                    .createdAt(LocalDateTime.now())
                    .build();
            if (this.playlistMusicMapper.insertPlaylistMusic(playlistMusic) == 0) {
                throw new TransactionalException();
            }
        }
        return CommonResult.SUCCESS;
    }

    public Result addPlaylist(UserEntity user, String text) {
        if (user == null || user.isSuspended() || user.getDeletedAt() != null || text == null || text.isEmpty()) {
            return CommonResult.FAILURE;
        }
        PlaylistEntity playlist = PlaylistEntity.builder()
                .userEmail(user.getEmail())
                .text(text)
                .createdAt(LocalDateTime.now())
                .build();
        return this.playlistMapper.insertPlaylist(playlist) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    @Transactional
    public Result deletePlaylists(UserEntity user, Integer[] indexes) {
        if (user == null || user.isSuspended() || user.getDeletedAt() != null || indexes == null || indexes.length == 0) {
            return CommonResult.FAILURE;
        }
        for (int index : indexes) {
            PlaylistEntity playlist = this.playlistMapper.selectPlaylist(index);
            if (playlist == null || !playlist.getUserEmail().equals(user.getEmail())) {
                throw new TransactionalException();
            }
            if (this.playlistMapper.deletePlaylist(index) == 0) {
                throw new TransactionalException();
            }
        }
        return CommonResult.SUCCESS;
    }

    @Transactional
    public Result deleteMusicsFromPlaylist(UserEntity user, Integer playlistIndex, int[] musicIndexes) {
        if (user == null || user.isSuspended() || user.getDeletedAt() != null || playlistIndex == null || playlistIndex < 1 || musicIndexes == null || musicIndexes.length == 0) {
            return CommonResult.FAILURE;
        }
        PlaylistEntity playlist = this.playlistMapper.selectPlaylist(playlistIndex);
        if (playlist == null || !playlist.getUserEmail().equals(user.getEmail())) {
            return CommonResult.FAILURE;
        }
        for (int musicIndex : musicIndexes) {
            PlaylistMusicEntity playlistMusic = this.playlistMusicMapper.selectPlaylistMusicByPlaylistIndexAndMusicIndex(playlistIndex, musicIndex);
            if (playlistMusic == null) {
                throw new TransactionalException();
            }
            if (this.playlistMusicMapper.deletePlaylistMusic(playlistMusic.getIndex()) == 0) {
                throw new TransactionalException();
            }
        }
        return CommonResult.SUCCESS;
    }

    public MusicEntity[] getMusics(UserEntity user, Integer index) {
        if (user == null || user.isSuspended() || user.getDeletedAt() != null || index == null || index < 1) {
            return null;
        }
        PlaylistEntity playlist = this.playlistMapper.selectPlaylist(index);
        if (playlist == null || !playlist.getUserEmail().equals(user.getEmail())) {
            return null;
        }
        return this.playlistMapper.selectMusicsByPlaylistIndex(index);
    }

    public PlaylistVo[] getPlaylists(UserEntity user) {
        if (user == null || user.isSuspended() || user.getDeletedAt() != null) {
            return null;
        }
        return this.playlistMapper.selectPlaylistVosByUserEmail(user.getEmail());
    }

    public Result modifyPlaylist(UserEntity user, Integer index, String text) {
        if (user == null || user.isSuspended() || user.getDeletedAt() != null || index == null || index < 1 || text == null || text.isEmpty()) {
            return CommonResult.FAILURE;
        }
        PlaylistEntity playlist = this.playlistMapper.selectPlaylist(index);
        if (playlist == null || !playlist.getUserEmail().equals(user.getEmail())) {
            return CommonResult.FAILURE;
        }
        playlist.setText(text);
        return this.playlistMapper.updatePlaylist(playlist) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}
