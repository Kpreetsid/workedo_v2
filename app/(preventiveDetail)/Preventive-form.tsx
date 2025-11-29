import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Preventive } from '@/src/types/preventive'
import { getSOPs } from '@/src/services/preventive.service';
import Fonts from '@/constants/Typography';

const InfoField = ({ label, value, multiline = false, style }: any) => (
	<View style={[styles.block, style]}>
		<Text style={styles.label}>{label}</Text>
		<TextInput
			style={[
				styles.input,
				multiline && { height: 90, paddingTop: 10, textAlignVertical: "top" },
			]}
			editable={false}
			multiline={multiline}
			value={value}
		/>
	</View>
);

const DEFAULT_FIELD = ({ comp }: any) => (
	<InfoField label={comp.label} style={{ width: "100%" }} />
);

const COMPONENT_MAP: any = {
	button: ({ comp }: any) => (
		<TouchableOpacity style={styles.submitBtn}>
			<Text style={styles.submitBtnText}>{comp.label}</Text>
		</TouchableOpacity>
	),
};

const renderFormComponents = (components: any[]) => {
	if (!components?.length) return null;

	return components.map((comp: any) => {
		const Renderer = COMPONENT_MAP[comp.type] || DEFAULT_FIELD;
		return <Renderer key={comp.id} comp={comp} />;
	});
};

const PreventiveForm = ({ item }: { item: Preventive | any }) => {
	const [forms, setForms] = useState<any>([]);
	const [formDetails, setFormDetails] = useState<any>();

	useEffect(() => {
		const fetchForms = async () => {
			try {
				const res = await getSOPs();
				if (res?.status) {
					setForms(res?.data);
				}
			} catch (error) {
				console.error("Error fetching forms:", error);
			}
		};

		fetchForms();

		return () => {
			setForms([]);
		}
	}, []);

	useEffect(() => {
		if (item?.work_order?.sop_form_id) {
			const form = forms.find((form: any) => form.id === item?.work_order?.sop_form_id);
			setFormDetails(form);
		} else {
			setFormDetails(null)
		}
	}, [forms])

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={{ paddingBottom: 40 }}
		>
			{
				formDetails ?
					<>
						<View style={styles.row}>
							<InfoField label="Name" value={formDetails?.name} />
							<InfoField label="Category" value={formDetails?.categoryId?.name} />
						</View>


						<View style={styles.row}>
							<InfoField label="Location" value={item?.work_order?.location?.location_name} style={{ width: '100%' }} />
						</View>
					</>
					:
					<View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
						<Text style={styles.label}>No form added yet</Text>
					</View>
			}




			<View style={{ marginTop: 10 }}>
				{renderFormComponents(formDetails?.json_temp?.components)}
			</View>

		</ScrollView>
	);
};

export default PreventiveForm

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F3F5F8",
		paddingHorizontal: 20,
		paddingTop: 10,
	},

	row: {
		flexDirection: "row",
		justifyContent: "space-between",
	},

	block: {
		width: "48%", // for 2 columns
		marginBottom: 18,
	},

	label: {
		fontSize: 12,
		fontFamily: Fonts.medium,
		color: "#444",
		marginBottom: 6,
	},

	input: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#E2E4E8",
		borderRadius: 6,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 14,
		color: "#222",
	}, submitBtn: {
		backgroundColor: "#742BDE",
		paddingVertical: 14,
		borderRadius: 6,
		marginTop: 15,
		alignItems: "center",
	},
	submitBtnText: {
		color: "#fff",
		fontSize: 15,
		fontWeight: "600",
	},

});