// client/src/pages/Contact.jsx
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faPhone,
  faEnvelope,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { company } from "../data/company";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";

import contactBg from "../assets/images/background/contact-bg.jpg";

const ContactInner = () => {
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiry_type: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  const { executeRecaptcha } = useGoogleReCaptcha();

  // Map refs and states
  const headMapRef = useRef(null);
  const colomboMapRef = useRef(null);
  const [headMapSrc, setHeadMapSrc] = useState(null);
  const [colomboMapSrc, setColomboMapSrc] = useState(null);
  const [headLoaded, setHeadLoaded] = useState(false);
  const [colomboLoaded, setColomboLoaded] = useState(false);

  // Coordinates
  const headLocation = company.location; // { lat: 7.0802346985376055, lng: 80.04550413705672 }
  const colomboLocation = { lat: 6.93, lng: 79.861944 }; // Trace Expert City, Maradana, Colombo 10

  const headMapUrl = `https://maps.google.com/maps?q=${headLocation.lat},${headLocation.lng}&hl=en&z=15&output=embed`;
  const colomboMapUrl = `https://maps.google.com/maps?q=${colomboLocation.lat},${colomboLocation.lng}&hl=en&z=15&output=embed`;

  // Lazy load head office map
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHeadMapSrc(headMapUrl);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "150px" },
    );

    if (headMapRef.current) observer.observe(headMapRef.current);

    return () => {
      if (headMapRef.current) observer.unobserve(headMapRef.current);
    };
  }, []);

  // Lazy load Colombo office map
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setColomboMapSrc(colomboMapUrl);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "150px" },
    );

    if (colomboMapRef.current) observer.observe(colomboMapRef.current);

    return () => {
      if (colomboMapRef.current) observer.unobserve(colomboMapRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (
      formData.phone &&
      !/^\+?\d{10,15}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Invalid phone number (10-15 digits)";
    }
    if (!formData.inquiry_type)
      newErrors.inquiry_type = "Please select inquiry type";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!executeRecaptcha) {
      setSubmitError("reCAPTCHA not loaded. Please refresh the page.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await executeRecaptcha("inquiryForm");

      // Use relative path (same domain) in production
      // In development you can use: http://localhost:3000/api/inquiries
      const apiUrl = import.meta.env.VITE_API_BASE_URL
        ? `${import.meta.env.VITE_API_BASE_URL}/api/inquiries`
        : "/api/inquiries";

        // Log it to console so you can see exactly what is being requested
      console.log('Sending to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          recaptcha_token: token,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        inquiry_type: "",
        message: "",
      });
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-0 bg-white">
      {/* Hero Section */}
      <section className="relative h-96">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${contactBg})` }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-6 h-full flex items-center justify-center text-center text-white">
          <div className="max-w-5xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-md">
              Get in touch for any inquiry – free consultation island-wide.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 max-w-7xl mx-auto">
            {/* Contact Info + Form */}
            <div className="w-full lg:w-1/2">
              <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
                {/* Company Logo & Name */}
                <div className="text-center mb-10">
                  <img
                    src={company.logo[0] || "/logo-placeholder.png"}
                    alt={`${company.name} Logo`}
                    className="h-20 mx-auto mb-6 object-contain"
                  />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {company.name}
                  </h3>
                </div>

                {/* Offices & Contact Details */}
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      className="text-green-600 text-2xl mt-1 flex-shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Head Office</p>
                      <p className="text-gray-700">{company.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      className="text-green-600 text-2xl mt-1 flex-shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Colombo Office
                      </p>
                      <p className="text-gray-700">{company.office}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="text-green-600 text-2xl flex-shrink-0"
                    />
                    <a
                      href={`tel:${company.phone.replace(/\s/g, "")}`}
                      className="text-gray-700 hover:text-green-600 transition"
                    >
                      {company.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-4">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="text-green-600 text-2xl flex-shrink-0"
                    />
                    <a
                      href={`mailto:${company.email}`}
                      className="text-gray-700 hover:text-green-600 transition"
                    >
                      {company.email}
                    </a>
                  </div>
                </div>

                {/* Form / Success Message */}
                <div className="mt-12">
                  {success ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-green-600 text-6xl mb-4"
                      />
                      <h3 className="text-2xl font-bold text-green-700 mb-3">
                        Thank You!
                      </h3>
                      <p className="text-lg text-gray-700">
                        Your inquiry has been sent successfully. We will respond within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {submitError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
                          {submitError}
                        </div>
                      )}

                      <input
                        type="text"
                        name="name"
                        placeholder="Your Name *"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm -mt-2">{errors.name}</p>
                      )}

                      <input
                        type="email"
                        name="email"
                        placeholder="Your Email *"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm -mt-2">{errors.email}</p>
                      )}

                      <input
                        type="tel"
                        name="phone"
                        placeholder="Your Phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm -mt-2">{errors.phone}</p>
                      )}

                      <select
                        name="inquiry_type"
                        value={formData.inquiry_type}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition"
                      >
                        <option value="">Select Inquiry Type *</option>
                        <option value="Home Solar Solutions">Home Solar Solutions</option>
                        <option value="Industry Solar Solutions">Industry Solar Solutions</option>
                        <option value="Automation & Control Systems">Automation & Control Systems</option>
                        <option value="General Engineering">General Engineering</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.inquiry_type && (
                        <p className="text-red-500 text-sm -mt-2">{errors.inquiry_type}</p>
                      )}

                      <textarea
                        name="message"
                        rows="5"
                        placeholder="Your Message *"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition resize-none"
                      />
                      {errors.message && (
                        <p className="text-red-500 text-sm -mt-2">{errors.message}</p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 rounded-lg font-medium text-lg transition ${
                          isSubmitting
                            ? "bg-green-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Locations - Maps */}
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                Our Locations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-12">
                {/* Head Office */}
                <div className="flex flex-col">
                  <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">
                    Head Office
                  </h3>
                  <div
                    ref={headMapRef}
                    className="rounded-2xl overflow-hidden shadow-2xl h-96 relative bg-gray-100"
                  >
                    {!headMapSrc ? (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <p className="text-lg">Map loads when in view</p>
                      </div>
                    ) : (
                      <>
                        <iframe
                          src={headMapSrc}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Head Office Location"
                          onLoad={() => setHeadLoaded(true)}
                        />
                        {!headLoaded && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <p className="text-lg text-gray-700">Loading map...</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-center mt-6 text-gray-700 font-medium">
                    {company.address}
                  </p>
                </div>

                {/* Colombo Office */}
                <div className="flex flex-col">
                  <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">
                    Colombo Office
                  </h3>
                  <div
                    ref={colomboMapRef}
                    className="rounded-2xl overflow-hidden shadow-2xl h-96 relative bg-gray-100"
                  >
                    {!colomboMapSrc ? (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <p className="text-lg">Map loads when in view</p>
                      </div>
                    ) : (
                      <>
                        <iframe
                          src={colomboMapSrc}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Colombo Office Location"
                          onLoad={() => setColomboLoaded(true)}
                        />
                        {!colomboLoaded && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <p className="text-lg text-gray-700">Loading map...</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-center mt-6 text-gray-700 font-medium">
                    {company.office}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const Contact = () => (
  <GoogleReCaptchaProvider reCaptchaKey="6Lfxv1gsAAAAAIUJRR_rG5ejpfC-Soh7ga0CMquB">
    <ContactInner />
  </GoogleReCaptchaProvider>
);

export default Contact;