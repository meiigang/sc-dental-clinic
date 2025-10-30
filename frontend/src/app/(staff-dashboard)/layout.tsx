import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "@/styles/globals.css";
import NavbarStaff from "@/components/NavbarStaff";
import { NotificationProvider } from '@/context/useNotificationContext';

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"], // Choose weights you need
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "SC Dental Clinic",
  description: "Your trusted dental care provider in Davao",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased bg-background`}>
        <NotificationProvider>
          <NavbarStaff />
          {children}
        </NotificationProvider>    
      </body>
    </html>
  );
}