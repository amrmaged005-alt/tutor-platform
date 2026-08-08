import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";
import NavbarClient from "../components/NavbarClient";

export function NavbarFallback() {
  return (
    <div
      aria-hidden="true"
      style={{
        backgroundColor: "var(--bg)",
        borderBottom: "1px solid var(--border-light)",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.5rem",
        height: 64,
        padding: "0 1.5rem",
        position: "fixed",
        top: 0,
        insetInlineStart: 0,
        width: "100%",
        zIndex: 1000,
      }}
    >
      <span
        style={{
          backgroundColor: "var(--bg-alt)",
          borderRadius: 8,
          display: "block",
          flex: "0 0 auto",
          height: 28,
          width: 112,
        }}
      />
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "0.75rem",
          minWidth: 0,
        }}
      >
        {[72, 56, 36].map((width) => (
          <span
            key={width}
            style={{
              backgroundColor: "var(--bg-alt)",
              borderRadius: width === 36 ? 999 : 6,
              display: "block",
              flex: "0 1 auto",
              height: width === 36 ? 36 : 12,
              width,
            }}
          />
        ))}
      </span>
    </div>
  );
}

export default async function Navbar() {
  const session = await auth();

  let role = "";
  let centerId: string | null = null;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, centerId: true },
    });
    role = user?.role ?? "";
    centerId = user?.centerId ?? null;
  }

  return <NavbarClient session={!!session?.user} role={role} centerId={centerId} />;
}
