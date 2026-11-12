import React from 'react';

export function WebsiteSkeleton() {
  return (
    <div className="w-full space-y-12 pb-20 animate-pulse select-none">
      {/* 1. Hero Banner Skeleton (Edge-to-Edge Gold Banner) */}
      <section className="relative w-full bg-[#E6A500] overflow-hidden min-h-[480px] lg:min-h-[540px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-[#E6A500] via-[#E6A500]/90 to-amber-300/40" />

        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Badges, Title, Subtitle, CTA buttons */}
          <div className="lg:col-span-7 space-y-6">
            <div className="h-6 w-36 bg-black/20 rounded-md" />
            <div className="space-y-3">
              <div className="h-10 sm:h-12 w-4/5 bg-black/25 rounded-lg" />
              <div className="h-10 sm:h-12 w-3/5 bg-black/25 rounded-lg" />
            </div>
            <div className="space-y-2.5 max-w-xl pt-2">
              <div className="h-4 w-full bg-black/15 rounded" />
              <div className="h-4 w-5/6 bg-black/15 rounded" />
              <div className="h-4 w-2/3 bg-black/15 rounded" />
            </div>
            <div className="flex items-center gap-4 pt-4">
              <div className="h-12 w-40 bg-black/30 rounded-full" />
              <div className="h-12 w-36 bg-black/15 rounded-full" />
            </div>
          </div>

          {/* Right Column: Hero Image Showcase Placeholder */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-lg aspect-[4/3] rounded-2xl bg-black/15 border-4 border-white/60 shadow-sm" />
          </div>
        </div>
      </section>

      {/* 2. Feature / About Us Highlight Box Skeleton */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white border-2 border-[#E6A500]/30 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-5">
          <div className="h-6 w-32 bg-neutral-200 rounded-md" />
          <div className="h-8 sm:h-10 w-3/4 max-w-xl bg-neutral-200 rounded-lg" />
          <div className="w-24 h-1 bg-[#E6A500]/40 rounded-full" />
          <div className="space-y-2 w-full max-w-2xl pt-2">
            <div className="h-4 w-full bg-neutral-100 rounded" />
            <div className="h-4 w-5/6 mx-auto bg-neutral-100 rounded" />
            <div className="h-4 w-2/3 mx-auto bg-neutral-100 rounded" />
          </div>
          <div className="h-11 w-36 bg-neutral-200 rounded-full mt-2" />
        </div>
      </section>

      {/* 3. Cards Grid Skeleton (e.g. Programs / Resources / Publications) */}
      <section className="max-w-7xl mx-auto px-4 space-y-8 pt-4">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="h-6 w-40 mx-auto bg-neutral-200 rounded-md" />
          <div className="h-9 w-72 mx-auto bg-neutral-200 rounded-lg" />
          <div className="w-20 h-1 bg-[#E6A500]/40 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="h-[430px] rounded-2xl border-2 border-neutral-200 bg-white p-5 flex flex-col justify-between space-y-4"
            >
              <div className="w-full h-52 bg-neutral-200 rounded-xl" />
              <div className="space-y-3 flex-1">
                <div className="h-5 w-24 bg-amber-100 rounded" />
                <div className="h-6 w-4/5 bg-neutral-200 rounded" />
                <div className="space-y-2 pt-1">
                  <div className="h-4 w-full bg-neutral-100 rounded" />
                  <div className="h-4 w-3/4 bg-neutral-100 rounded" />
                </div>
              </div>
              <div className="h-10 w-28 bg-neutral-200 rounded-lg" />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Bottom Metrics / Indicators Strip Skeleton */}
      <section className="max-w-7xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 py-6 border-y border-neutral-100">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="flex flex-col items-center justify-center space-y-2 p-2">
              <div className="w-10 h-10 rounded-full bg-neutral-200" />
              <div className="h-7 w-20 bg-neutral-200 rounded-md" />
              <div className="h-4 w-16 bg-neutral-100 rounded" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
export default WebsiteSkeleton;

