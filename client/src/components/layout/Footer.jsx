import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
                <span className="text-white font-bold text-lg font-display">B</span>
              </div>
              <span className="text-xl font-bold font-display">BiteDash</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your favourite food, delivered fast. From top-rated restaurants straight to your doorstep.
            </p>
          </div>

          {[
            { title: 'Explore', links: [['Home', '/'], ['Restaurants', '/restaurants'], ['My Orders', '/orders']] },
            { title: 'Support', links: [['Help Center', '#'], ['Terms', '#'], ['Privacy', '#']] },
            { title: 'Business', links: [['Partner With Us', '#'], ['Deliver With Us', '#'], ['Careers', '#']] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold mb-4 font-display">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-gray-400 text-sm hover:text-brand transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2024 BiteDash. All rights reserved.</p>
          <div className="flex gap-4">
            {['Instagram', 'Twitter', 'Facebook'].map((s) => (
              <a key={s} href="#" className="text-gray-500 text-sm hover:text-brand transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
