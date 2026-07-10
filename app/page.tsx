import { Waitlist } from "@/components/waitlist";

export default function HomePage() {
  return (
    <section className="relative mx-auto h-[calc(100svh-7.25rem)] w-full overflow-hidden px-3 pb-5 pt-4 sm:h-[calc(100svh-8rem)] sm:px-6 sm:pb-7 sm:pt-5">
      <div className="relative mx-auto flex h-full w-full flex-col items-center text-center">
        <img
          src="/logoword.png"
          alt="launcher"
          className="relative z-10 w-full max-w-[14rem] object-contain mix-blend-multiply sm:max-w-[17rem]"
        />

        <figure className="pointer-events-none absolute left-1/2 bottom-20 top-8 z-0 w-screen -translate-x-1/2 overflow-hidden bg-white sm:bottom-24 sm:top-8">
          <video
            aria-label="Launcher black hole animation"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="h-full w-full scale-[1.14] rotate-[-5deg] bg-white object-cover"
            style={{ filter: "invert(1) grayscale(1) contrast(1.25)" }}
          >
            <source src="/blackhole.webm" type="video/webm" />
          </video>
        </figure>

        <div className="relative z-10 mb-6 mt-auto w-full max-w-[29rem] pt-2 sm:mb-8">
          <Waitlist />
        </div>

      </div>
    </section>
  );
}
