import { t } from '@/lib/i18n';
import Link from 'next/link';
import { PrivacySettingsButton } from '@/components/privacy/PrivacyConsent';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-12 px-4 bg-gray-50 border-t border-gray-100">
            <div className="max-w-4xl mx-auto text-center text-sm text-gray-600">
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 font-medium">
                    <Link href="/over" className="hover:text-eric-green transition-colors">{' ' + t("Over Lettoria") + ' '} </Link>
                    <Link href="/kaart" className="hover:text-eric-green transition-colors">{' ' + t("Wereldkaart") + ' '} </Link>
                    <Link href="/oefenen" className="hover:text-eric-green transition-colors">{' ' + t("Snel oefenen") + ' '} </Link>
                    <Link href="/diploma" className="hover:text-eric-green transition-colors">{' ' + t("Diploma") + ' '} </Link>
                    <Link href="/impressum" className="hover:text-eric-green transition-colors">{' ' + t("Colofon") + ' '} </Link>
                    <Link href="/privacy" className="hover:text-eric-green transition-colors">{' ' + t("Privacy & cookies") + ' '} </Link>
                    <PrivacySettingsButton className="hover:text-eric-green transition-colors" />
                </div>

                <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="font-bold text-eric-green text-xl">Lettoria</span>
                </div>

                <p className="text-gray-500 mb-4">{' ' + t("De leukste manier om te leren typen.") + ' '} </p>

                <div className="flex flex-col gap-2">
                    <p className="text-gray-400 text-xs">
                        © {currentYear} Lettoria /{' '}
                        <a
                            href="https://www.treehouse.ch"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-eric-green transition-colors"
                        >
                            Durchblick Consultancy BV
                        </a>
                    </p>
                    <p className="text-gray-400 text-xs">{' ' + t("Gemaakt met ❤️ voor alle kinderen.") + ' '}</p>
                </div>
            </div>
        </footer>
    );
}
