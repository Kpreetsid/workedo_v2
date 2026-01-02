import AssignedUsersModal from "@/components/work-order-detail/AssignUserModal";
import { useState } from "react";
import AssetUserInfo from "../AssetUserInfo";

type AssetUsersProps = {
  users: any[];
};

export default function AssetUsers({ users }: AssetUsersProps) {
  // console.log('users = ', users);
  const [visible, setVisible] = useState(false);

  return (
    <>
      <AssetUserInfo users={users} onPress={() => setVisible(true)} />

      <AssignedUsersModal
        visible={visible}
        onClose={() => setVisible(false)}
        users={users}
      />
    </>
  );
}
