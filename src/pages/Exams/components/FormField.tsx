export default function FormField({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <section className="relative max-w-4xl lg:p-12 p-6 mb-10 min-h-72">
      {children}
    </section>
  );
}
