import type { Metadata } from "next";
import Reader from "./Reader";

export const metadata: Metadata = {
  title: "Fluency Secrets",
  description:
    "Como colocar o inglês no automático do seu cérebro e parar de depender da tradução mental.",
  robots: { index: false, follow: false },
};

export default function FluencySecretsPage() {
  return <Reader />;
}

