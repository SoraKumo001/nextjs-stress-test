import { ServerInfoType } from "../pages/api/getServerInfo";

export type AttackState = (value: {
  state: "processing" | "finished";
  finishCount: number;
  errorCount: number;
}) => void;

export const attack = async (count: number, onState: AttackState) => {
  let finishCount = 0;
  let errorCount = 0;
  for (let i = 0; i < count; i++) {
    await Promise.all(
      Array(100)
        .fill(null)
        .map(() =>
          fetch("/api", { cache: "no-store" })
            .then(() => {
              finishCount++;
            })
            .catch(() => {
              errorCount++;
            })
        )
    );
    onState({ state: "processing", finishCount, errorCount });
  }
  onState({ state: "finished", finishCount, errorCount });
};

export const getServerInfo = () =>
  fetch("/api/getServerInfo", { method: "post" })
    .then(async (value) => {
      return (await value.json()) as ServerInfoType;
    })
    .catch(() => null);
