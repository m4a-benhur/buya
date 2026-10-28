import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-8 px-6 py-12">
      <div>
        <p className="text-3xl font-bold text-accent">Buya</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight">
          Turn one-time customers into regulars.
        </h1>
        <p className="mt-4 text-lg text-ink/70">
          Digital stamp cards for local shops. Customers scan a QR code, no app to install.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/login" className="btn">Business log in</Link>
      </div>
    </main>
  );
}
