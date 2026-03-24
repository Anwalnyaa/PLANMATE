import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Navbar */}
      <header className="border-b bg-white  dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold black">
            PlanMate
          </h1>
          

          <nav className="space-x-6 text-sm">
            <a href="/" className="hover:text-orange-500">Home</a>
            <a href="/create-trip" className="hover:text-orange-500">Create Trip</a>
            <a href="/join-trip" className="hover:text-orange-500">Join Trip</a>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} PlanMate • Plan together, travel better
      </footer>

    </div>
  );
};

export default Layout;
