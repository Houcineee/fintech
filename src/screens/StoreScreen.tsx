import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { Text } from "../theme/typography";
import { useGameStore } from "../store/gameStore";
import { useChoiceSounds } from "../hooks/useChoiceSounds";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - spacing.lg * 3) / 2;

// XP to USD: 1000 XP = $1
const XP_PER_USD = 1000;

interface Toy {
  id: string;
  title: string;
  priceUSD: number;
  image: string;
  category: string;
}

const TOYS: Toy[] = [
  {
    id: "1",
    title: "مجموعة ليغو كلاسيك",
    priceUSD: 15,
    image: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=500&auto=format&fit=crop",
    category: "بناء",
  },
  {
    id: "2",
    title: "سيارة تحكم عن بعد",
    priceUSD: 25,
    image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=500&auto=format&fit=crop",
    category: "ألعاب",
  },
  {
    id: "3",
    title: "مجموعة الرسم الاحترافية",
    priceUSD: 12,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=500&auto=format&fit=crop",
    category: "إبداع",
  },
  {
    id: "4",
    title: "دمية دب كبيرة",
    priceUSD: 20,
    image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?q=80&w=500&auto=format&fit=crop",
    category: "دمى",
  },
  {
    id: "5",
    title: "لعبة أونو الأصلية",
    priceUSD: 8,
    image: "https://images.unsplash.com/photo-1623931234016-3ce81335970c?q=80&w=500&auto=format&fit=crop",
    category: "ورق",
  },
  {
    id: "6",
    title: "مجسم بطل خارق",
    priceUSD: 10,
    image: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?q=80&w=500&auto=format&fit=crop",
    category: "مجسمات",
  },
];

const ToyCard = ({ toy, onBuy }: { toy: Toy; onBuy: (toy: Toy) => void }) => {
  const xpCost = toy.priceUSD * XP_PER_USD;
  
  return (
    <View style={s.card}>
      <View style={s.imageContainer}>
        <Image source={{ uri: toy.image }} style={s.image} />
        <View style={s.categoryBadge}>
          <Text style={s.categoryText}>{toy.category}</Text>
        </View>
      </View>
      
      <View style={s.cardContent}>
        <Text style={s.toyTitle} numberOfLines={1}>{toy.title}</Text>
        <View style={s.priceRow}>
          <Text style={s.priceUSD}>${toy.priceUSD}</Text>
          <View style={s.xpCostContainer}>
            <Text style={s.xpCostText}>{xpCost.toLocaleString()}</Text>
            <Text style={s.xpCostUnit}>XP</Text>
          </View>
        </View>
        
        <Pressable 
          onPress={() => onBuy(toy)}
          style={({ pressed }) => [
            s.buyButton,
            pressed && s.buyButtonPressed
          ]}
        >
          <Text style={s.buyButtonText}>شراء الآن</Text>
          <Ionicons name="cart" size={16} color={colors.surface} />
        </Pressable>
      </View>
    </View>
  );
};

export const StoreScreen = () => {
  const totalXP = useGameStore((s) => s.totalXP);
  const spendXP = useGameStore((s) => s.spendXP);
  const { playClick } = useChoiceSounds();

  const [insufficientXPInfo, setInsufficientXPInfo] = useState<{
    show: boolean;
    missing: number;
    toyTitle: string;
  }>({ show: false, missing: 0, toyTitle: "" });

  const handleBuy = (toy: Toy) => {
    const xpCost = toy.priceUSD * XP_PER_USD;
    playClick();

    if (totalXP < xpCost) {
      setInsufficientXPInfo({
        show: true,
        missing: xpCost - totalXP,
        toyTitle: toy.title,
      });
      return;
    }

    Alert.alert(
      "تأكيد الشراء",
      `هل أنت متأكد من رغبتك في شراء ${toy.title} مقابل ${xpCost.toLocaleString()} XP؟`,
      [
        { text: "إلغاء", style: "cancel" },
        { 
          text: "شراء", 
          onPress: () => {
            const success = spendXP(xpCost);
            if (success) {
              Alert.alert("مبروك!", "لقد قمت بشراء اللعبة بنجاح! سيتم التواصل مع والديك لتأكيد الطلب.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      {/* Insufficient XP Modal */}
      <Modal
        visible={insufficientXPInfo.show}
        transparent
        animationType="fade"
        onRequestClose={() => setInsufficientXPInfo({ ...insufficientXPInfo, show: false })}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalIconContainer}>
              <Ionicons name="lock-closed" size={40} color={colors.warning} />
            </View>
            
            <Text style={s.modalTitle}>تحتاج للمزيد من النقاط!</Text>
            
            <Text style={s.modalDescription}>
              لشراء <Text style={s.modalHighlight}>{insufficientXPInfo.toyTitle}</Text>، 
              ينقصك <Text style={s.modalXP}>{insufficientXPInfo.missing.toLocaleString()} XP</Text>.
            </Text>

            <View style={s.tipContainer}>
              <Ionicons name="bulb-outline" size={18} color={colors.primary} />
              <Text style={s.tipText}>أكمل المزيد من الدروس والمهمات لجمع النقاط!</Text>
            </View>

            <Pressable 
              onPress={() => setInsufficientXPInfo({ ...insufficientXPInfo, show: false })}
              style={({ pressed }) => [
                s.modalButton,
                pressed && s.modalButtonPressed
              ]}
            >
              <Text style={s.modalButtonText}>سأفعل ذلك!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={s.header}>
        <View style={s.headerTop}>
          <Text style={s.headerTitle}>متجر درهمي</Text>
          <View style={s.balanceContainer}>
            <View style={s.xpIcon}>
              <Ionicons name="sparkles" size={16} color={colors.surface} />
            </View>
            <Text style={s.balanceText}>{totalXP.toLocaleString()} XP</Text>
          </View>
        </View>
        <Text style={s.headerSubtitle}>حول مجهودك التعليمي إلى جوائز حقيقية!</Text>
      </View>

      <ScrollView 
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.grid}>
          {TOYS.map((toy) => (
            <ToyCard key={toy.id} toy={toy} onBuy={handleBuy} />
          ))}
        </View>
        <View style={s.footerPadding} />
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border + "40",
    ...shadows.clay,
  },
  headerTop: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "15",
    paddingRight: spacing.md,
    paddingLeft: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary + "30",
    gap: spacing.sm,
  },
  xpIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.clayPrimary,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "700",
    textAlign: "right",
  },
  scrollContent: {
    padding: spacing.lg,
  },
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.lg,
  },
  card: {
    width: COLUMN_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.clay,
    marginBottom: spacing.xs,
  },
  imageContainer: {
    height: 140,
    width: "100%",
    backgroundColor: colors.surfaceRaised,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textSecondary,
  },
  cardContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  toyTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.text,
    textAlign: "right",
  },
  priceRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceUSD: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textSecondary,
  },
  xpCostContainer: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    gap: 2,
  },
  xpCostText: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.primary,
  },
  xpCostUnit: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    opacity: 0.8,
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    gap: spacing.sm,
    ...shadows.clayPrimary,
  },
  buyButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.surface,
  },
  footerPadding: {
    height: 100,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: 32, // More rounded modal corners
    padding: spacing.xl,
    alignItems: "center",
    ...shadows.clayLarge,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.warningDim,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  modalHighlight: {
    color: colors.text,
    fontWeight: "800",
  },
  modalXP: {
    color: colors.primary,
    fontWeight: "900",
  },
  tipContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.primaryDim,
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: colors.primary,
    fontWeight: "700",
    textAlign: "right",
  },
  modalButton: {
    width: "100%",
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    alignItems: "center",
    ...shadows.clayPrimary,
  },
  modalButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.surface,
  },
});