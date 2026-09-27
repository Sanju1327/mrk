package com.codecraft.common.util;

import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Extracts the 11-character video id from the common YouTube URL shapes:
 * watch?v=, youtu.be/, /embed/, /shorts/, /live/, /v/.
 */
public final class YouTubeUrlParser {

    private static final Pattern VIDEO_ID = Pattern.compile("^[A-Za-z0-9_-]{11}$");
    private static final Pattern URL_PATTERN = Pattern.compile(
            "^(?:https?://)?(?:www\\.|m\\.|music\\.)?(?:youtube\\.com|youtube-nocookie\\.com|youtu\\.be)/"
                    + "(?:watch\\?(?:.*&)?v=|embed/|shorts/|live/|v/)?([A-Za-z0-9_-]{11})(?:[?&#/].*)?$",
            Pattern.CASE_INSENSITIVE
    );

    private YouTubeUrlParser() {
    }

    public static Optional<String> extractVideoId(String input) {
        if (input == null) {
            return Optional.empty();
        }
        String value = input.trim();
        if (value.isEmpty()) {
            return Optional.empty();
        }
        if (VIDEO_ID.matcher(value).matches()) {
            return Optional.of(value);
        }
        Matcher matcher = URL_PATTERN.matcher(value);
        if (matcher.matches()) {
            return Optional.ofNullable(matcher.group(1));
        }
        return Optional.empty();
    }

    public static String canonicalWatchUrl(String videoId) {
        return "https://www.youtube.com/watch?v=" + videoId;
    }
}
