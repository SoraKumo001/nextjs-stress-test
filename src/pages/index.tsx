import React, { useEffect, useState } from "react";
import * as os from "os";
import { ServerInfoType } from "./api/getServerInfo";
import { attack, AttackState, getServerInfo } from "../libs";
import { Cluster } from "../components/cluster";

type History = {
  clusters: number;
  cpus: number;
  time: number;
  policy: string;
  clusterCount: number[];
};

export const Page = (props: ServerInfoType) => {
  const [serverInfo, setServerInfo] = useState<ServerInfoType>(props);
  const [state, setState] = useState<Parameters<AttackState>[0]>();
  const [time, setTime] = useState<number[]>();
  const [historys, setHistorys] = useState<History[]>();

  const onState: AttackState = (value) => {
    setState(value);
    const now = performance.now();
    setTime((time) => {
      if (value.state === "finished") {
        const h = JSON.parse(localStorage.getItem("history") || "[]");
        const historyArray = [
          ...h,
          {
            clusters: serverInfo.clusters,
            cpus: serverInfo.cpus,
            clusterCount: value.clusterCount,
            policy: serverInfo.policy,
            time: now - time[0],
          },
        ];
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
    <div className="root">
      <style jsx>{`
        .button {
          margin-left: 8px;
        }
      `}</style>
      <Cluster
        info={serverInfo}
        onCluster={() => {
          getServerInfo().then((value) => setServerInfo(value));
        }}
      />
      <hr />
      <button
        onClick={() => {
          if (state?.state !== "processing") {
            attack(100, serverInfo, onState);
            setTime(Array(2).fill(performance.now()));
          }
        }}
      >
        テスト開始
      </button>
      <div>
        {time && `${Math.floor(time[1] - time[0]).toLocaleString()}ms `}
        <pre>{JSON.stringify(state, undefined, "  ")}</pre>
      </div>
      <hr />
      <div>
        <div>
          履歴
          <button
            className="button"
            onClick={() => {
              localStorage.removeItem("history");
              setHistorys([]);
            }}
          >
            Clear
          </button>
        </div>
        {historys
          ?.slice()
          .reverse()
          .map((history, index) => (
            <div key={index}>
              CPU:{history.clusters}/{history.cpus} TIME:
              {Math.floor(history.time).toLocaleString()}ms Policy:
              {history.policy} Clusters:
              {JSON.stringify(history.clusterCount)}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Page;

export const getServerSideProps = () => {
  return {
    props: {
      clusters: Number(process.env.CLUSTERS) ?? 1,
      cpus: os.cpus().length,
      policy: process.env.NODE_CLUSTER_SCHED_POLICY,
    },
  };
};
