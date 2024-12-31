import Homepage from "./Homepage";
import NavBar from "./NavBar";
import Footer from "./Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">
        <Homepage />
      </main>
      <Footer />
    </div>
  );
}