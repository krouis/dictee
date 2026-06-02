type Props = { onStart: () => void };

export default function HomeScreen({ onStart }: Props) {
  return (
    <div className="w-full max-w-card bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-100 text-center">
      <div className="text-6xl mb-4">✏️</div>
      <h1 className="fluid-heading font-bold text-slate-800 mb-2">Dictée Libre</h1>
      <p className="text-slate-500 mb-10 text-lg">Gratuit · Hors-ligne · Sans compte</p>
      <button
        onClick={onStart}
        className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold text-xl py-4 rounded-2xl transition-colors shadow-md shadow-indigo-200"
      >
        Nouvelle dictée
      </button>
    </div>
  );
}
