import { requireUser } from "@/lib/dal";
import { getBlocks } from "@/lib/queries/blocks";
import { BlocksClient } from "./blocks-client";

export default async function BlocksPage() {
  const user = await requireUser();
  const blocks = await getBlocks(user.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <BlocksClient initialBlocks={blocks} />
    </div>
  );
}
