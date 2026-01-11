import Link from 'next/link';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-12 px-4 bg-gray-50 border-t border-gray-100">
            <div className="max-w-4xl mx-auto text-center text-sm text-gray-600">
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 font-medium">
                    <Link href="/over" className="hover:text-eric-green transition-colors">
                        Over Lettoria
                    </Link>
                    <Link href="/kaart" className="hover:text-eric-green transition-colors">
                        Wereldkaart
                    </Link>
                    <Link href="/oefenen" className="hover:text-eric-green transition-colors">
                        Snel oefenen
                    </Link>
                    <Link href="/impressum" className="hover:text-eric-green transition-colors">
                        Colofon
                    </Link>
                </div>

                <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="font-bold text-eric-green text-xl">Lettoria</span>
                </div>

                <p className="text-gray-500 mb-4">
                    De leukste manier om te leren typen.
                </p>

                <div className="flex flex-col gap-2">
                    <p className="text-gray-400 text-xs">
                        © {currentYear} Lettoria / Durchblick Consultancy BV
                    </p>
                    <p className="text-gray-400 text-xs">Gemaakt met ❤️ voor alle kinderen.</p>
                </div>
            </div>
        </footer>
    );
}
