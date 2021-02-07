import { ServerInfoType } from "../pages/api/getServerInfo";

export type AttackState = (value: {
  state: "processing" | "finished";
  finishCount: number;
  errorCount: number;
  clusterCount: number[];
}) => void;

export const attack = async (
  count: number,
  serverInfo: ServerInfoType,
  onState: AttackState
) => {
  let finishCount = 0;
  let errorCount = 0;
  const clusterCount = Array(serverInfo.clusters).fill(0);
  for (let i = 0; i < count; i++) {
    await Promise.all(
      Array(100)
        .fill(null)
        .map(() =>
          fetch("/api", { cache: "no-store" })
            .then((res) => res.json())
            .then(({ INDEX }) => {
              ++clusterCount[INDEX];
              finishCount++;
            })
            .catch(() => {
              errorCount++;
            })
        )
    );
    onState({ state: "processing", finishCount, errorCount, clusterCount });
  }
  onState({ state: "finished", finishCount, errorCount, clusterCount });
};

export const getServerInfo = () =>
  fetch("/api/getServerInfo", { method: "post" })
    .then((res) => res.json())
    .then((value) => {
      return value as ServerInfoType;
    })
    .catch(() => null);
