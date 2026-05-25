import { StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";
import React, { useEffect, useState } from "react";
import { WorkOrder } from "@/src/types/workOrder";
import { getFormData, patchWorkOrder } from "@/src/services/work-order.service";
import Fonts from "@/constants/Typography";
import ActionButton from "../auth-screens/ActionButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

interface Props {
	params: WorkOrder;
}

const Forms = ({ params }: Props) => {
	const [values, setValues] = useState<Record<string, any> | null>(null);
	const [formData, setFormData] = useState<Record<string, any> | null>(null);

	useEffect(() => {
		const fetchForms = async () => {
			if (!params?.sop_form_id) {
				setFormData(null);
				return;
			}

			try {
				const res = await getFormData(params.sop_form_id as string);
				if (res?.status) {
					setFormData(res?.data?.[0] || null);
				}
			} catch (error) {
				console.error("Error fetching forms:", error);
			}
		};

		fetchForms();
	}, [params?.sop_form_id]);

	useEffect(() => {
		if (!formData?.json_temp?.components) return;

		const initialValues: Record<string, any> = {};
		formData.json_temp.components.forEach((comp: any) => {
			if (params?.sop_form_data?.hasOwnProperty(comp.key)) {
				initialValues[comp.key] = params?.sop_form_data[comp.key];
			}
		});
		setValues(initialValues);
	}, [formData, params?.sop_form_data]);

	const onChange = (key: string, value: string) => {
		setValues((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const onSubmit = async () => {
		if (!params?.id) return;

		try {
			const res = await patchWorkOrder(params.id, {
				sop_form_id: params?.sop_form_id,
				sop_form_data: {
					...values,
					submit: true,
				},
				sop_form_submitted: true,
			});

			if (res?.status) {
				ToastAndroid.show("Checklist updated successfully", ToastAndroid.SHORT);
				return;
			}

			ToastAndroid.show("Failed to update checklist", ToastAndroid.SHORT);
		} catch (error: any) {
			ToastAndroid.show(error?.message || "Failed to update checklist", ToastAndroid.LONG);
		}
	};

	return (
		<KeyboardAwareScrollView style={styles.container}>
			{!formData ? (
				<View>
					<Text style={styles.title}>No checklist attached</Text>
					<Text style={styles.subtitle}>This work order does not have a legacy SOP form assigned.</Text>
				</View>
			) : null}

			<Text style={styles.title}>{formData?.name}</Text>
			<Text style={styles.subtitle}>{formData?.description}</Text>

			{formData?.json_temp?.components?.map((comp: any) => {
				if (comp.type === "textfield") {
					return (
						<View key={comp.id} style={styles.fieldWrapper}>
							{!comp.hideLabel ? <Text style={styles.label}>{comp.label}</Text> : null}
							<TextInput
								style={styles.input}
								value={values?.[comp.key] ?? ""}
								placeholder={comp.placeholder}
								onChangeText={(text) => onChange(comp.key, text)}
							/>
						</View>
					);
				}

				if (comp.type === "textarea") {
					return (
						<View key={comp.id} style={styles.fieldWrapper}>
							{!comp.hideLabel ? <Text style={styles.label}>{comp.label}</Text> : null}
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

				if (comp.type === "button" && comp.action === "submit") {
					return (
						<ActionButton
							key={comp.id || comp.key || "submit"}
							label={comp.label}
							onPress={onSubmit}
							style={{ width: "100%", alignSelf: "center", marginBottom: 40 }}
						/>
					);
				}

				return null;
			})}
		</KeyboardAwareScrollView>
	);
};

export default Forms;

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
		color: "#222",
	},
	textArea: {
		minHeight: 100,
	},
});
