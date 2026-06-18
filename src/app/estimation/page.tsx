import { redirect } from "next/navigation";

export default function LegacyModuleRedirect() {
  redirect("/workspace");
}
