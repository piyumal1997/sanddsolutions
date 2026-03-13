// src/pages/legal/RefundPolicy.jsx
import { refundPolicy } from '../../data/refundPolicy';

export default function RefundPolicy() {
  const { title, lastUpdated, introduction, sections, compliance, contact } = refundPolicy;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20 prose lg:prose-lg text-gray-800">
      {/* Header */}
      <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-green-800">{title}</h1>
      <p className="text-gray-600 mb-10">Last updated: {lastUpdated}</p>

      {/* Introduction */}
      <p className="text-lg leading-relaxed mb-12 whitespace-pre-line">{introduction}</p>

      {/* Sections */}
      <div className="space-y-14">
        {sections.map((section, index) => (
          <section key={index} className="border-l-4 border-green-600 pl-6">
            <h2 className="text-2xl font-bold mb-4 text-green-700">{section.heading}</h2>
            <p className="text-lg leading-relaxed whitespace-pre-line">{section.details}</p>
          </section>
        ))}
      </div>

      {/* Compliance & Contact */}
      <section className="mt-16 pt-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-green-700">Compliance & Contact</h2>
        <p className="text-lg leading-relaxed mb-8 whitespace-pre-line">{compliance}</p>

        <p className="text-lg">
          For any questions or refund requests, please contact us at:
          <br />
          <br />
          Email:{' '}
          <a
            href={`mailto:${contact.email}`}
            className="text-green-600 hover:underline font-medium"
          >
            {contact.email}
          </a>
          <br />
          Phone:{' '}
          <a
            href={`tel:${contact.phone.replace(/\s/g, '')}`}
            className="text-green-600 hover:underline font-medium"
          >
            {contact.phone}
          </a>
        </p>
      </section>
    </div>
  );
}