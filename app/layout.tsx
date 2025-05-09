import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Job Worth Calculator",
    template: "%s | Job Worth Calculator"
  },
  alternates: {
    languages: {
      "en-US": "/en",
      "zh-CN": "/",
    },
  },
  description: "这b班上得值不值 - 计算你的工作性价比 | Job Worth Calculator - Calculate your job's value",
  verification: {
    google: "_OQGiIpYz87USAsgJV2C07-JJhQ8myV_4GoM1kDjFic",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="_OQGiIpYz87USAsgJV2C07-JJhQ8myV_4GoM1kDjFic" />
        <meta name="baidu-site-verification" content="codeva-pEoMg5F0Cv" />
        <script async src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <div className="pb-8"></div>
        <footer className="w-full py-3 border-t bg-white/90 dark:bg-gray-900/80 dark:border-gray-800/50">
          {/* <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-center items-center gap-6 mb-2">
              <a 
                href="https://offerselect.zippland.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col items-center"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-sm transform transition-all duration-200 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs mt-1.5 text-gray-700 dark:text-gray-300 font-medium">OfferSelect</span>
              </a>
              
              <a 
                href="https://citycompare.zippland.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col items-center"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 shadow-sm transform transition-all duration-200 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <span className="text-xs mt-1.5 text-gray-700 dark:text-gray-300 font-medium">城市对比</span>
              </a>
              
              <a 
                href="https://snapsolver.zippland.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col items-center"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm transform transition-all duration-200 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs mt-1.5 text-gray-700 dark:text-gray-300 font-medium">AI笔试</span>
              </a>
              
              <a 
                href="https://perlerbeads.zippland.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col items-center"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-blue-400 shadow-sm transform transition-all duration-200 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <span className="text-xs mt-1.5 text-gray-700 dark:text-gray-300 font-medium">拼豆图纸</span>
              </a>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-gray-400 dark:text-gray-500">更多实用工具 by zippland.com</span>
            </div>
          </div> */}
        </footer>
      </body>
    </html>
  );
}
