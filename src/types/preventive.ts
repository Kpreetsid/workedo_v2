export interface Preventive {
	_id: string;
	id: string;
	title: string;
	description: string;
	start_date: string;            // e.g. "2025-02-21"
	days_to_complete: number;
	schedule_mode: string;         // e.g. "day"

	work_order: {
		title: string;
		description: string;
		estimated_time: string;
		priority: string;
		status: string;
		nature_of_work: string;
		account_id: string;
		assigned_to: number;
		created_by: string;
		sopForm: string | null;
		userId: WorkOrderUser[];
		workInstruction: string | null;
		estimatedParts: any[];
		actualParts: any[];
		createdFrom: string;         // e.g. "Preventive"
		users: any[];
	};

	rescheduleEnabled: boolean;
	rescheduleDays: number;
	no_of_time_call: number;
	visible: boolean;
	account_id: string;
	next_execute_date: string;     // e.g. "2025-02-21"

	location: PreventiveLocation[];
	asset: PreventiveAsset[];
}

export interface WorkOrderUser {
	firstName: string;
	lastName: string;
	username: string;
	pincode?: string | null;
	email: string;
	emailStatus: boolean;
	user_status: string;
	user_role: string;
	createdOn: string;
	id: string;
	account_id: string;
	address?: string | null;
	isFirstUser?: boolean;
	phone_no?: PhoneNumberInfo;
	mobileNumber?: PhoneNumberInfo;
	userrole?: string;
	userstatus?: string;
	user_profile_img?: string;
}

export interface PhoneNumberInfo {
	number: string;
	internationalNumber: string;
	nationalNumber: string;
	e164Number: string;
	countryCode: string;
	dialCode: string;
}

export interface PreventiveLocation {
	location_name: string;
	description: string;
	location_type: string;
	top_level: boolean;
	assigned_to: string;
	visible: boolean;
	id: string;
	account_id: string;
	userId: string;
	top_level_location_id: string;
	teamId: string | null;
	userName: string;
	top_level_location_image?: string;
	image_path?: string;
	location: string;
	qr_code: string;
}

export interface PreventiveAsset {
	asset_name: string;
	asset_id: string;
	top_level: boolean;
	locationId: string;
	visible: boolean;
	id: string;
	account_id: string;
	top_level_asset_id: string;
	description: string;
	model: string;
	manufacturer: string;
	asset_type: string;
	year: string;
	teamId: string;
	assigned_to: number | string;
	locationData: {
		location_name: string;
		id: string;
		assigned_to: string;
	}[];
	locationName: string;
	childs: any[];
	location: {
		location_name: string;
		id: string;
	};
}