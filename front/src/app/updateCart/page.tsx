import Footer from "../Footer";
import NavBar from "../NavBar";
import UpdateCart from "./UpdateCart";

export default function Home() {
    return (
        <>
            <NavBar />
            <div className="flex flex-col min-h-screen">
            <UpdateCart />
            </div>
            <Footer />
        </>
    );
}