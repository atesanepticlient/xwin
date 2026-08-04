import {
  TetherIcon,
  TronIcon,
  BitcoinIcon,
  EthIcon,
  UsdcIcon,
  OptimismIcon,
  ArbitrumIcon,
  AlgorandIcon,
} from "./icons";
import { PolygonHex, DashBadge, BinancePayLogo } from "./badges";

function SidePair({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="flex items-center">
      <div className="z-10 flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#f2f2f2]">
        {left}
      </div>
      <div className="-ml-3 flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#f2f2f2]">
        {right}
      </div>
    </div>
  );
}

function Badge({
  base,
  corner,
}: {
  base: React.ReactNode;
  corner: React.ReactNode;
}) {
  return (
    <div className="relative flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#f2f2f2]">
      {base}
      <div className="absolute -bottom-1 -right-1 flex h-[20px] w-[20px] items-center justify-center rounded-full ring-2 ring-white">
        {corner}
      </div>
    </div>
  );
}

function Single({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#f2f2f2]">
      {children}
    </div>
  );
}

export default function PaymentMethods() {
  return (
    <div className="w-full rounded-2xl bg-white px-4 py-6 sm:px-6 sm:py-7">
      <div className="flex flex-wrap items-center justify-between gap-y-6">
        <BinancePayLogo />
        <SidePair left={<TetherIcon />} right={<TronIcon />} />
        <SidePair left={<TetherIcon />} right={<PolygonHex />} />
        <Single>
          <BitcoinIcon />
        </Single>
        <Single>
          <TronIcon />
        </Single>
        <Single>
          <PolygonHex />
        </Single>
        <Badge base={<EthIcon />} corner={<DashBadge size={20} />} />
        <Badge base={<UsdcIcon />} corner={<DashBadge size={20} />} />
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-6">
        <Badge base={<EthIcon />} corner={<OptimismIcon size={20} />} />
        <Badge base={<TetherIcon />} corner={<OptimismIcon size={20} />} />
        <Badge base={<UsdcIcon />} corner={<OptimismIcon size={20} />} />
        <Badge base={<EthIcon />} corner={<ArbitrumIcon size={20} />} />
        <Badge base={<TetherIcon />} corner={<ArbitrumIcon size={20} />} />
        <Badge base={<UsdcIcon />} corner={<ArbitrumIcon size={20} />} />
        <div className="flex h-[42px] w-[42px] items-center justify-center">
          <AlgorandIcon size={24} />
        </div>
      </div>
    </div>
  );
}
