// The admin console is the last place still using the Material Symbols icon
// font. Loading it here instead of in the root layout keeps it off the public
// coming-soon page, which draws its few marks as inline SVG.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
