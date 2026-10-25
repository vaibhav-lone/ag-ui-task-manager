import { Providers } from "./providers";
import "@copilotkit/react-core/v2/styles.css";
import "./globals.css";
import { Suspense } from "react";

export default function RootLayout({ children, }: { children: React.ReactNode; }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Suspense fallback={<div className="min-h-screen bg-[#f6f7f9]" />}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}