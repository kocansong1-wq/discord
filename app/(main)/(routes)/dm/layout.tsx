import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";

const DMLayout = async ({ children }: { children: React.ReactNode }) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  return (
    <div className="h-full">
      <main className="h-full">{children}</main>
    </div>
  );
};

export default DMLayout;
