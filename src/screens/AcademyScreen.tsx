import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { academyLessons, Lesson } from "../data/academy";
import { useGameStore } from "../store/gameStore";
import { colors, shadows } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { Text } from "../theme/typography";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../types/navigation";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Academy">,
  NativeStackScreenProps<RootStackParamList>
>;

export const AcademyScreen = ({ navigation }: Props) => {
  const completedLessonIds = useGameStore((s) => s.completedLessonIds);

  const renderLesson = ({ item }: { item: Lesson }) => {
    const isCompleted = completedLessonIds.includes(item.id);

    return (
      <Pressable
        onPress={() => navigation.navigate("Lesson", { lessonId: item.id })}
        style={({ pressed }) => [
          s.lessonCard,
          pressed && s.cardPressed,
          isCompleted && s.lessonCardCompleted,
        ]}
      >
        <View style={s.iconContainer}>
          <Ionicons name={item.icon as any} size={32} color={colors.primary} />
          {isCompleted && (
            <View style={s.completedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            </View>
          )}
        </View>
        <View style={s.lessonInfo}>
          <Text style={s.lessonCategory}>{item.category}</Text>
          <Text style={s.lessonTitle}>{item.title}</Text>
          <Text style={s.lessonSummary}>
            {item.slides.length} مراحل تعليمية
          </Text>
        </View>
        <View style={s.xpBadge}>
          <Text style={s.xpText}>+{item.xpReward} XP</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>أكاديمية درهمي</Text>
        <Text style={s.headerSubtitle}>تعلم أسس المال في الإسلام</Text>
      </View>

      <FlatList
        data={academyLessons}
        renderItem={renderLesson}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
    ...shadows.clay,
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  lessonCard: {
    flexDirection: "row-reverse",
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: "center",
    ...shadows.clay,
  },
  lessonCardCompleted: {
    borderColor: colors.success + "40",
    backgroundColor: colors.successLight + "20",
  },
  cardPressed: {
    ...shadows.clayPressed,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primaryDim,
  },
  completedBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
  },
  lessonInfo: {
    flex: 1,
    marginRight: spacing.md,
    alignItems: "flex-end",
  },
  lessonCategory: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 4,
  },
  lessonSummary: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "right",
    lineHeight: 18,
  },
  xpBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.warningDim,
  },
  xpText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.warning,
  },
});
