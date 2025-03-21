import "./globals.css";
import ThemeProvider from './components/ThemeProvider'; 

export const metadata = {
  title: "Blog Hoshizora",
  description: "Generated by Jiranon-K",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}