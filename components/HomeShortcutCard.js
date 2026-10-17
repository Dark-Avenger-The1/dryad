import React from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, FONTS, RADIUS, SIZES, SPACING } from "../constant/constant";

/**
 * Large tappable card on the Home screen that opens another screen.
 * `count` shows as a badge when it is above zero. `backgroundImage` fills the
 * card under a green tint. `style` lets the parent size it, e.g. { flex: 1 }.
 */
export default function HomeShortcutCard({
  icon,
  title,
  subtitle,
  count = 0,
  actionLabel = "Open",
  backgroundImage,
  onPress,
  style,
}) {
  const onImage = Boolean(backgroundImage);

  const content = (
    <View style={[styles.content, onImage && styles.tint]}>
      <View style={styles.top}>
        <View style={[styles.iconCircle, onImage && styles.iconCircleOnImage]}>
          <Ionicons
            name={icon}
            size={34}
            color={onImage ? COLORS.white : COLORS.primary}
          />
        </View>

        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
          </View>
        )}
      </View>

      <View>
        <Text style={[styles.title, onImage && styles.titleOnImage]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, onImage && styles.subtitleOnImage]}>
            {subtitle}
          </Text>
        ) : null}

        <View style={[styles.actionRow, onImage && styles.actionRowOnImage]}>
          <Text style={[styles.actionText, onImage && styles.actionTextOnImage]}>
            {actionLabel}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={onImage ? COLORS.white : COLORS.cta}
          />
        </View>
      </View>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        onImage && styles.cardOnImage,
        style,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
    >
      {onImage ? (
        <ImageBackground
          source={backgroundImage}
          resizeMode="cover"
          style={styles.surface}
          imageStyle={styles.surfaceImage}
        >
          {content}
        </ImageBackground>
      ) : (
        <View style={styles.surface}>{content}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Holds the shadow only. Clipping happens in `surface`, otherwise iOS
  // would cut the shadow off.
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,

    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  cardOnImage: {
    backgroundColor: COLORS.primary,
  },

  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  surface: {
    flexGrow: 1,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },

  surfaceImage: {
    borderRadius: RADIUS.lg,
  },

  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    padding: SPACING.xl,
  },

  // App green over the painting: dims it, ties it to the theme and keeps
  // white text readable
  tint: {
    backgroundColor: "rgba(31, 64, 43, 0.62)",
  },

  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.lg,
  },

  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.imagePlaceholder,
    alignItems: "center",
    justifyContent: "center",
  },

  iconCircleOnImage: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
  },

  badge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.cta,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    fontFamily: FONTS.bodyBold,
    fontSize: SIZES.body,
    color: COLORS.white,
  },

  title: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h2,
    color: COLORS.primary,
  },

  titleOnImage: {
    color: COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  subtitle: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  subtitleOnImage: {
    color: COLORS.background,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },

  actionRowOnImage: {
    backgroundColor: COLORS.cta,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },

  actionText: {
    fontFamily: FONTS.bodyBold,
    fontSize: SIZES.body,
    color: COLORS.cta,
  },

  actionTextOnImage: {
    color: COLORS.white,
  },
});
