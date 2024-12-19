import "../../public/fonts.css";

export default function Navbar({ activePage }: { activePage: string }) {
  return (
    <>
      <style>{`
        .navbar-background {
          background-color: rgb(194, 194, 194);
        }

        .dark .navbar-background {
          background-color: rgb(9, 9, 11);
        }
      `}</style>
      <div className="mx-auto flex min-w-full navbar-background">
        <div className="font-academiaM54 text-3xl p-2">CHESS {activePage}</div>
      </div>
    </>
  );
}
