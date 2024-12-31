import List from "./List";
import NavBar from "../NavBar";
import Footer from "../Footer";

export default function Home() {
  return (
    <>
    <NavBar />
      <div className="flex flex-col min-h-screen"> 
          <List />
      </div>
    <Footer />
    </>
  );
}