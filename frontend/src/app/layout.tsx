import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeContext"
import { ExecutionLogProvider } from "@/context/ExecutionLogContext"

export const metadata = {
  title: "FlowCraft — Workflow Automation",
  description: "Build, manage, and execute powerful workflow automations with a premium visual interface.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="min-h-screen bg-transparent text-[var(--text-primary)]">
          <ThemeProvider>
            <AuthProvider>
              <ExecutionLogProvider>{children}</ExecutionLogProvider>
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  )
}
