import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-slate-100 border-t border-slate-200 py-16">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
        <div className="col-span-2 lg:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-6 w-max">
            <Image src="/images/logo2.png" alt="Docsly Logo" width={120} height={40} className="object-contain h-8 w-auto mix-blend-multiply" />
          </Link>
          <p className="text-slate-500 max-w-[280px]">
            AI Office Agent that transforms the way professionals create, format, and manage documents.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-6">Product</h4>
          <ul className="space-y-4">
            <li><Link href="#features" className="text-slate-500 hover:text-slate-900 text-sm">Features</Link></li>
            <li><Link href="#pricing" className="text-slate-500 hover:text-slate-900 text-sm">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-6">Resources</h4>
          <ul className="space-y-4">
            <li><Link href="#faq" className="text-slate-500 hover:text-slate-900 text-sm">FAQ</Link></li>
            <li><a href="https://wa.me/6281243205089?text=Halo%20Tim%20Support%20Docsly,%20saya%20membutuhkan%20bantuan%20teknis." target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 text-sm">Support</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-6">Company</h4>
          <ul className="space-y-4">
            <li><Link href="#" className="text-slate-500 hover:text-slate-900 text-sm">About</Link></li>
            <li><a href="https://wa.me/6281243205089?text=Halo%20Tim%20Docsly,%20saya%20ingin%20bertanya%20lebih%20lanjut%20mengenai%20produk." target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 text-sm">Contact</a></li>
            <li><Link href="/privacy" className="text-slate-500 hover:text-slate-900 text-sm">Privacy</Link></li>
            <li><Link href="/terms" className="text-slate-500 hover:text-slate-900 text-sm">Terms</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-[1200px] mx-auto px-6 mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-400 text-sm">© {new Date().getFullYear()} Docsly. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="#" className="text-slate-400 hover:text-slate-900 text-sm">Twitter</Link>
          <Link href="#" className="text-slate-400 hover:text-slate-900 text-sm">LinkedIn</Link>
          <Link href="#" className="text-slate-400 hover:text-slate-900 text-sm">Instagram</Link>
        </div>
      </div>
    </footer>
  );
}
