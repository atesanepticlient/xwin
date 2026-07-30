import { INTERNAL_SERVER_ERROR } from "@/error";
import { fetchGamesList } from "@/provider/fetchGamesList";

export const GET = async () => {
  try {
    console.log("Called");

    const games = await fetchGamesList({
      consumerId: +process.env.B2B_CONSUMER_ID!,
    });

    console.log({ games });

    return Response.json({ payload: games });
  } catch {
    return Response.json({ message: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
