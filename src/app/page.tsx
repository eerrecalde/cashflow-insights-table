import { CashflowDataState } from "@/features/cashflow/components/CashflowDataState";

import { Providers } from "./providers";

export default function Home() {
  return (
    <div className="flex flex-1 bg-slate-50 font-sans">
      <main className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8">
        <Providers>
          <CashflowDataState />
        </Providers>
      </main>
    </div>
  );
}
