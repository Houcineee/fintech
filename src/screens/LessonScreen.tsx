import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { academyLessons, LessonSlide } from "../data/academy";
import { useGameStore } from "../store/gameStore";
import { generateAcademyImage } from "../logic/cloudflare";
import { colors, shadows } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { Text } from "../theme/typography";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

const { width } = Dimensions.get("window");

type Props = NativeStackScreenProps<RootStackParamList, "Lesson">;

const BoldableText = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <Text style={s.slideText}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={i} style={s.boldText}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};

const SlideItem = ({ 
  item, 
  isActive 
}: { 
  item: LessonSlide, 
  isActive: boolean 
}) => {
  const [imgUri, setImgUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isActive && !imgUri) {
      const loadImage = async () => {
        setIsLoading(true);
        const uri = await generateAcademyImage(item.imagePrompt);
        setImgUri(uri);
        setIsLoading(false);
      };
      loadImage();
    }
  }, [isActive]);

  return (
    <View style={s.slide}>
      <View style={s.imageContainer}>
        {isLoading ? (
          <View style={s.imagePlaceholder}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={s.loadingText}>يرسم درهمي الحكمة...</Text>
          </View>
        ) : (
          <Image 
            source={{ uri: imgUri || "" }} 
            style={s.slideImage} 
            resizeMode="cover" 
          />
        )}
        {item.keyConcept && (
          <View style={s.conceptBadge}>
            <Text style={s.conceptText}>{item.keyConcept}</Text>
          </View>
        )}
      </View>

      <View style={s.textCard}>
        <BoldableText text={item.text} />
      </View>
    </View>
  );
};

export const LessonScreen = ({ route, navigation }: Props) => {
  const { lessonId } = route.params;
  const lesson = academyLessons.find((l) => l.id === lessonId);
  const completeLesson = useGameStore((s) => s.completeLesson);
  const completedLessonIds = useGameStore((s) => s.completedLessonIds);

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  if (!lesson) return null;

  const isCompleted = completedLessonIds.includes(lesson.id);
  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === lesson.slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      completeLesson(lesson.id, lesson.xpReward);
      navigation.goBack();
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex(activeIndex + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstSlide) {
      flatListRef.current?.scrollToIndex({ index: activeIndex - 1 });
      setActiveIndex(activeIndex - 1);
    }
  };

  const renderSlide = ({ item, index }: { item: LessonSlide, index: number }) => {
    return <SlideItem item={item} isActive={index === activeIndex} />;
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      {/* Top Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
        <View style={s.progressContainer}>
          {lesson.slides.map((_, i) => (
            <View
              key={i}
              style={[
                s.progressBar,
                { flex: 1 },
                i <= activeIndex ? s.progressActive : s.progressInactive,
              ]}
            />
          ))}
        </View>
        <Text style={s.headerTitle}>{lesson.title}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={lesson.slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        keyExtractor={(_, i) => i.toString()}
      />

      {/* Footer Buttons */}
      <View style={s.footer}>
        {!isFirstSlide ? (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              s.navButton,
              s.backButtonSecondary,
              pressed && s.buttonPressed,
            ]}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
            <Text style={s.backButtonText}>السابق</Text>
          </Pressable>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            s.navButton,
            s.nextButton,
            pressed && s.buttonPressed,
            isLastSlide && s.finishButton,
          ]}
        >
          <Text style={s.nextButtonText}>
            {isLastSlide ? "تم استيعاب الدرس!" : "التالي"}
          </Text>
          <Ionicons
            name={isLastSlide ? "checkmark-circle" : "arrow-forward"}
            size={24}
            color={colors.surface}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
  },
  progressContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    gap: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: radius.full,
  },
  progressActive: {
    backgroundColor: colors.primary,
  },
  progressInactive: {
    backgroundColor: colors.border,
  },
  slide: {
    width: width,
    padding: spacing.lg,
    justifyContent: "center",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: colors.surface,
    ...shadows.clayLarge,
    marginBottom: spacing.xl,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.surfaceRaised,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  slideImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.surfaceRaised,
  },
  conceptBadge: {
    position: "absolute",
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  conceptText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "900",
  },
  textCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: colors.border,
    ...shadows.clay,
  },
  slideText: {
    fontSize: 20,
    lineHeight: 32,
    color: colors.text,
    textAlign: "right",
    fontWeight: "700",
  },
  boldText: {
    color: colors.primary,
    fontWeight: "900",
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    flexDirection: "row",
    gap: spacing.md,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
  },
  nextButton: {
    flex: 2,
    backgroundColor: colors.primary,
    ...shadows.clayPrimary,
  },
  backButtonSecondary: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.border,
    ...shadows.clay,
  },
  finishButton: {
    backgroundColor: colors.success,
    ...shadows.claySuccess,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    ...shadows.clayPressed,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.surface,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.primary,
  },
});
