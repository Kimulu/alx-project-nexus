import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/layout/Layout";
import { JobsProvider } from "@/context/JobsContext";
import { FirebaseProvider } from "@/context/FirebaseContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <FirebaseProvider>
      <JobsProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </JobsProvider>
    </FirebaseProvider>
  );
}
