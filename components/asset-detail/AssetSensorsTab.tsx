import { Text, TouchableOpacity } from "react-native";

export default function AssetSensorsTab() {

    const createEndpoint = () => {
        console.log("Create new Endpoint");
    }
    
    return (
        <>
        <TouchableOpacity onPress={createEndpoint}>
            <Text>Create new Endpoint</Text>
        </TouchableOpacity>
        </>
    )
}