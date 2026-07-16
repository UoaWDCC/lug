export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-white text-black">{children}</div>;
}
