// components/OfflineScreen.tsx
"use client";

export default function OfflineScreen() {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80">
      <div className="rounded-lg bg-white p-6 text-center">
        <h2 className="text-xl font-bold">No Internet Connection</h2>
        <p className="mt-2 text-gray-600">
          Please check your internet connection.
        </p>
      </div>
    </div>
  );
}
