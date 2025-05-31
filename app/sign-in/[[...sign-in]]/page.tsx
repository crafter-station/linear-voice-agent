import { SignIn } from "@clerk/nextjs";

export default function Page() {
	return (
		<div className="min-h-[100dvh] flex items-center justify-center py-24">
			<SignIn />
		</div>
	);
}
