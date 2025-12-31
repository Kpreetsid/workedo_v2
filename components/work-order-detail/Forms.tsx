import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { WorkOrder } from '@/src/types/workOrder';

interface Props {
    params: WorkOrder;
}

const Forms = ({ params }: Props) => {
  return (
    <View>
      <Text>Forms</Text>
    </View>
  )
}

export default Forms

const styles = StyleSheet.create({})