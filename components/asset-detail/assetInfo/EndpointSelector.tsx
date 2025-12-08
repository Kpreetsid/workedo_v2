import { View } from "react-native";
import SelectEndpoint from "@/components/asset-detail/SelectEndpoint";
import { AssetEndpoint } from "@/src/types/assetEndpoint";
import { Asset } from "@/src/types/asset";

type EndpointSelectorProps = {
  endpoints: AssetEndpoint[];
  endpointSelected: AssetEndpoint | null;
  asset: Asset;
  onSelect: (endpoint: AssetEndpoint | null) => void;
};

export default function EndpointSelector({
  endpoints,
  endpointSelected,
  asset,
  onSelect
}: EndpointSelectorProps) {
  return (
    <View style={{ marginTop: 10 }}>
      <SelectEndpoint
        endpoints={endpoints}
        endpointSelected={endpointSelected}
        asset_data={asset}
        onEndpointSelect={onSelect}
      />
    </View>
  );
}
