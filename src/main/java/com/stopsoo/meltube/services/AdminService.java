package com.stopsoo.meltube.services;

import com.stopsoo.meltube.entities.MusicEntity;
import com.stopsoo.meltube.exceptions.TransactionalException;
import com.stopsoo.meltube.mappers.MusicMapper;
import com.stopsoo.meltube.results.CommonResult;
import com.stopsoo.meltube.results.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {
    private final MusicMapper musicMapper;

    @Autowired
    public AdminService(MusicMapper musicMapper) {
        this.musicMapper = musicMapper;
    }

    //region Music
    @Transactional
    public Result deleteMusics(int[] indexes) {
        if (indexes == null || indexes.length == 0) {
            return CommonResult.FAILURE;
        }
        for (int index : indexes) {
            MusicEntity music = this.musicMapper.selectMusicByIndex(index, false);
            if (music == null || music.isDeleted()) {
                throw new TransactionalException();
            }
            music.setDeleted(true);
            if (this.musicMapper.updateMusic(music, false) == 0) {
                throw new TransactionalException();
            }
        }
        return CommonResult.SUCCESS;
    }

    public MusicEntity[] getMusics() {
        return this.musicMapper.selectMusics(false);
    }

    @Transactional
    public Result modifyMusicStatuses(Boolean status, int[] indexes) {
        if (status == null || indexes == null || indexes.length == 0) {
            return CommonResult.FAILURE;
        }
        for (int index : indexes) {
            MusicEntity music = this.musicMapper.selectMusicByIndex(index, false);
            if (music == null || music.isDeleted() || !music.getStatus().equals(MusicEntity.Status.PENDING.name())) {
                throw new TransactionalException();
            }
            music.setStatus(status ? MusicEntity.Status.ALLOWED.name() : MusicEntity.Status.DENIED.name());
            if (this.musicMapper.updateMusic(music, false) == 0) {
                throw new TransactionalException();
            }
        }
        return CommonResult.SUCCESS;
    }
    //endregion
}