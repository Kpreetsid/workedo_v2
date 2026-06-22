import { ActivityIndicator, Pressable, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Asset } from '@/src/types/asset';
import moment from 'moment';
import { useCreateAssetStore } from '@/src/store/useCreateAsset';
import { singleAssetData, updateNewAsset } from '@/src/services/asset.service';
import Fonts from '@/constants/Typography';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ScrollView } from 'react-native-gesture-handler';
import Header from '@/components/global/Header';
import { FormField } from '@/components/global/FormField';
import { DateDropDownIcon } from '@/constants/IconProvider';
import LocationPickerModal from '@/components/create-work-order/LocationPickerModal';
import { mapUserToLocation } from '@/src/services/location.service';
import { Image } from 'expo-image';
import { endpoints } from '@/src/api/endpoints';
import { Feather } from '@expo/vector-icons';

interface editAssetParams {
  asset_id?: string;
  asset_data: Asset | null;
  mode?: string;
}

const editAsset = () => {
  console.log('runing edit asset')
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams();

  const [open, setOpen] = useState<boolean | null>(false);
  const [loading, setLoading] = useState(false);
  const [timezones, setTimezones] = useState<string[]>([]);
  const [usersMappedToLocation, setUsersMappedToLocation] = useState([])
  const [initialized, setInitialized] = useState(false);

  const [data, setData] = useState<editAssetParams | null>(null);

  const normalizeParamValue = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) return value[0];
    return value;
  };

  useEffect(() => {
    if (initialized) return;

    const {
      asset_id,
      asset_data,
      mode
    } = params as {
      asset_id?: string;
      asset_data?: string;
      mode?: string;
    };

    const normalizedAssetId = normalizeParamValue(asset_id);
    const normalizedAssetData = normalizeParamValue(asset_data);
    const normalizedMode = normalizeParamValue(mode) === "child" ? "child" : "parent";

    if (normalizedAssetId) {
      setData({
        asset_id: String(normalizedAssetId),
        asset_data: null,
        mode: normalizedMode,
      });
    }

    if (!normalizedAssetData) {
      if (normalizedAssetId) {
        return;
      }

      console.warn("editAsset: asset route params missing");
      setData(null);
      return;
    }

    try {
      const parsed = JSON.parse(normalizedAssetData) as Asset | null;
      if (!parsed || typeof parsed !== "object") {
        console.warn("editAsset: invalid asset_data payload");
        setData(null);
        return;
      }

      setData({
        asset_id: String(normalizedAssetId ?? (parsed as any)?.id ?? (parsed as any)?._id ?? ""),
        asset_data: parsed,
        mode: normalizedMode,
      });
      console.log("Parsed Data:", { asset_data: parsed, mode });
    } catch (e) {
      console.error("editAsset: failed to parse asset_data", e);
      setData(null);
    }
  }, [params, initialized]);

  const { resetForm, setCreateAssetValue } = useCreateAssetStore();
  const assigned_users = useCreateAssetStore((state) => state.assigned_users);
  const locationObject = useCreateAssetStore((state) => state.locationObject);
  if (locationObject) {
    console.log('locationObject called = ', locationObject);
  }

  useEffect(() => {
    if (locationObject) {
      console.log('location object in effect = ', locationObject);
      const locationId = locationObject?.id ?? locationObject?._id;
      if (locationId) {
        mapUserToLocationFunc(locationId);
      }
    }
  }, [locationObject])

  const mapUserToLocationFunc = async (location_id: string) => {
    try {
      const res = await mapUserToLocation(location_id);
      console.log('res = ', res);
      if (res?.status) {
        setUsersMappedToLocation(res?.data)
        // console.log('assigned_users = ', assigned_users);
        // setCreateAssetValue("assigned_users", res?.data);
        // setCreateAssetValue("assigned_users", [...assigned_users, ...res?.data]);
      }
    } catch (err) {
      console.log('error = ', err);
    }
  }

  function normalizeParent(parent: any) {
    if (!parent) return null;

    if (typeof parent === "string") {
      return { id: parent, asset_name: "" };
    }

    return {
      id: parent.id || parent._id || null,
      asset_name: parent.asset_name || parent.name || "",
    };
  }

  function normalizeLocation(asset: any) {
    const locationData = Array.isArray(asset?.locationData)
      ? asset.locationData[0]
      : asset?.locationData ?? null;

    const locationCandidate = asset?.locationId ?? locationData ?? null;

    if (!locationCandidate) {
      return {
        locationId: "",
        locationObject: null,
      };
    }

    if (typeof locationCandidate === "string" || typeof locationCandidate === "number") {
      return {
        locationId: String(locationCandidate),
        locationObject: {
          id: String(locationCandidate),
          location_name: asset?.location_name ?? "",
        },
      };
    }

    return {
      locationId: String(locationCandidate?.id ?? locationCandidate?._id ?? ""),
      locationObject: {
        ...locationCandidate,
        id: locationCandidate?.id ?? locationCandidate?._id ?? "",
        location_name:
          locationCandidate?.location_name ??
          locationCandidate?.name ??
          asset?.location_name ??
          "",
      },
    };
  }

  useEffect(() => {
    if (!data?.asset_id || initialized) return;

    let isMounted = true;

    const fetchAssetDetails = async () => {
      try {
        const res = await singleAssetData(data.asset_id!);
        const fetchedAsset = res?.data?.[0] ?? null;

        if (!isMounted) return;

        if (!fetchedAsset) {
          if (!data?.asset_data) {
            ToastAndroid.show("Failed to load asset details.", ToastAndroid.SHORT);
          }
          return;
        }

        setData((prev) => prev ? {
          ...prev,
          asset_data: fetchedAsset,
        } : {
          asset_id: String(data.asset_id),
          asset_data: fetchedAsset,
          mode: data.mode,
        });
      } catch (err) {
        console.error("editAsset: failed to fetch asset details", err);
        if (isMounted && !data?.asset_data) {
          ToastAndroid.show("Failed to load asset details.", ToastAndroid.SHORT);
        }
      }
    };

    fetchAssetDetails();

    return () => {
      isMounted = false;
    };
  }, [data?.asset_id, data?.asset_data, data?.mode, initialized]);


  useEffect(() => {
    if (!data?.asset_data) return; // only proceed when parsed asset exists

    if (timezones.length == 0) {
      fetchAllTimezones();
    }

    setCreateAssetValue("timezone", "Asia/Kolkata");
    // console.log('initialized value = ', initialized);
    // console.log('data value = ', data);


    if (!initialized && data) {
      console.log('in if')
      const currentAssetId = String((data?.asset_data as any)?.id ?? (data?.asset_data as any)?._id ?? data?.asset_id ?? "");
      const { locationId, locationObject } = normalizeLocation(data?.asset_data);

      setCreateAssetValue("title", data?.asset_data?.asset_name ?? "");
      setCreateAssetValue("asset_id", data?.asset_data?.asset_id ?? currentAssetId);
      setCreateAssetValue("asset_type", data?.asset_data?.asset_type);
      setCreateAssetValue("timezone", data?.asset_data?.asset_timezone ?? "");
      setCreateAssetValue("location", locationId);
      setCreateAssetValue("locationObject", locationObject);
      setCreateAssetValue("parent_location", locationObject);
      setCreateAssetValue("manufacturer", data?.asset_data?.manufacturer ?? null);
      setCreateAssetValue("model", data?.asset_data?.asset_model ?? data?.asset_data?.model ?? "");
      setCreateAssetValue("year", data?.asset_data?.year ?? "");
      setCreateAssetValue("description", data?.asset_data?.description ?? "");
      setCreateAssetValue("assigned_users", data?.asset_data?.userList ?? []);

      if (data?.asset_data?.image_path) {
        setCreateAssetValue("attachments", [{ image_path: data?.asset_data?.image_path }]);
      }

      if (data?.asset_data?.asset_build_type) {
        setCreateAssetValue(
          "asset_build_type",
          data.asset_data.asset_build_type === "non_electric"
            ? "Non Electric"
            : "Electric"
        );
      }

      if (data.mode === "child") {
        const parentAsset = normalizeParent(data.asset_data.parent_id);
        setCreateAssetValue("parent_asset", parentAsset!);
      }

      setInitialized(true); // ← only set here
    }

  }, [data])

  useEffect(() => {
    return () => {
      console.log("unmount → reset");
      resetForm();
    };
  }, []);


  useEffect(() => {
    console.log('iniialized ran = ', initialized)
    console.log('store after initialized true = ', useCreateAssetStore.getState())
  }, [initialized])

  // const fetchAssetData = async () => {
  // 	try {
  // 		const res = await singleAssetData(data?.asset_data?.id);
  // 		console.log('single asset data = ', res);
  // 		if (res?.status) {
  // 			setCreateAssetValue("assigned_users", res?.data[0]?.userList);
  // 		}
  // 	} catch (e) {
  // 		console.log('error asset data = ', e);
  // 	}
  // }

  const fetchAllTimezones = () => {
    // console.log(moment.tz.names())
    setTimezones(moment.tz.names());
  }

  const handleEditAsset = async () => {
    const values = useCreateAssetStore.getState();
    console.log('values = ', values);
    const assignedUsers = Array.isArray(values.assigned_users) ? values.assigned_users : [];
    const attachments = Array.isArray(values.attachments) ? values.attachments : [];
    const rawLocationId = values.locationObject?.id ?? values.locationObject?._id;
    const locationId =
      typeof values.locationObject === "string" || typeof values.locationObject === "number"
        ? String(values.locationObject)
        : rawLocationId
          ? String(rawLocationId)
          : "";

    if (values.title === "") {
      ToastAndroid.show("Please enter asset name", ToastAndroid.SHORT);
      return;
    }

    if (values.asset_type === "") {
      ToastAndroid.show("Please enter asset type", ToastAndroid.SHORT);
      return;
    }

    if (!locationId) {
      ToastAndroid.show("Please select parent location", ToastAndroid.SHORT);
      return;
    }


    if (assignedUsers.length === 0) {
      ToastAndroid.show("Please assign users", ToastAndroid.SHORT);
      return;
    }

    if (data?.mode === 'child') {
      if (values.asset_build_type === "") {
        ToastAndroid.show("Please select circuit type", ToastAndroid.SHORT);
        return;
      }
    }

    setLoading(true)

    const getUserId = (obj: any) => obj?.user?.id ?? obj?.id;
    let payload: any = {
      asset_name: values.title,
      asset_timezone: values.timezone,
      description: values.description,
      asset_model: values.model,
      manufacturer: values.manufacturer,
      asset_type: values.asset_type,
      year: values.year,
      asset_id: values.asset_id,
      asset_build_type: "Not Defined",
      locationId,
      image_path: attachments.length > 0
        ? (attachments[0].image_path ?? attachments[0].fileName ?? "")
        : "",

      // because of backend user object has changed, applying this logic to look for user object, it can be inside nested user object sometimes.

      userIdList: assignedUsers.map((u: any) => getUserId(u)).filter(Boolean)
      // userIdList: values.assigned_users.map((u: any) => u.id),

    };

    if (data?.mode === 'child') {
      payload.asset_build_type = values.asset_build_type == "Electric" ? "electric" : "non_electric";

      // payload.parent_id = data?.asset_data?.id;

      // top_level: data?.mode === 'child' ? false : true,
      // 	top_level_asset_id: data?.mode === 'child' ? data?.asset_data?.id : "",
    }

    console.log('payload = ', payload);

    try {
      const res = await updateNewAsset(payload, data?.asset_data?.id);
      console.log('res = ', res);
      if (res.status) {
        setLoading(false)
        resetForm();
        ToastAndroid.show('Asset updated successfully', ToastAndroid.SHORT);
        router.back();
      } else {
        setLoading(false)
      }

    } catch (err) {
      console.log('error = ', err);
      setLoading(false)
    }
  }

  return (
    <KeyboardAwareScrollView bottomOffset={30} style={styles.container}>
      <ScrollView style={styles.container}>
        <Header title={"Update Asset"} />

        {
          initialized ? (
            <>
              <FormField
                label="Title"
                placeholder="Enter Title"
                field="title"
                store={useCreateAssetStore}
                setterName="setCreateAssetValue"
                styles={{ paddingHorizontal: 25 }}
              />

              {/* <FormField
                label="Asset ID"
                placeholder="Enter Asset ID"
                field="asset_id"
                store={useCreateAssetStore}
                setterName="setCreateAssetValue"
                required={false}
              /> */}

              <FormField
                label="Asset Type"
                type="dropdown"
                field="asset_type"
                options={["Fan_Blower", "Pumps", "Gearbox", "Compressor", "Chillers", "CNC", "Motor", "Other"]}
                store={useCreateAssetStore}
                setterName="setCreateAssetValue"
                styles={{ paddingHorizontal: 25 }}
              />

              <FormField
                label="Time Zone"
                type="dropdown"
                placeholder="Select Time Zone"
                field="timezone"
                options={timezones}
                store={useCreateAssetStore}
                setterName="setCreateAssetValue"
                styles={{ paddingHorizontal: 25 }}
              />

              {
                data?.mode === 'child' ?
                  <View
                    style={[
                      styles.locationSelector
                    ]}
                  >
                    <View style={styles.labelContainer}>
                      <Text style={styles.labelText}>Parent Location</Text>
                      <Text style={styles.asterisk}>*</Text>
                    </View>

                    <View
                      style={[styles.field]}
                    >
                      <Text
                        style={[
                          styles.inputText,
                          { color: "#222" },
                        ]}
                        numberOfLines={1}
                      >
                        {
                          useCreateAssetStore.getState().parent_location?.location_name
                        }
                      </Text>
                    </View>
                  </View>
                  :
                  <Pressable onPress={() => setOpen(!open)}>
                    <View
                      style={[
                        styles.locationSelector
                      ]}
                    >
                      <View style={styles.labelContainer}>
                        <Text style={styles.labelText}>Parent Location</Text>
                        <Text style={styles.asterisk}>*</Text>
                      </View>

                      <Pressable
                        style={[styles.field]}
                        onPress={() => setOpen(!open)}
                      >
                        <Text
                          style={[
                            styles.inputText,
                            open === false && { color: "#222" },
                          ]}
                          numberOfLines={1}
                        >
                          {
                            locationObject ? locationObject?.location_name : "Select"
                          }
                        </Text>
                        <DateDropDownIcon />
                      </Pressable>
                    </View>
                  </Pressable>
              }

              {
                // open && data?.mode != 'child' && <LocationSelector />
                open && data?.mode != 'child' &&
                <LocationPickerModal
                  visible={open}
                  onClose={() => setOpen(false)}
                  comingFrom="createAsset"
                />
                // <LocationSelector />
              }

              {
                data?.mode === 'child' &&
                <View
                  style={[
                    styles.locationSelector
                  ]}
                >
                  <View style={styles.labelContainer}>
                    <Text style={styles.labelText}>Parent Asset</Text>
                    <Text style={styles.asterisk}>*</Text>
                  </View>

                  <View
                    style={[styles.field]}
                  >
                    <Text
                      style={[
                        styles.inputText,
                        { color: "#222" },
                      ]}
                      numberOfLines={1}
                    >
                      {
                        useCreateAssetStore.getState().parent_asset?.asset_name
                      }
                    </Text>
                  </View>
                </View>
              }

              {
                locationObject &&
                <FormField
                  label="Select users to assign to location"
                  type="new-user"
                  placeholder="User"
                  field="assigned_users"
                  router={router}
                  comingFrom="editAsset"
                  store={useCreateAssetStore}
                  setterName="setCreateAssetValue"
                  usersData={usersMappedToLocation}
                />
              }

              {
                data?.mode === 'child' &&
                <FormField
                  label="Circuit Type"
                  type="dropdown"
                  field="asset_build_type"
                  options={["Electric", "Non Electric"]}
                  store={useCreateAssetStore}
                  setterName="setCreateAssetValue"
                  styles={{ paddingHorizontal: 25 }}
                />
              }

              <FormField
                label="Manufacturer"
                required={false}
                placeholder="Enter Manufacturer"
                field="manufacturer"
                store={useCreateAssetStore}
                setterName="setCreateAssetValue"
                styles={{ paddingHorizontal: 25 }}
              />

              <FormField
                label="Model"
                required={false}
                placeholder="Enter Model"
                field="model"
                store={useCreateAssetStore}
                setterName="setCreateAssetValue"
                styles={{ paddingHorizontal: 25 }}
              />

              <FormField
                label="Year"
                required={false}
                placeholder="Enter Year"
                field="year"
                store={useCreateAssetStore}
                setterName="setCreateAssetValue"
                styles={{ paddingHorizontal: 25 }}
              />

              <FormField
                label="Description"
                required={false}
                placeholder="Enter Description"
                field="description"
                store={useCreateAssetStore}
                setterName="setCreateAssetValue"
                styles={{ paddingHorizontal: 25 }}
              />

              <FormField
                label="Attachments"
                type="attachments"
                placeholder=""
                field="attachments"
                router={router}
                required={false}
                comingFrom="createAsset"
                store={useCreateAssetStore}
                setterName="setCreateAssetValue"
              />

              {
                useCreateAssetStore.getState().attachments.length > 0 &&
                <View style={{ backgroundColor: 'transparent', padding: 10, marginHorizontal: 20, alignItems: 'flex-start' }}>
                  <View style={{ position: "relative" }}>

                    <Image
                      source={{
                        uri: `${endpoints.baseURL}assets/${useCreateAssetStore.getState().attachments[0].image_path}?t=${Date.now()}`
                      }}
                      style={{ width: 200, height: 200, borderRadius: 8 }}
                    />

                    <TouchableOpacity
                      onPress={() => {
                        setCreateAssetValue("attachments", [])
                      }}
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        backgroundColor: "#000",
                        borderRadius: 12,
                        padding: 4,
                      }}
                    >
                      <Feather name="x" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              }

              <TouchableOpacity style={[styles.createBtn, { marginBottom: insets.bottom + 60 }]} onPress={handleEditAsset}>
                <Text style={styles.createBtnText}>
                  {
                    loading ?
                      <ActivityIndicator size={"small"} color={"#fff"} />
                      :
                      "Update Asset"
                  }
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color="#742BDE" />
              <Text style={styles.loadingText}>Loading asset details...</Text>
            </View>
          )
        }

      </ScrollView>
    </KeyboardAwareScrollView>
  )
}

export default editAsset;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "red",
    backgroundColor: "#f9f9ff",
  },
  locationSelector: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  labelText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    lineHeight: 20,
    color: "#1C1C1C",
  },
  asterisk: {
    color: "#D63928",
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginTop: -3,
    marginLeft: 2,
  },
  field: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E1E8EE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputText: {
    paddingVertical: 10,
    fontSize: 12,
    color: "#1C1C1C",
    fontFamily: Fonts.light,
  },
  createBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#742BDE",
    justifyContent: "center",
    gap: 5,
    marginTop: 15,
    marginHorizontal: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 5,
    elevation: 5,
    shadowColor: "rgba(116, 43, 222, 0.80)",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.60,
    shadowRadius: 2,
    marginBottom: 15,
  },
  createBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Fonts.regular,
    lineHeight: 18,
  },
  loadingState: {
    paddingTop: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: Fonts.regular,
  },
})
