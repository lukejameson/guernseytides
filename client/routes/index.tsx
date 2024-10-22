import TideButton from "../islands/TideData.tsx";

export default function Home() {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div class="max-w-4xl mx-auto py-8 px-4">
      <h1 class="text-2xl font-bold mb-6 text-center">Tide Information</h1>
      <TideButton date={today} />
    </div>
  );
}
