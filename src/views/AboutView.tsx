export default function AboutView() {
	return (
		<div className="flex-1 flex flex-col items-center pt-8 px-6 gap-4 overflow-y-auto">
			<div className="w-full max-w-2xl border px-8 py-3 text-center">
				<span className="not-italic">📋🎯</span><span className="font-bold italic text-lg"> Localize&amp;Conquer</span>
			</div >
			<div className=" w-full max-w-2xl border p-4 flex flex-col gap-3 text-sm">
				<p>
					Такий собі "зал" для швидкого доступу до важливої інформації щодо ваших завдань.
					Дозволяє в одному місці зібрати їх ключові моменти, прив'язати до клієнтів і вести
					їхню історію із підкріпленням посиланнями на факти комунікації.
				</p>
				<div>
					<p className="font-semibold mb-1">Функціонал:</p>
					<ul className="list-disc list-inside space-y-1">
						<li>Ведення обліку завдань</li>
						<li>Нотатки</li>
						<li>Історія змін, оновлень тощо</li>
						<li>Підкріплення подій історії посиланнями на листи, конференції тощо</li>
						<li>Прив’язання клієнтів до завдань</li>
					</ul>
				</div >
			</div >
		</div >
	);
}
