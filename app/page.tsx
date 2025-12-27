"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import clsx from "clsx";

const reasons = [
  "Your smile brightens my darkest days",
  "You make ordinary moments magical",
  "We laugh at the same silly things",
  "I admire your strength and kindness",
  "With you, I feel at home",
];

export default function Home() {
  const [hasSaidYes, setHasSaidYes] = useState(false);
  const [hoverOffset, setHoverOffset] = useState({ x: 0, y: 0 });
  const noBtnRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const quotes = [
    "I choose you. And I'll choose you, over and over.",
    "Every love story is beautiful, but ours is my favorite.",
    "You are my today and all of my tomorrows.",
    "In a sea of people, my eyes always search for you.",
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [greeting, setGreeting] = useState("");
  const [loveLevel, setLoveLevel] = useState(80);
  const [targetDate] = useState<Date | null>(() => {
    // Only define after client mount to avoid hydration issues
    if (typeof window === "undefined") return null;
    // A special countdown target (customize as needed)
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  });
  const [countdown, setCountdown] = useState<{days:number;hours:number;mins:number;secs:number}>({days:0,hours:0,mins:0,secs:0});
  const [wishes, setWishes] = useState<string[]>([]);
  const [wishText, setWishText] = useState("");
  const [polaroids] = useState(
    () => [
      { id: 1, title: "Us", img: "https://picsum.photos/seed/love1/400/300", x: -40, y: 0, r: -4 },
      { id: 2, title: "Smile", img: "https://picsum.photos/seed/love2/400/300", x: 20, y: 10, r: 3 },
      { id: 3, title: "Adventure", img: "https://picsum.photos/seed/love3/400/300", x: -10, y: -20, r: 6 },
    ]
  );
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSaidYes) return;
    const burst = () => {
      confetti({ particleCount: 140, spread: 80, startVelocity: 45, origin: { y: 0.7 } });
      setTimeout(() => confetti({ particleCount: 100, spread: 120, origin: { y: 0.3 } }), 350);
      setTimeout(() => confetti({ particleCount: 180, spread: 100, scalar: 1.2 }), 800);
    };
    burst();
    const t = setInterval(burst, 1500);
    return () => clearInterval(t);
  }, [hasSaidYes]);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(id);
  }, [quotes.length]);

  // Typewriter greeting (client only)
  useEffect(() => {
    const text = "Hi Anitha, it’s me, Kaviraj — I love you.";
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setGreeting(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Countdown to target date
  useEffect(() => {
    const tDate = targetDate;
    if (!tDate) return;
    function tick(date: Date) {
      const diff = Math.max(0, date.getTime() - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, mins, secs });
    }
    tick(tDate);
    const t = setInterval(() => tick(tDate), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  // Wish jar (localStorage)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("wishJar");
    if (raw) setWishes(JSON.parse(raw));
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("wishJar", JSON.stringify(wishes));
  }, [wishes]);

  function dodgeNoButton(event: React.MouseEvent) {
    const button = noBtnRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy) + 0.01;
    const repel = 120;
    const proposedMoveX = (-dx / distance) * repel + (Math.random() - 0.5) * 80;
    const proposedMoveY = (-dy / distance) * repel + (Math.random() - 0.5) * 80;

    const bounds = containerRef.current?.getBoundingClientRect();
    const margin = 12;
    const minLeft = (bounds ? bounds.left : 0) + margin;
    const maxLeft = (bounds ? bounds.right : window.innerWidth) - margin;
    const minTop = (bounds ? bounds.top : 0) + margin;
    const maxTop = (bounds ? bounds.bottom : window.innerHeight) - margin;

    let moveX = proposedMoveX;
    let moveY = proposedMoveY;
    if (rect.left + moveX < minLeft) moveX = minLeft - rect.left;
    if (rect.right + moveX > maxLeft) moveX = maxLeft - rect.right;
    if (rect.top + moveY < minTop) moveY = minTop - rect.top;
    if (rect.bottom + moveY > maxTop) moveY = maxTop - rect.bottom;

    setHoverOffset(({ x, y }) => ({ x: x + moveX, y: y + moveY }));
  }

  // Keep the "No" button within the viewport on resize as well
  useEffect(() => {
    function clampOnResize() {
      const button = noBtnRef.current;
      const bounds = containerRef.current?.getBoundingClientRect();
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const margin = 12;
      const minLeft = (bounds ? bounds.left : 0) + margin;
      const maxLeft = (bounds ? bounds.right : window.innerWidth) - margin;
      const minTop = (bounds ? bounds.top : 0) + margin;
      const maxTop = (bounds ? bounds.bottom : window.innerHeight) - margin;
      let adjustX = 0;
      let adjustY = 0;
      if (rect.left < minLeft) adjustX = minLeft - rect.left;
      if (rect.right > maxLeft) adjustX = Math.min(adjustX, maxLeft - rect.right);
      if (rect.top < minTop) adjustY = minTop - rect.top;
      if (rect.bottom > maxTop) adjustY = Math.min(adjustY, maxTop - rect.bottom);
      if (adjustX !== 0 || adjustY !== 0) {
        setHoverOffset(({ x, y }) => ({ x: x + adjustX, y: y + adjustY }));
      }
    }
    window.addEventListener("resize", clampOnResize);
    return () => window.removeEventListener("resize", clampOnResize);
  }, []);

  return (
    <div ref={containerRef} className="romance-bg relative min-h-[100svh] overflow-hidden flex flex-col items-center justify-center p-6">
      {isMounted && (
        <>
          {Array.from({ length: 18 }).map((_, i) => {
            const delay = Math.random() * 6;
            const left = 10 + Math.random() * 80;
            const duration = 9 + Math.random() * 8;
            const scale = 0.8 + Math.random() * 0.8;
            const color = ["#ff6b9e", "#ff85a1", "#ff99ac", "#ffbdde"][Math.floor(Math.random() * 4)];
            return (
              <span
                key={i}
                className="heart"
                style={{
                  left: `${left}%`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  transform: `rotate(45deg) scale(${scale})`,
                  background: color,
                }}
              />
            );
          })}
        </>
      )}

      <main className="z-10 w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur px-4 py-2 shadow">
            <FaHeart className="text-pink-500" />
            <span className="text-sm">From Kaviraj to Anitha</span>
          </div>

          <h1 className="mt-6 text-4xl sm:text-6xl font-semibold">
            Anitha, will you be mine forever?
          </h1>
          <p className="mt-3 text-base sm:text-lg opacity-90">
            I made this little site to ask the most important question.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 relative">
            <button
              onClick={() => setHasSaidYes(true)}
              className={clsx(
                "btn btn-lg rounded-full px-8 text-white shadow-lg",
                hasSaidYes ? "bg-green-500 hover:bg-green-600" : "bg-pink-500 hover:bg-pink-600"
              )}
            >
              Yes 💗
            </button>

            <motion.button
              ref={noBtnRef}
              onMouseEnter={dodgeNoButton}
              onMouseMove={dodgeNoButton}
              className="btn btn-outline btn-lg rounded-full px-8"
              animate={{ x: hoverOffset.x, y: hoverOffset.y }}
              transition={{ type: "spring", stiffness: 120, damping: 12 }}
            >
              No 🙈
            </motion.button>
          </div>

          <AnimatePresence>
            {hasSaidYes && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-10"
              >
                <div className="mockup-window border bg-white/60 dark:bg-white/10 backdrop-blur">
                  <div className="px-6 py-8">
                    <h2 className="text-2xl sm:text-3xl font-semibold">You said YES, Anitha! 🎉</h2>
                    <p className="mt-2 opacity-90">
                      I promise to love you, support you, and make you smile every day.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <section className="mt-14 grid sm:grid-cols-2 gap-4">
          <Card title="Our Story" icon={<FaRegHeart className="text-pink-500" />}> 
            From the moment we met, my world became brighter. Every day with you feels like a page in a fairytale I never want to end.
          </Card>
          <Card title="Reasons I Love You" icon={<FaHeart className="text-red-500" />}>
            <ul className="list-disc pl-5 space-y-1">
              {reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Card>
          <Card title="A Promise">
            I’ll stand by you in sun and in rain; in quiet mornings and loud adventures; for now and for always.
          </Card>
          <Card title="The Future">
            Let’s build a life full of kindness, laughter, and little moments that mean everything.
          </Card>
        </section>

        {/* Typewriter greeting */}
        <section className="mt-10 text-center">
          <p className="text-lg typewriter-caret">{greeting}</p>
        </section>

        {/* Love meter */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium">Love Meter</h3>
            <span className="font-semibold text-pink-600">{loveLevel}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={loveLevel}
            onChange={(e) => {
              const next = Number(e.target.value);
              setLoveLevel(next);
              confetti({ particleCount: 12 + Math.floor(next / 10), spread: 50, origin: { y: 0.9 } });
            }}
            className="range range-secondary mt-3"
          />
        </section>

        {/* Countdown */}
        <section className="mt-10">
          <h3 className="text-xl font-medium text-center">Countdown to our special day</h3>
          <div className="mt-3 stats shadow w-full">
            <div className="stat"><div className="stat-title">Days</div><div className="stat-value">{countdown.days}</div></div>
            <div className="stat"><div className="stat-title">Hours</div><div className="stat-value">{countdown.hours}</div></div>
            <div className="stat"><div className="stat-title">Minutes</div><div className="stat-value">{countdown.mins}</div></div>
            <div className="stat"><div className="stat-title">Seconds</div><div className="stat-value">{countdown.secs}</div></div>
          </div>
        </section>

        {/* Wish jar */}
        <section className="mt-10">
          <h3 className="text-xl font-medium">Wish Jar for Anitha</h3>
          <div className="join w-full mt-3">
            <input
              className="input input-bordered join-item w-full"
              placeholder="Write a little wish…"
              value={wishText}
              onChange={(e) => setWishText(e.target.value)}
            />
            <button
              className="btn btn-secondary join-item"
              onClick={() => {
                if (!wishText.trim()) return;
                setWishes((w) => [wishText.trim(), ...w].slice(0, 10));
                setWishText("");
              }}
            >
              Add
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {wishes.map((w, i) => (
              <li key={`${w}-${i}`} className="bg-white/70 dark:bg-white/10 backdrop-blur rounded-lg p-3">
                {w}
              </li>
            ))}
          </ul>
        </section>

        {/* Draggable polaroids */}
        <section className="mt-10">
          <h3 className="text-xl font-medium">Our Board</h3>
          <div className="relative h-[320px] mt-3">
            {polaroids.map((p) => (
              <motion.div
                key={p.id}
                drag
                dragMomentum={false}
                whileTap={{ scale: 1.03 }}
                className="polaroid absolute"
                style={{ left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)`, rotate: `${p.r}deg` as any }}
              >
                <img src={p.img} alt={p.title} />
                <div className="mt-2 text-center font-medium">{p.title}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Simple love quiz */}
        <section className="mt-10">
          <h3 className="text-xl font-medium">How well do you know me?</h3>
          <p className="opacity-80">What is my favorite way to spend a Sunday with you?</p>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            {["Long walks", "Movie + snacks", "Cooking together", "Board games"].map((opt) => (
              <button
                key={opt}
                onClick={() => setQuizAnswer(opt)}
                className={clsx("btn", quizAnswer === opt && "btn-secondary")}
              >
                {opt}
              </button>
            ))}
          </div>
          {quizAnswer && (
            <div className="mt-3 alert alert-success">
              <span>Perfect answer, Anitha! Any Sunday with you is my favorite. — Kaviraj</span>
            </div>
          )}
        </section>

        <section className="mt-10">
          <h3 className="text-center text-xl font-medium mb-4">Little Memories</h3>
          <div className="carousel rounded-box w-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="carousel-item w-64 h-40 m-2 rounded-xl overflow-hidden shadow">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-200 to-pink-400/60 text-foreground/90">
                  Memory #{i + 1}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h3 className="text-center text-xl font-medium mb-4">Our Journey</h3>
          <ul className="steps steps-vertical md:steps-horizontal w-full">
            <li className="step step-primary">We met</li>
            <li className="step step-primary">First date</li>
            <li className="step step-primary">Inside jokes</li>
            <li className="step">Forever begins</li>
          </ul>
        </section>

        <section className="mt-10">
          <h3 className="text-center text-xl font-medium mb-4">Words From My Heart</h3>
          <div className="relative max-w-2xl mx-auto">
            <AnimatePresence mode="popLayout">
              <motion.blockquote
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-center text-base sm:text-lg bg-white/60 dark:bg-white/10 backdrop-blur rounded-xl p-6 shadow"
              >
                “{quotes[quoteIndex]}”
              </motion.blockquote>
            </AnimatePresence>
          </div>
        </section>

        <div className="mt-10 flex items-center justify-center">
          <button className="btn btn-secondary btn-wide" onClick={() => setIsLetterOpen(true)}>
            A Letter For You 💌
          </button>
        </div>

        <AnimatePresence>
          {isLetterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm grid place-items-center p-6"
              onClick={() => setIsLetterOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 160, damping: 18 }}
                className="max-w-xl w-full bg-white/90 dark:bg-white/10 text-foreground rounded-2xl shadow-xl p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h4 className="text-xl font-semibold mb-2">My Heart’s Letter</h4>
                <p className="opacity-90 leading-7">
                  I love you more than words can say. Thank you for being my best friend, my safe place,
                  and my endless adventure. With you, I’ve found a love that feels like home.
                </p>
                <div className="mt-4 text-right">
                  <button className="btn" onClick={() => setIsLetterOpen(false)}>Close</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="z-10 mt-12 opacity-80 text-sm">
        Made with love, just for you.
      </footer>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white/70 dark:bg-white/10 backdrop-blur shadow-sm p-5">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <div className="mt-2 text-sm leading-6">{children}</div>
    </div>
  );
}
