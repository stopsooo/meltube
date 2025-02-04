package com.stopsoo.meltube.vos;

import com.stopsoo.meltube.results.Result;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class ResultVo<TResult extends Result, TPayload> {
    private TResult result;
    private TPayload payload;
}