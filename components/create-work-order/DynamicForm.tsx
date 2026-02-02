import { useState } from "react";
import { View, Text, TextInput, Switch, StyleSheet, ToastAndroid } from "react-native";
import FormInput from "../create-screens/FormInput";
import ActionButton from "../create-screens/ActionButton";

const DynamicForm = ({ components }: any) => {
  const [formValues, setFormValues] = useState<any>({});

  const handleChange = (key: any, value: any) => {
    setFormValues((prev: any) => ({ ...prev, [key]: value }));
  };

  const handlePress = () => {
    console.log('handle press = ', formValues)
    ToastAndroid.show("Submission Complete.", ToastAndroid.SHORT)
  }

  const renderField = (field: any) => {
    switch (field.type) {
      case "textfield":
        return (
          <View key={field.key} style={{ marginBottom: 0 }}>
            <FormInput
              label={field.label ? field.label : null}
              value={formValues[field.key] || ""}
              onChangeText={(text: any) => handleChange(field.key, text)}
              required={false}
            />
          </View>
        );

      case "checkbox":
        return (
          <View
            key={field.key}
            style={{
              marginHorizontal: 25, backgroundColor: '#fff', padding: 10, borderRadius: 12,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderColor: "#E1E8EE", flexDirection: "row", alignItems: "center", marginBottom: 0
            }}
          >
            <Switch
              value={!!formValues[field.key]}
              onValueChange={(val) => handleChange(field.key, val)}
            />
            <Text style={{ marginLeft: 10 }}>{field.label}</Text>
          </View>
        );

      case "button":
        return (
          <ActionButton key={field.key} onPress={handlePress} label={field.label} buttonStyle={styles.submitBtn} />
        );

      default:
        return null;
    }
  };

  return <View style={styles.container}>{components.map(renderField)}</View>;
};

export default DynamicForm;

const styles = StyleSheet.create({
  container: {

  },
  submitBtn: {

  },
})