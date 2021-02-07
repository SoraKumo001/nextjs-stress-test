import { NextApiHandler } from "next";

const index: NextApiHandler = async (_, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  JSON.stringify(Array(10000).fill("負荷テスト"));
  res.end(
    JSON.stringify(
      {
        INDEX: Number(process.env.INDEX),
      },
      undefined,
      "  "
    )
  );
};
export default index;
