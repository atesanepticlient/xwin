import "./globals.css";

export const metadata = {
  title: "Deposit Bonus",
  description: "100% bonus on your 1st deposit",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
