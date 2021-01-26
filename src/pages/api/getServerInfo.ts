import { NextApiHandler } from "next";
import os from "os";

export type ServerInfoType = {
  clusters: number;
  cpus: number;
};

const index: NextApiHandler = async (_, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify(
      {
        clusters: Number(process.env.CLUSTERS) ?? 1,
        cpus: os.cpus().length,
      },
      undefined,
      "  "
    )
  );
};
export default index;
