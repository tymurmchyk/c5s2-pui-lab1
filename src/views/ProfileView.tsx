import {
	Table,
	TableBody,
	TableCell,
	TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/backend";

function genderLabel(g: string): string {
	if (g === "male") return "Чоловіча";
	if (g === "female") return "Жіноча";
	return "Не вказано";
}

export default function ProfileView() {
	const { currentUser } = useAuth();

	return (
		<div className="flex-1 flex flex-col items-center pt-8 px-6 gap-4 overflow-y-auto">
			<Table className="border w-auto text-sm">
				<TableBody>
					<TableRow>
						<TableCell className="px-3 py-2 text-right">Ім&apos;я</TableCell>
						<TableCell className="px-3 py-2 italic">{currentUser!.name.first} {currentUser!.name.last}</TableCell>
					</TableRow>
					<TableRow>
						<TableCell className="px-3 py-2 text-right">Стать</TableCell>
						<TableCell className="px-3 py-2 italic">{genderLabel(currentUser!.gender)}</TableCell>
					</TableRow>
					<TableRow>
						<TableCell className="px-3 py-2 text-right">Дата народження</TableCell>
						<TableCell className="px-3 py-2 italic">{currentUser!.birthDate}</TableCell>
					</TableRow>
				</TableBody>
			</Table>
			<Table className="border w-auto text-sm">
				<TableBody>
					<TableRow>
						<TableCell className="px-3 py-2 text-right">E-mail</TableCell>
						<TableCell className="px-3 py-2 italic">{currentUser!.email}</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>
	);
}
