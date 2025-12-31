import { StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { WorkOrder } from '@/src/types/workOrder';
import { getSOPs } from '@/src/services/preventive.service';
import { getFormData, updateWorkOrder } from '@/src/services/work-order.service';
import Fonts from '@/constants/Typography';
import ActionButton from '../auth-screens/ActionButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

interface Props {
  params: WorkOrder;
}

const Forms = ({ params }: Props) => {
  console.log('params on forms = ', params);
  const [values, setValues] = useState<Record<string, any> | null>(null);

  const [formData, setFormData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    console.log('loaded forms')
    const fetchForms = async () => {
      try {
        const res = await getFormData(params?.sop_form_id as string);
        if (res?.status) {
          console.log('forms = ', res?.data);
          setFormData(res?.data[0]);
        }
      } catch (error) {
        console.error("Error fetching forms:", error);
      }
    };

    fetchForms();
  }, [params])

  useEffect(() => {
    if (!formData) return;
    console.log('components = ', formData.json_temp.components);
    const initialValues: Record<string, any> = {};

    formData.json_temp.components.forEach((comp: any) => {
      if (params?.sop_form_data?.hasOwnProperty(comp.key)) {
        initialValues[comp.key] = params?.sop_form_data[comp.key];
      }
    });
    console.log('initialValues = ', initialValues)
    setValues(initialValues);
  }, [formData])

  const onChange = (key: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onSubmit = async () => {
    let payload = {
      "order_no": params?.order_no,
      "priority": params?.priority,
      "status": params?.status,
      "type": params?.type,
      "nature_of_work": params?.nature_of_work,
      "wo_asset_id": params?.wo_asset_id,
      "wo_location_id": params?.wo_location_id,
      "start_date": params?.start_date,
      "end_date": params?.end_date,
      "sop_form_id": params?.sop_form_id,
      "sop_form_data": {
        ...values,
        submit: true,
      },
      "sop_form_submitted": true,
      "userIdList": params?.assignedUsers?.map((user: any) => user.user.id)
    }

    console.log(payload);

    const res = await updateWorkOrder(params.id, payload);
    console.log("✅ Response:", res);
    if (res?.status) {
      ToastAndroid.show("Work order updated successfully", ToastAndroid.SHORT);
    }
  }

  return (
    <KeyboardAwareScrollView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>{formData?.name}</Text>

      {/* Description */}
      <Text style={styles.subtitle}>{formData?.description}</Text>

      {/* Fields */}
      {
        (formData != null) && formData.json_temp.components.map((comp: any) => {
          /* ---------- TEXT FIELD ---------- */
          if (comp.type === "textfield") {
            return (
              <View key={comp.id} style={styles.fieldWrapper}>
                {!comp.hideLabel && (
                  <Text style={styles.label}>{comp.label}</Text>
                )}

                <TextInput
                  style={styles.input}
                  value={values?.[comp.key] ?? ""}
                  placeholder={comp.placeholder}
                  onChangeText={(text) => onChange(comp.key, text)}
                />
              </View>
            );
          }

          /* ---------- TEXT AREA ---------- */
          if (comp.type === "textarea") {
            return (
              <View key={comp.id} style={styles.fieldWrapper}>
                {!comp.hideLabel && (
                  <Text style={styles.label}>{comp.label}</Text>
                )}

                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={values?.[comp.key] ?? ""}
                  placeholder={comp.placeholder}
                  multiline
                  numberOfLines={comp.rows || 3}
                  textAlignVertical="top"
                  onChangeText={(text) => onChange(comp.key, text)}
                />
              </View>
            );
          }

          /* ---------- SUBMIT BUTTON ---------- */
          if (comp.type === "button" && comp.action === "submit") {
            return (
              <ActionButton
                label={comp.label}
                onPress={() => onSubmit()}
                style={{ width: '100%', alignSelf: 'center', marginBottom: 40 }}
              />
            );
          }

          return null;
        })
      }
    </KeyboardAwareScrollView>
  );
}

export default Forms
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    margin: 20,
  },

  title: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    textAlign: "center",
    color: "#0B0B8C",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    textAlign: "center",
    color: "#0B0B8C",
    marginBottom: 24,
  },

  fieldWrapper: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    marginBottom: 6,
    color: "#000",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#222"
  },

  button: {
    alignSelf: "flex-start",
    backgroundColor: "#F2994A",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },

  buttonText: {
    color: "#fff",
    fontFamily: Fonts.semiBold,
    fontSize: 16,
  },

  textArea: {
    minHeight: 100,
  },
});
