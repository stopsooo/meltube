package com.stopsoo.meltube.results.user;

import com.stopsoo.meltube.results.Result;

public enum RegisterResult implements Result {
    FAILURE_DUPLICATE_CONTACT,
    FAILURE_DUPLICATE_EMAIL,
    FAILURE_DUPLICATE_NICKNAME,
}