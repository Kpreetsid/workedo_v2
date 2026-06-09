import { Pressable, StyleSheet, Text, View } from "react-native";
import { FontAwesome6, FontAwesome } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import { Asset } from "@/src/types/asset";
import { Image } from "expo-image";
import { endpoints } from "@/src/services/api/endpoints";
import { useAuthStore } from "@/src/state/auth/useAuthStore";
import { useEffect, useState } from "react";

type AssetSummaryProps = {
  asset: Asset;
  assetHealth: any;
  temperature: number | null;
};

export default function AssetSummary({ asset, assetHealth, temperature }: AssetSummaryProps) {
  const {} = useAuthStore();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const fallbackImageUri = "https://new.presageinsights.ai/cmms/assets/images/Asset_page/Pumps.png";
  const [uploadedImagePath] = useState<string | null>(null);

  useEffect(() => {
    if (!asset?.image_path) {
      setImageUri(null);
      return;
    }

    setImageUri(`${endpoints.baseURL}assets/${asset.image_path}?t=${Date.now()}`);
  }, [asset?.image_path]);

  useEffect(() => {
    if (!uploadedImagePath) return;
    // updateAssetWithImagePath(uploadedImagePath);
  }, [uploadedImagePath]);

  return (
    <>
      {/* 🔹 Health + Temperature Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          {/* onPress={openImagePicker} */}
          <Pressable style={styles.cameraIcon}>
            <Image
              source={{ uri: imageUri || fallbackImageUri }}
              style={{ width: 80, height: 80, borderRadius: 8 }}
            />
          </Pressable>

          <View style={styles.summaryInfo}>
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryTitle}>Assets Health</Text>
              {assetHealth && (
                <Text
                  style={[
                    styles.summaryValue,
                    assetHealth.assetHealth === "Healthy" && styles.healthy,
                    assetHealth.assetHealth === "Alert" && styles.alert,
                    assetHealth.assetHealth === "Danger" && styles.danger,
                    assetHealth.assetHealth === "Critical" && styles.critical,
                    assetHealth.assetHealth === "Not Defined" && styles.not_defined,
                  ]}
                >
                  {assetHealth?.assetScore ? assetHealth.assetScore : "N/A"}
                </Text>
              )}
            </View>

            <View style={styles.summaryBlock}>
              <Text style={styles.summaryTitle}>Temperature</Text>
              <View style={styles.tempRow}>
                <FontAwesome name="thermometer-half" size={15} color="#CA8A04" />
                <Text style={[styles.summaryValue, { color: "#FFB84D" }]}>
                  {temperature || "N/A"} °C
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 🔹 Asset Name / Type / Location */}
      <View style={styles.detailsRow}>
        <DetailPill
          icon="orcid"
          label="Asset Name"
          value={asset?.asset_name}
          iconColor="#742bde"
        />
        <DetailPill
          icon="screwdriver-wrench"
          label="Asset Type"
          value={asset?.asset_type || "-"}
          iconColor="#FF8D54"
        />
        <DetailPill
          icon="location-dot"
          label="Location"
          value={asset?.locationId?.location_name || "-"}
          iconColor="#EE2E6B"
        />
      </View>
    </>
  );
}

const DetailPill = ({
  icon,
  label,
  value,
  iconColor,
}: {
  icon: string;
  label: string;
  value: string;
  iconColor: string;
}) => (
  <View style={styles.detailPill}>
    <FontAwesome6 name={icon as any} size={14} color={iconColor} />
    <View style={styles.detailTextWrapper}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={styles.detailValue}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {value}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  summaryCard: {
    // backgroundColor: "#FEFCE8",
    backgroundColor: "#fffdecff",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderWidth: 1.1,
    borderColor: "#FFE000",
    marginHorizontal: 20,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  summaryInfo: {
    flex: 1,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  summaryBlock: {
    gap: 4,
  },
  cameraIcon: {
    backgroundColor: "#fff",
    height: 80,
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderColor: "#000",
    borderWidth: 0.1,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  placeholderText: {
    fontSize: 10,
    color: "#201f23",
    fontFamily: Fonts.medium,
  },
  summaryTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#201f23",
  },
  summaryValue: {
    fontFamily: Fonts.semiBold,
    color: "#CA8A04",
    lineHeight: 18,
  },
  tempRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  healthy: {
    fontSize: 14,
    margin: 0,
    color: "#51FC4C",
  },
  alert: {
    color: "#F7FA4B",
  },
  danger: {
    color: "#FA8349",
  },
  critical: {
    color: "#ff181e",
  },
  not_defined: {
    color: "#B0B0B0",
  },

  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
  },
  detailPill: {
    width: "30%",
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailTextWrapper: {
    flex: 1,
    flexShrink: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#201f23",
  },
  detailValue: {
    fontSize: 11,
    color: "#201f23",
    fontFamily: Fonts.semiBold,
    lineHeight: 15,
  },
});
