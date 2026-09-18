export default function Footer({ allianceName }: { allianceName: string }) {
  return (
    <footer className="border-t border-blood-dark/40 py-8 text-center text-xs text-bone-muted/70">
      <p>© {new Date().getFullYear()} {allianceName}. Todos os direitos reservados.</p>
    </footer>
  );
}
