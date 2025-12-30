export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Professional quotes in
            <span className="block text-blue-600">minutes, not hours</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            The simple quoting tool built for tradespeople. Create accurate quotes, 
            save your materials library, and never lose track of a job again.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </a>
            <a
              href="/login"
              className="bg-white text-slate-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-slate-50 transition-colors border-2 border-slate-200"
            >
              Sign In
            </a>
          </div>
          <p className="text-sm text-slate-500 mt-4">No credit card required</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Lightning Fast Quotes</h3>
            <p className="text-slate-600">
              Create professional quotes in minutes. Add labour, materials, and calculations 
              are done automatically.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Your Materials Library</h3>
            <p className="text-slate-600">
              Save your frequently used materials with pricing. Never type the same 
              item twice.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Always Accessible</h3>
            <p className="text-slate-600">
              Access your quotes from any device. All your data is securely stored 
              in the cloud.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Add Your Materials</h3>
            <p className="text-slate-600">
              Build your personal library of materials and pricing
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Create Quotes</h3>
            <p className="text-slate-600">
              Select materials, add labour, and let the app calculate totals
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Send to Clients</h3>
            <p className="text-slate-600">
              Share professional quotes and keep track of all your jobs
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start quoting smarter today
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join tradespeople who are saving time and looking more professional
          </p>
          <a
            href="/signup"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-slate-50 transition-colors shadow-lg"
          >
            Create Your Free Account
          </a>
          <p className="text-blue-100 text-sm mt-4">No credit card required</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2025 TradeQuote. Built for tradespeople.</p>
        </div>
      </div>
    </div>
  )
}
