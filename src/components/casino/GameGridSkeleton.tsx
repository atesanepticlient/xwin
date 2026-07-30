const GameGridSkeleton: React.FC = () => {
  const skeletonItems = Array.from({ length: 12 });

  return (
    <div className="grid grid-rows-2 grid-flow-col auto-cols-[150px] gap-[6px] overflow-hidden">
      {skeletonItems.map((_, index) => (
        <div
          key={index}
          className="w-[150px] overflow-hidden rounded-md bg-[#232527] shadow-md"
        >
          {/* Changed to aspect-square to match the 1:1 image height */}
          <div className="aspect-square w-full animate-pulse bg-zinc-700/60" />

          {/* Skeleton Bottom Bar */}
          <div className="flex items-center justify-between bg-[#2d3034] px-2.5 py-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded bg-zinc-600" />
              <div className="h-3 w-20 animate-pulse rounded bg-zinc-600" />
            </div>
            <div className="h-3.5 w-3.5 animate-pulse rounded-full bg-zinc-600" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameGridSkeleton