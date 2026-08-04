import Pusher from "pusher";

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Fire notification to the admin channel!
// await pusher.trigger("admin-channel", "new-notification", {
//   id: deposit.id,
//   type: "DEPOSIT",
//   title: "New Deposit Request",
//   description: `User deposited $${amount}`,
//   createdAt: new Date().toISOString(),
//   link: "/admin/deposits",
// });
