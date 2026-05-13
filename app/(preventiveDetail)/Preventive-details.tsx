import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Fonts from '@/constants/Typography';
import { Preventive } from '@/src/types/preventive';
import ActionButton from '@/components/auth-screens/ActionButton';
import { useRouter } from 'expo-router';
import moment from 'moment';


const InfoField = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoBlock}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputBox}>
      <Text style={styles.inputText}>{value || "--"}</Text>
    </View>
  </View>
);

const PreventiveDetails = ({ item }: { item: Preventive | any }) => {
  const router = useRouter();
  const createdOn = item?.createdAt ?? item?.work_order?.createdAt;
  const updatedOn = item?.updatedAt ?? item?.work_order?.updatedAt;

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* TOP GRID */}
        <View style={styles.row}>
          <InfoField label="Mode" value={item?.schedule?.mode} />
          <InfoField label="Schedule Status" value={item?.schedule?.enabled ? "Active" : "Inactive"} />
        </View>

        <View style={styles.row}>
          <InfoField label="Part Type" value="Spare 1" />
          <InfoField label="Start Date" value={item?.schedule?.start_date} />
        </View>


        {
          item?.schedule?.end_date ?
            <View style={styles.row}>
              <InfoField label="End Date" value={item?.schedule?.end_date} />
              <InfoField label="Last Executed On" value={item?.schedule?.last_executed_on} />
            </View>
            :
            <View style={styles.row}>
              <InfoField label="No. of Repetition" value={item?.schedule?.no_of_execution || 0} />
              <InfoField label="Last Executed On" value={item?.schedule?.last_executed_on} />
            </View>
        }

        <View style={styles.row}>
          <InfoField
            label="Skip Weekends"
            value={`${item?.schedule?.skipWeekends ? "Yes" : "No"} - ${item?.schedule?.skipWeekendSunday ? "Sunday" : ""}, ${item?.schedule?.skipWeekendSaturday ? "Saturday" : ""}`.trim()}
          />
        </View>

        {/* SECTION HEADER */}
        <Text style={styles.sectionTitle}>Work Order Details :</Text>

        {/* WORK ORDER GRID */}
        <View style={styles.row}>
          <InfoField label="Title" value={item?.work_order?.title} />
          <InfoField label="Location Name" value={item?.work_order?.location?.location_name} />
        </View>

        <View style={styles.row}>
          <InfoField label="Location Type" value={item?.work_order?.location?.location_type} />
          <InfoField label="Asset Name" value={item?.work_order?.asset?.asset_name} />
        </View>

        <View style={styles.row}>
          <InfoField label="Asset Type" value={item?.work_order?.asset?.asset_type} />
          <InfoField label="Problem Type" value={item?.work_order?.type} />
        </View>

        <View style={styles.row}>
          <InfoField label="Priority" value={item?.work_order?.priority} />
          <InfoField label="Status" value={item?.work_order?.status} />
        </View>

        <View style={styles.row}>
          <InfoField label="Updated On" value={updatedOn ? moment(updatedOn).format("DD-MM-YYYY hh:mm A") : "--"} />
          <InfoField label="Created On" value={createdOn ? moment(createdOn).format("DD-MM-YYYY hh:mm A") : "--"} />
        </View>

        {/* ASSIGN TO */}
        <View style={[styles.infoBlock, { width: '100%' }]}>
          <Text style={styles.label}>Assign To</Text>
          <View style={styles.tagsRow}>
            {item?.work_order?.users?.map((user: any) => (
              <View key={user?.id} style={styles.tag}>
                <Text style={styles.tagText}>{user?.firstName + " " + user?.lastName}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* FOOTER TEXTAREA */}
        <View style={[styles.infoBlock, { width: '100%' }]}>
          <Text style={styles.label}>Description</Text>
          <View style={[styles.inputBox, { height: 90 }]}>
            <Text style={styles.inputText}>{item?.description}</Text>
          </View>
        </View>

        {/* PARTS ATTACHED */}
        <View style={styles.partsSection}>
          <View style={styles.partsHeader}>
            <Text style={styles.partsTitle}>Parts Attached</Text>
          </View>

          <View style={styles.partsCard}>
            <View style={styles.partsRowHeader}>
              <Text style={[styles.partsHeaderText, styles.colName]}>Part Name</Text>
              <Text style={[styles.partsHeaderText, styles.colType]}>Part Type</Text>
              <Text style={[styles.partsHeaderText, styles.colQty]}>Estimated Quantity</Text>
              <Text style={[styles.partsHeaderText, styles.colUnit]}>Unit</Text>
            </View>

            {item?.work_order?.parts?.length > 0 ? (
              item.work_order.parts.map((part: any, idx: number) => (
                <View style={styles.partsRow} key={part?.part_id || idx}>
                  <Text style={[styles.partsCellText, styles.colName]}>{part?.part_name || "--"}</Text>
                  <Text style={[styles.partsCellText, styles.colType]}>{part?.part_type || "--"}</Text>
                  <Text style={[styles.partsCellText, styles.colQty]}>{part?.estimatedQuantity ?? "--"}</Text>
                  <Text style={[styles.partsCellText, styles.colUnit]}>{part?.unit || "--"}</Text>
                </View>
              ))
            ) : (
              <View style={styles.partsEmptyRow}>
                <Text style={styles.partsEmptyText}>No parts attached.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* <View style={styles.btnContainer}>
        <ActionButton label="Submit" onPress={() => router.back()} />
      </View> */}
    </>
  );
};

export default PreventiveDetails

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F5F8",
    padding: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoBlock: {
    width: "48%",
    marginBottom: 16,
  },

  label: {
    fontSize: 12,
    color: "#201F23",
    marginBottom: 5,
    fontFamily: Fonts.semiBold
  },

  inputBox: {
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E5E9",
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
  },

  inputText: {
    color: "#201F23",
    fontSize: 12,
    fontFamily: Fonts.regular
  },

  sectionTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    marginVertical: 15,
    color: "#222",
  },
  partsSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  partsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  partsTitle: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: "#742BDE",
  },
  partsCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  partsRowHeader: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E5E9",
  },
  partsRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E5E9",
  },
  partsHeaderText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: "#201F23",
  },
  partsCellText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#201F23",
  },
  colName: {
    flex: 2,
  },
  colType: {
    flex: 1.2,
  },
  colQty: {
    flex: 1.4,
  },
  colUnit: {
    flex: 1,
  },
  partsEmptyRow: {
    paddingVertical: 10,
  },
  partsEmptyText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#6B7280",
  },

  tagsRow: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E5E9",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  tag: {
    backgroundColor: "#E7ECF7",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  tagText: {
    fontSize: 13,
    color: "#333",
  },
  btnContainer: {
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 10,
  },
});
