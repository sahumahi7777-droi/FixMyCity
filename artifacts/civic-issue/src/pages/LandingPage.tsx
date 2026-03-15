export function LandingPage({
  onGetStarted,
}: {
  onGetStarted: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mb-6">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F2542bca302a146b68a7921bd85ab85d4%2Fc53f8a9f5c1e4be9868402b13def526f?format=webp&width=800&height=1200"
                alt="FixMyCity Logo"
                className="h-20 w-auto"
              />
            </div>

            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Fix Your City's Issues Instantly
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Empower your community to report and resolve civic issues faster than ever before. No signup required, complete transparency, and real results.
            </p>

            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Start Reporting Now →
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
            <div className="aspect-square bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center text-6xl">
              🏛️
            </div>
          </div>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="container max-w-6xl mx-auto px-4 py-16 border-t">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            The Challenge
          </h2>
          <p className="text-xl text-gray-600">
            Current government civic portals have significant limitations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="font-bold text-lg mb-2">Requires Signup</h3>
            <p className="text-gray-600">
              Complex registration processes discourage quick issue reporting
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-4">👻</div>
            <h3 className="font-bold text-lg mb-2">No Transparency</h3>
            <p className="text-gray-600">
              Citizens can't see community impact or resolution progress
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-4">❓</div>
            <h3 className="font-bold text-lg mb-2">Limited Help</h3>
            <p className="text-gray-600">
              Poor UI guidance and limited AI assistance for citizens
            </p>
          </div>
        </div>
      </div>

      {/* Our Solution */}
      <div className="container max-w-6xl mx-auto px-4 py-16 border-t">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Solution
          </h2>
          <p className="text-xl text-gray-600">
            FixMyCity revolutionizes civic issue reporting with innovative features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature 1 */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Signup Required
            </h3>
            <p className="text-gray-700 mb-4">
              Report issues instantly without creating an account. Just fill the form with your details and DIGIPIN, and you're done!
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Quick issue submission</li>
              <li>✓ No account maintenance</li>
              <li>✓ Instant reporting</li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border border-green-200">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Community Leaderboard
            </h3>
            <p className="text-gray-700 mb-4">
              See who's making the biggest impact in your community. Earn points and badges for reporting and resolving issues.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Gamified reporting system</li>
              <li>✓ Recognition for contributors</li>
              <li>✓ Community motivation</li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 border border-purple-200">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Success Stories
            </h3>
            <p className="text-gray-700 mb-4">
              Share before and after photos of resolved issues. Build community trust through transparent documentation of improvements.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Community engagement</li>
              <li>✓ Visual proof of impact</li>
              <li>✓ Transparency tracking</li>
            </ul>
          </div>

          {/* Feature 4 */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 border border-orange-200">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              AI-Powered Descriptions
            </h3>
            <p className="text-gray-700 mb-4">
              Our AI generates detailed descriptions based on issue category, making it easier for less tech-savvy citizens to report effectively.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Auto-generated details</li>
              <li>✓ Better clarity</li>
              <li>✓ Inclusive reporting</li>
            </ul>
          </div>

          {/* Feature 5 */}
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-8 border border-pink-200">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              DIGIPIN Verification
            </h3>
            <p className="text-gray-700 mb-4">
              Unique location identification using DIGIPIN ensures accurate issue placement and prevents duplicate reports in the same area.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Accurate locations</li>
              <li>✓ Duplicate prevention</li>
              <li>✓ Government standard</li>
            </ul>
          </div>

          {/* Feature 6 */}
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-8 border border-cyan-200">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Admin Excellence
            </h3>
            <p className="text-gray-700 mb-4">
              Powerful yet intuitive admin dashboard with advanced filtering, issue management, and complete issue history tracking.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Easy issue management</li>
              <li>✓ Quick filtering</li>
              <li>✓ Status tracking</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="container max-w-6xl mx-auto px-4 py-16 border-t">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
          How We Stand Out
        </h2>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                <tr>
                  <th className="p-4 text-left font-bold">Feature</th>
                  <th className="p-4 text-center font-bold">Government Portal</th>
                  <th className="p-4 text-center font-bold">FixMyCity</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium">Signup Required</td>
                  <td className="p-4 text-center">✓ Yes</td>
                  <td className="p-4 text-center text-green-600 font-bold">✗ No</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium">Leaderboard</td>
                  <td className="p-4 text-center">✗ No</td>
                  <td className="p-4 text-center text-green-600 font-bold">✓ Yes</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium">Community Success Stories</td>
                  <td className="p-4 text-center">✗ No</td>
                  <td className="p-4 text-center text-green-600 font-bold">✓ Yes</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium">Issue Transparency</td>
                  <td className="p-4 text-center">Limited</td>
                  <td className="p-4 text-center text-green-600 font-bold">Complete</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium">AI Description Generator</td>
                  <td className="p-4 text-center">✗ No</td>
                  <td className="p-4 text-center text-green-600 font-bold">✓ Yes</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium">24/7 AI Chatbot Help</td>
                  <td className="p-4 text-center">✗ No</td>
                  <td className="p-4 text-center text-green-600 font-bold">✓ Yes</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-blue-50">
                  <td className="p-4 font-medium font-bold">User Experience</td>
                  <td className="p-4 text-center">Complex</td>
                  <td className="p-4 text-center text-green-600 font-bold">Simple & Intuitive</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container max-w-4xl mx-auto px-4 py-16 border-t">
        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 opacity-95">
            Start reporting civic issues today and help build a better city for everyone.
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Begin Reporting Now ✓
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 py-8">
        <div className="container max-w-6xl mx-auto px-4 text-center text-gray-600">
          <div className="flex items-center justify-center mb-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F2542bca302a146b68a7921bd85ab85d4%2Fc53f8a9f5c1e4be9868402b13def526f?format=webp&width=800&height=1200"
              alt="FixMyCity Logo"
              className="h-8 w-auto"
            />
          </div>
          <p className="text-sm">
            Making cities better, one report at a time. No signup. No politics. Just results.
          </p>
        </div>
      </div>
    </div>
  );
}
