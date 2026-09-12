export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
