import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'

import DropDownInput from '../create-screens/DropDownInput'
import FormInput from '../create-screens/FormInput'
import DynamicForm from './DynamicForm'
import Fonts from '@/constants/Typography'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { Ionicons } from '@expo/vector-icons'

import { getSOPs } from '@/src/services/preventive.service'
import { getProcedures } from '@/src/services/procedure.service'
import { useWorkOrderStore } from '@/src/state/workOrders/useWorkOrderStore'
import { ProcedureTemplate } from '@/src/types/procedure'
import { WorkOrder } from '@/src/types/workOrder'

const resolveEntityId = (value: any): string => {
  if (!value) return ""
  if (typeof value === "string" || typeof value === "number") return String(value)
  return String(value?.id ?? value?._id ?? "")
}

const FormsScreen = ({ sourceOrder }: { sourceOrder?: WorkOrder | null }) => {
  const [forms, setForms] = useState<any[]>([])
  const [selectedForm, setSelectedForm] = useState<any>(null)
  const [procedures, setProcedures] = useState<ProcedureTemplate[]>([])
  const [procedureModalVisible, setProcedureModalVisible] = useState(false)

  const sopFormValue = useWorkOrderStore((state) => state.sop_form_id)
  const selectedProcedures = useWorkOrderStore((state) => state.selected_procedures)
  const procedureIds = useWorkOrderStore((state) => state.procedure_ids)
  const location = useWorkOrderStore((state) => state.location)
  const asset = useWorkOrderStore((state) => state.selected_asset)
  const setWorkForm = useWorkOrderStore((state) => state.setWorkForm)

  const locationId = resolveEntityId(location)
  const assetId = resolveEntityId(asset)
  const procedureSelectionLocked = Boolean(sourceOrder?.id && sourceOrder?.hierarchy?.executionOwnedByChildren)

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await getSOPs()
        if (res?.status) {
          const sopForms = Array.isArray(res?.data) ? res.data : []
          setForms(sopForms)

          if (sopFormValue) {
            const resolvedForm = sopForms.find((form: any) => form.name === sopFormValue || resolveEntityId(form) === resolveEntityId(sopFormValue))
            setSelectedForm(resolvedForm || null)
            if (resolvedForm && resolvedForm.name !== sopFormValue) {
              setWorkForm("sop_form_id", resolvedForm.name)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching forms:", error)
      }
    }

    fetchForms()
  }, [setWorkForm, sopFormValue])

  useEffect(() => {
    const fetchProceduresForContext = async () => {
      try {
        const res = await getProcedures({
          location_id: locationId || undefined,
          asset_id: assetId || undefined,
        })
        if (res?.status) {
          const fetchedProcedures = Array.isArray(res?.data) ? res.data : []
          setProcedures(fetchedProcedures)

          if (procedureIds?.length) {
            const matchedProcedures = fetchedProcedures.filter((procedure: ProcedureTemplate) =>
              (procedureIds || []).includes(resolveEntityId(procedure))
            )

            if (matchedProcedures.length) {
              setWorkForm("selected_procedures", matchedProcedures)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching procedures:", error)
        setProcedures([])
      }
    }

    fetchProceduresForContext()
  }, [assetId, locationId, procedureIds, setWorkForm])

  const selectedProcedureIds = useMemo(
    () => new Set((selectedProcedures || []).map((procedure) => resolveEntityId(procedure))),
    [selectedProcedures]
  )

  const toggleProcedureSelection = (procedure: ProcedureTemplate) => {
    const procedureId = resolveEntityId(procedure)
    const isSelected = selectedProcedureIds.has(procedureId)

    const updatedSelection = isSelected
      ? selectedProcedures.filter((entry) => resolveEntityId(entry) !== procedureId)
      : [...selectedProcedures, procedure]

    setWorkForm("selected_procedures", updatedSelection)
    setWorkForm("procedure_ids", updatedSelection.map((entry) => resolveEntityId(entry)))
  }

  const removeProcedure = (procedureId: string) => {
    const updatedSelection = selectedProcedures.filter((entry) => resolveEntityId(entry) !== procedureId)
    setWorkForm("selected_procedures", updatedSelection)
    setWorkForm("procedure_ids", updatedSelection.map((entry) => resolveEntityId(entry)))
  }

  return (
    <KeyboardAwareScrollView bottomOffset={30}>
      <ScrollView style={styles.screen}>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Procedures</Text>
            <Pressable
              style={[styles.selectButton, procedureSelectionLocked && styles.selectButtonDisabled]}
              onPress={() => {
                if (!procedureSelectionLocked) {
                  setProcedureModalVisible(true)
                }
              }}
            >
              <Text style={styles.selectButtonText}>{procedureSelectionLocked ? "Child-Owned" : "Select"}</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionCaption}>
            Procedure templates are the preferred inspection and execution workflow for work orders.
          </Text>

          {procedureSelectionLocked ? (
            <View style={styles.readOnlyNote}>
              <Text style={styles.readOnlyNoteTitle}>Execution is tracked on child work orders</Text>
              <Text style={styles.readOnlyNoteText}>
                This parent work order rolls up child progress. Linked procedures should be managed on the child work orders instead of the parent.
              </Text>
            </View>
          ) : null}

          {selectedProcedures.length > 0 ? (
            <View style={styles.selectedWrap}>
              {selectedProcedures.map((procedure) => {
                const procedureId = resolveEntityId(procedure)
                return (
                  <View key={procedureId} style={styles.procedureChip}>
                    <Text style={styles.procedureChipText}>{procedure.name}</Text>
                    {!procedureSelectionLocked ? (
                      <Pressable onPress={() => removeProcedure(procedureId)}>
                        <Ionicons name="close" size={16} color="#4A2C7B" />
                      </Pressable>
                    ) : null}
                  </View>
                )
              })}
            </View>
          ) : (
            <Text style={styles.emptyText}>No procedures linked yet.</Text>
          )}

          {selectedProcedures.map((procedure) => (
            <View key={`detail-${resolveEntityId(procedure)}`} style={styles.procedureCard}>
              <Text style={styles.procedureName}>{procedure.name}</Text>
              <Text style={styles.procedureMeta}>
                {procedure.category || "Uncategorized"} · {(procedure.required_parts || []).length} required part(s)
              </Text>
              {!!procedure.description ? (
                <Text style={styles.procedureDescription}>{procedure.description}</Text>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Legacy SOP Form</Text>
          <Text style={styles.sectionCaption}>
            SOP forms still work, but procedures above are the preferred long-term flow.
          </Text>

          <DropDownInput
            label="Form"
            field="sop_form_id"
            containerStyle={{ paddingHorizontal: 0 }}
            store={useWorkOrderStore}
            options={forms.map((form: any) => form.name)}
            displayKey="name"
            required={false}
            onSelect={(value) => {
              const form = forms.find((entry: any) => entry.name === value)
              setSelectedForm(form || null)
              setWorkForm("sop_form_id", value)
            }}
          />

          {selectedForm ? (
            <View style={styles.formDetailContainer}>
              <FormInput label="Name" value={selectedForm?.name} readOnly />
              <FormInput label="Category" value={selectedForm?.categoryId?.name} readOnly />
              <FormInput label="Location" value={selectedForm?.locationId?.location_name} readOnly />
              <FormInput label="Description" value={selectedForm?.description} readOnly />

              <DynamicForm key={selectedForm?.id || selectedForm?.name} components={selectedForm?.json_temp?.components} />
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Modal visible={procedureModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setProcedureModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select procedures</Text>
              <Pressable onPress={() => setProcedureModalVisible(false)}>
                <Ionicons name="close" size={20} color="#201F23" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              {procedures.length > 0 ? procedures.map((procedure) => {
                const procedureId = resolveEntityId(procedure)
                const isSelected = selectedProcedureIds.has(procedureId)

                return (
                  <Pressable
                    key={procedureId}
                    style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                    onPress={() => toggleProcedureSelection(procedure)}
                  >
                    <View style={styles.modalItemBody}>
                      <Text style={styles.modalItemTitle}>{procedure.name}</Text>
                      <Text style={styles.modalItemMeta}>
                        {procedure.category || "Uncategorized"} · {(procedure.required_parts || []).length} required part(s)
                      </Text>
                    </View>

                    <Ionicons
                      name={isSelected ? "checkbox" : "square-outline"}
                      size={20}
                      color={isSelected ? "#742BDE" : "#64748B"}
                    />
                  </Pressable>
                )
              }) : (
                <Text style={styles.emptyText}>No procedures found for the current location/asset context.</Text>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAwareScrollView>
  )
}

export default FormsScreen

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 0.6,
    borderColor: "#E1E8EE",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: "#201F23",
  },
  sectionCaption: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 16,
  },
  selectButton: {
    backgroundColor: "#742BDE",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
  selectButtonText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: "#fff",
  },
  readOnlyNote: {
    backgroundColor: "#FFF7E6",
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: "#FFD591",
    padding: 10,
    marginBottom: 10,
  },
  readOnlyNoteTitle: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: "#7A4A00",
  },
  readOnlyNoteText: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#7A4A00",
    lineHeight: 14,
    marginTop: 4,
  },
  selectedWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  procedureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F4EDFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#A259FF",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  procedureChipText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#201F23",
  },
  emptyText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#64748B",
    marginTop: 4,
  },
  procedureCard: {
    borderRadius: 8,
    backgroundColor: "#FAFAFB",
    padding: 10,
    marginTop: 8,
    borderWidth: 0.6,
    borderColor: "#EEF2F6",
  },
  procedureName: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#201F23",
  },
  procedureMeta: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#475569",
    marginTop: 2,
  },
  procedureDescription: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
    marginTop: 6,
    lineHeight: 14,
  },
  formDetailContainer: {
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: "#201F23",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 0.6,
    borderColor: "#E1E8EE",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  modalItemSelected: {
    backgroundColor: "#F8F2FF",
    borderColor: "#B37FEB",
  },
  modalItemBody: {
    flex: 1,
    paddingRight: 12,
  },
  modalItemTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#201F23",
  },
  modalItemMeta: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
    marginTop: 2,
  },
})
