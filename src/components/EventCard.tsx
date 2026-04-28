import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "../logic/format";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { Choice, SimulationEvent } from "../types/simulation";
import { Text } from "../theme/typography";

type Props = {
  event: SimulationEvent;
  onChoose: (choice: Choice) => void;
};

// Get contextual icon and color for the event
const getEventStyle = (event: SimulationEvent) => {
  switch (event.type) {
    case "fixed_expense":
      return {
        icon: "receipt",
        color: colors.primary,
        dimColor: colors.primaryDim,
        glow: shadows.glowCyan,
        label: "مصاريف ثابتة",
      };
    case "optional_spending":
      if (event.category === "wants") {
        return {
          icon: "gift",
          color: colors.warning,
          dimColor: colors.warningDim,
          glow: shadows.glowAmber,
          label: "كماليات",
        };
      }
      return {
        icon: "cart",
        color: colors.primary,
        dimColor: colors.primaryDim,
        glow: shadows.glowCyan,
        label: "تسوق",
      };
    case "emergency":
      return {
        icon: "warning",
        color: colors.danger,
        dimColor: colors.dangerDim,
        glow: shadows.glowPink,
        label: "طارئ",
      };
    case "opportunity":
      return {
        icon: "trending-up",
        color: colors.success,
        dimColor: colors.successDim,
        glow: shadows.glowGreen,
        label: "فرصة",
      };
    case "ethical":
      return {
        icon: "heart",
        color: colors.purple,
        dimColor: colors.purpleDim,
        glow: {} as any,
        label: "قرار أخلاقي",
      };
    default:
      return {
        icon: "ellipse",
        color: colors.primary,
        dimColor: colors.primaryDim,
        glow: shadows.glowCyan,
        label: "",
      };
  }
};

// Get ethical choice styling
const getEthicalStyle = (ethicalTag?: string) => {
  switch (ethicalTag) {
    case "non_halal":
      return {
        borderColor: colors.danger,
        glow: shadows.glowPink,
        icon: "close-circle",
      };
    case "charity":
      return {
        borderColor: colors.success,
        glow: shadows.glowGreen,
        icon: "heart",
      };
    case "halal":
      return {
        borderColor: colors.primary,
        glow: shadows.glowCyan,
        icon: "checkmark-circle",
      };
    default:
      return null;
  }
};

// Choice button with neon effects
const ChoiceButton = ({
  choice,
  onPress,
  index,
}: {
  choice: Choice;
  onPress: () => void;
  index: number;
}) => {
  const isPrimary = index === 0;
  const ethicalStyle = getEthicalStyle(choice.ethicalTag);

  // Format consequence preview - only show balance, health is a surprise
  const getConsequencePreview = () => {
    if (choice.balanceEffect === 0) return "";
    const sign = choice.balanceEffect > 0 ? "+" : "";
    return `${sign}${formatCurrency(choice.balanceEffect)}`;
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceButton,
        isPrimary ? styles.choicePrimary : styles.choiceSecondary,
        ethicalStyle && {
          borderLeftWidth: 4,
          borderLeftColor: ethicalStyle.borderColor,
        },
        pressed && styles.choicePressed,
        pressed && ethicalStyle && ethicalStyle.glow,
      ]}
    >
      <View style={styles.choiceContent}>
        <Text
          style={[
            styles.choiceText,
            isPrimary
              ? styles.choiceTextPrimary
              : styles.choiceTextSecondary,
          ]}
        >
          {choice.label}
        </Text>
        <Text
          style={[
            styles.choiceConsequence,
            isPrimary && { color: "rgba(255,255,255,0.7)" },
          ]}
        >
          {getConsequencePreview()}
        </Text>
      </View>

      {ethicalStyle && (
        <View
          style={[
            styles.ethicalIndicator,
            { backgroundColor: ethicalStyle.borderColor + "30" },
          ]}
        >
          <Ionicons
            name={ethicalStyle.icon as any}
            size={18}
            color={ethicalStyle.borderColor}
          />
        </View>
      )}
    </Pressable>
  );
};

export const EventCard: React.FC<Props> = ({ event, onChoose }) => {
  const style = getEventStyle(event);

  return (
    <View style={[styles.card, { borderTopColor: style.color }]}>
      {/* Event Type Badge */}
      <View style={[styles.typeBadge, { backgroundColor: style.dimColor }]}>
        <Ionicons name={style.icon as any} size={14} color={style.color} />
        <Text style={[styles.typeText, { color: style.color }]}>
          {style.label}
        </Text>
      </View>

      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: style.dimColor },
          style.glow,
        ]}
      >
        <Ionicons name={style.icon as any} size={40} color={style.color} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{event.title}</Text>

      {/* Description */}
      <Text style={styles.description}>{event.description}</Text>

      {/* Amount if relevant */}
      {typeof event.amount === "number" && event.amount !== 0 && (
        <View style={styles.amountRow}>
          <Ionicons
            name={event.amount > 0 ? "add-circle" : "remove-circle"}
            size={24}
            color={event.amount > 0 ? colors.success : colors.danger}
          />
          <Text
            style={[
              styles.amount,
              { color: event.amount > 0 ? colors.success : colors.danger },
            ]}
          >
            {formatCurrency(Math.abs(event.amount))}
          </Text>
        </View>
      )}

      {/* Choices */}
      <View style={styles.choicesContainer}>
        {event.choices.map((choice, index) => (
          <ChoiceButton
            key={choice.id}
            choice={choice}
            onPress={() => onChoose(choice)}
            index={index}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderTopWidth: 4,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    textAlign: "right",
    marginBottom: spacing.sm,
    lineHeight: 32,
  },
  description: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: "right",
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  amountRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  amount: {
    fontSize: 28,
    fontWeight: "900",
  },
  choicesContainer: {
    gap: spacing.sm,
  },
  choiceButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 14,
  },
  choicePrimary: {
    backgroundColor: colors.primary,
    ...shadows.glowCyan,
  },
  choiceSecondary: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
  },
  choicePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  choiceContent: {
    flex: 1,
  },
  choiceText: {
    fontSize: 17,
    fontWeight: "700",
  },
  choiceTextPrimary: {
    color: colors.textInverse,
  },
  choiceTextSecondary: {
    color: colors.text,
  },
  choiceConsequence: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
    color: colors.textSecondary,
  },
  ethicalIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.sm,
  },
});
