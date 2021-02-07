import { useRef, useState } from "react";
import { ServerInfoType } from "../pages/api/getServerInfo";
import { getServerInfo } from "../libs";

export const Cluster = ({
  info,
  onCluster,
}: {
  info: ServerInfoType;
  onCluster: () => void;
}) => {
  const [reload, setReload] = useState(false);
  const value = useRef(info.clusters);
  return (
    <table className="root">
      <style jsx>{`
        .root {
          width: 300px;
          border: solid 1px;
          padding: 4px;
        }
        .title {
          background: #eeeeee;
        }
        td:nth-child(2) {
          text-align: right;
        }
        button {
          width: 100%;
        }
      `}</style>
      <tbody>
        <tr>
          <th colSpan={2} className="title">
            現在の設定
          </th>
        </tr>
        <tr>
          <td>搭載CPU</td>
          <td>{info.cpus}</td>
        </tr>
        <tr>
          <td>Policy</td>
          <td>{info.policy}</td>
        </tr>
        <tr>
          <td>プロセス数</td>
          <td>
            {" "}
            <input
              defaultValue={info.clusters}
              onChange={(e) => (value.current = Number(e.target.value))}
            />
          </td>
        </tr>
        <tr>
          <td colSpan={2}>
            <button
              disabled={reload}
              onClick={async () => {
                if (!isNaN(value.current)) {
                  setReload(true);
                  await fetch(`/set/${value.current}`, { method: "post" });
                  for (let i = 0; i < 20; i++) {
                    const info = await getServerInfo();
                    if (info?.clusters === value.current) break;
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                  }
                  setReload(false);
                  onCluster();
                }
              }}
            >
              設定{reload && "中"}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};
