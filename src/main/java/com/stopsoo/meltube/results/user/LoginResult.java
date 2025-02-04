package com.stopsoo.meltube.results.user;

import com.stopsoo.meltube.results.Result;

public enum LoginResult implements Result {
    FAILURE_NOT_VERIFIED,
    FAILURE_SUSPENDED
}