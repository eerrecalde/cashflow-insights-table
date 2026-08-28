import { CashflowDataState } from "@/features/cashflow/CashflowDataState";

import { Providers } from "./providers";

export default function Home() {
  return (
    <div className="flex flex-1 bg-zinc-50 font-sans">
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <Providers>
          <CashflowDataState />
        </Providers>
      </main>
    </div>
  );
}
