import Navbar from './Navbar.jsx'
export default function Layout({ children }) {
    return (
        <div className='app-root'>
            <Navbar />
            <main className='app-main'>
                {children}
            </main>
        </div>
    )
}