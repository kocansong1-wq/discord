import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { ModalProvider } from "@/components/providers/modal-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import { PresenceProvider } from "@/components/providers/presence-provider";
import { VoiceProvider } from "@/components/providers/voice-provider";
import QueryProvider from "@/components/providers/query-provider";
import "react-toastify/dist/ReactToastify.css";
import { Open_Sans } from "next/font/google";
import { ToastContainer } from "react-toastify";

const openSans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Discord Clone",
  description:
    "Discord Clone with Next.js, React.js, TailWindCSS & TypeScript.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={cn(openSans.className, "bg-white dark:bg-[#313338]")}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            storageKey="discord-clone-theme"
          >
            <SocketProvider>
              <VoiceProvider>
                <PresenceProvider>
                  <ModalProvider />
                  <QueryProvider>
                    <ToastContainer position="top-right" autoClose={3000} />
                    {children}
                  </QueryProvider>
                </PresenceProvider>
              </VoiceProvider>
            </SocketProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
