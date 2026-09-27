package com.codecraft.common.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.function.Predicate;

/**
 * URL-safe slug generation with uniqueness suffixing.
 */
public final class SlugUtil {

    private SlugUtil() {
    }

    public static String slugify(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
        String slug = normalized.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        return slug.isEmpty() ? "item" : slug;
    }

    /**
     * Returns {@code base} if unused, otherwise {@code base-2}, {@code base-3}, ... using the supplied existence check.
     */
    public static String unique(String base, int maxLength, Predicate<String> exists) {
        String trimmed = base.length() > maxLength ? base.substring(0, maxLength) : base;
        if (!exists.test(trimmed)) return trimmed;
        for (int i = 2; i < 10_000; i++) {
            String suffix = "-" + i;
            String candidate = (trimmed.length() + suffix.length() > maxLength
                    ? trimmed.substring(0, maxLength - suffix.length())
                    : trimmed) + suffix;
            if (!exists.test(candidate)) return candidate;
        }
        return trimmed + "-" + System.currentTimeMillis();
    }
}
