import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useGameStore } from "../store/gameStore";
import { generateMission } from "../logic/gemini";
import { colors, shadows } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { Text } from "../theme/typography";
import { RootStackParamList } from "../types/navigation";
import { DinarCompanion } from "../components/DinarCompanion";

type Props = NativeStackScreenProps<RootStackParamList, "GenerateMission">;

export const GenerateMissionScreen = ({ navigation }: Props) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const addCustomMission = useGameStore((s) => s.addCustomMission);
  const startMission = useGameStore((s) => s.startMission);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const mission = await generateMission(prompt);
      if (mission) {
        addCustomMission(mission);
        startMission(mission.id);
        navigation.replace("MissionIntro");
      } else {
        setError("عذراً، لم نتمكن من إنشاء المهمة. حاول مرة أخرى.");
      }
    } catch (e) {
      console.error(e);
      setError("حدث خطأ تقني. تأكد من اتصالك بالإنترنت.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.flex}
      >
        <View style={s.header}>
          <Pressable onPress={() => navigation.goBack()} style={s.backButton}>
            <Ionicons name="close" size={28} color={colors.text} />
          </Pressable>
          <Text style={s.headerTitle}>مهمة خاصة</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <View style={s.dinarContainer}>
            <DinarCompanion 
              reaction={isGenerating ? "أنا الآن أكتب لك قصة فريدة... انتظر قليلاً يا بطل!" : "أهلاً بك! ما رأيك أن تخوض مغامرة من اختيارك؟ صف لي شخصية أو مهنة أو موقفاً وسأصنع لك مهمة تعليمية."}
              isThinking={isGenerating}
            />
          </View>

          {!isGenerating && (
            <View style={s.inputContainer}>
              <Text style={s.label}>ماذا تريد أن يكون موضوع المهمة؟</Text>
              <TextInput
                style={s.input}
                placeholder="مثال: بائع سمك في القرية، أو طبيب يفتتح عيادة..."
                placeholderTextColor={colors.textSecondary + "80"}
                value={prompt}
                onChangeText={setPrompt}
                multiline
                numberOfLines={4}
                textAlign="right"
              />
              
              {error && <Text style={s.errorText}>{error}</Text>}

              <Pressable
                onPress={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                style={({ pressed }) => [
                  s.generateButton,
                  (!prompt.trim() || isGenerating) && s.buttonDisabled,
                  pressed && s.buttonPressed,
                ]}
              >
                {isGenerating ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <>
                    <Text style={s.buttonText}>ابدأ الإنشاء الذكي</Text>
                    <Ionicons name="sparkles" size={20} color={colors.surface} />
                  </>
                )}
              </Pressable>
            </View>
          )}

          {isGenerating && (
            <View style={s.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={s.loadingText}>جاري التفكير في السيناريوهات...</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: spacing.lg,
  },
  dinarContainer: {
    marginBottom: spacing.xl,
  },
  inputContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: colors.border,
    ...shadows.clay,
  },
  label: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: "right",
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
    minHeight: 120,
    marginBottom: spacing.md,
    fontFamily: Platform.OS === "ios" ? "Tajawal-Medium" : "tajawal-medium",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    ...shadows.clayPrimary,
  },
  buttonDisabled: {
    backgroundColor: colors.border,
    shadowColor: "transparent",
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    ...shadows.clayPressed,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.surface,
  },
  loadingContainer: {
    marginTop: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: spacing.md,
  },
});
