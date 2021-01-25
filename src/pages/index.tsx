import React, { useEffect, useState } from "react";
import * as os from "os";

type FetchState = (value: {
  state: "processing" | "finished";
  finishCount: number;
  errorCount: number;
}) => void;

const attack = async (count: number, onState: FetchState) => {
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

type History = {
  clusters: number;
  cpus: number;
  time: number;
};

interface Props {
  clusters: number;
  cpus: number;
}

export const Page = ({ clusters, cpus }: Props) => {
  const [state, setState] = useState<Parameters<FetchState>[0]>();
  const [time, setTime] = useState<number[]>();
  const [historys, setHistorys] = useState<History[]>();
  const onState: FetchState = (value) => {
    setState(value);
    const now = performance.now();
    setTime((time) => {
      if (value.state === "finished") {
        const h = JSON.parse(localStorage.getItem("history") || "[]");
        const historyArray = [...h, { clusters, cpus, time: now - time[0] }];
        localStorage.setItem("history", JSON.stringify(historyArray));
        setHistorys(historyArray);
      }
      return [time[0], now];
    });
  };
  useEffect(() => {
    const h = localStorage.getItem("history");
    h && setHistorys(JSON.parse(h));
  }, []);
  return (
    <>
      <button
        onClick={() => {
          if (state?.state !== "processing") {
            attack(100, onState);
            setTime(Array(2).fill(performance.now()));
          }
        }}
      >
        開始
      </button>
      <div>
        CPU: {clusters}/{cpus}
      </div>
      <div>{time && `${Math.floor(time[1] - time[0]).toLocaleString()}ms`}</div>
      <div>{JSON.stringify(state)}</div>
      <hr />
      {historys
        ?.slice()
        .reverse()
        .map((history, index) => (
          <div key={index}>
            CPU:{history.clusters}/{history.cpus} TIME:
            {Math.floor(history.time).toLocaleString()}ms
          </div>
        ))}
    </>
  );
};

export default Page;

export const getServerSideProps = () => {
  return {
    props: {
      clusters: process.env.CLUSTERS ?? 0,
      cpus: os.cpus().length,
    },
  };
};
