import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import DropDownInput from '../create-screens/DropDownInput'
import { useWorkOrderStore } from '@/src/store/useWorkOrderStore'
import { getSOPs } from '@/src/services/preventive.service'
import FormInput from '../create-screens/FormInput'
import DynamicForm from './DynamicForm'
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller'

const FormsScreen = () => {
  const [forms, setForms] = useState<any>([]);
  const [selectedForm, setSelectedForm] = useState<any>();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await getSOPs();
        if (res?.status) {
          console.log('res?.data - ', res.data);
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
    console.log('selected form = ', selectedForm);
  }, [selectedForm])

  return (
    <KeyboardAwareScrollView bottomOffset={30}>
      <ScrollView>
        <DropDownInput
          label="Form"
          field="sop_form_id"
          containerStyle={{ paddingHorizontal: 25 }}
          store={useWorkOrderStore}
          options={forms?.map((form: any) => form.name)}
          displayKey="name"
          required={false}
          onSelect={(val) => {
            console.log('form selected = ', val);
            setSelectedForm(forms?.find((f: any) => f.name === val))
            useWorkOrderStore.getState().setWorkForm("sop_form_id", val)
          }}
        />

        {
          selectedForm &&
          <View style={styles.container}>
            <FormInput
              label="Name"
              value={selectedForm?.name}
              readOnly
            />

            <FormInput
              label="Category"
              value={selectedForm?.categoryId?.name}
              readOnly
            />

            <FormInput
              label="Location"
              value={selectedForm?.locationId?.location_name}
              readOnly
            />

            <FormInput
              label="Description"
              value={selectedForm?.description}
              readOnly
            />

            {
              selectedForm && <DynamicForm components={selectedForm?.json_temp?.components} />
            }
          </View>
        }
      </ScrollView>
    </KeyboardAwareScrollView>
  )
}

export default FormsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    backgroundColor: '#fff',
  },
})