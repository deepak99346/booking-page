import { useState } from "react";
import "./App.css";

const places = [
  {
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",
    title: "Beautiful Beach",
    location: "Maldives",
    description:
      "Escape to crystal-clear waters and peaceful sandy beaches. Enjoy breathtaking ocean views and refreshing sea air. Relax under the warm sun with your family and friends. Experience beautiful sunsets and unforgettable moments. Make your next vacation truly special.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85",
    title: "Mountain Adventure",
    location: "Swiss Alps",
    description:
      "Discover breathtaking mountain views and beautiful natural landscapes. Enjoy hiking through peaceful and refreshing surroundings. Experience exciting outdoor activities and fresh mountain air. Capture stunning photographs throughout your journey. Start your unforgettable mountain adventure today.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1400&q=85",
    title: "Beautiful City",
    location: "Paris, France",
    description:
      "Explore a beautiful city filled with culture, history, and amazing architecture. Discover famous landmarks and fascinating local attractions. Enjoy delicious food and experience authentic local traditions. Walk through charming streets and discover hidden gems. Create unforgettable memories in this beautiful city.",
  },
];

function App() {
  const [selectedPlace, setSelectedPlace] = useState("");

  const handleBooking = (title) => {
    setSelectedPlace(title);

    setTimeout(() => {
      document.getElementById("booking-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    alert("🎉 Your booking has been submitted successfully!");

    event.target.reset();
    setSelectedPlace("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">



      {/* =====================================================
          DESTINATIONS
      ====================================================== */}

      <section
        id="destinations"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >

        {/* Section Header */}
        <div className="mb-14 text-center">

          <span className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
            Popular Destinations
          </span>

          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Find Your Perfect Escape
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
            Hand-picked destinations designed to make your next journey
            unforgettable.
          </p>
        </div>

        {/* Destination Cards */}
        <div className="space-y-10">

          {places.map((place, index) => (
            <div
              key={place.title}
              className="
                group
                relative
                flex
                min-h-[380px]
                overflow-hidden
                rounded-3xl
                border
                border-slate-200
                bg-white
                shadow-sm
                transition-all
                duration-500
                hover:-translate-y-1
                hover:shadow-2xl
                max-md:flex-col
              "
            >

              {/* Image */}
              <div className="relative w-[43%] overflow-hidden max-md:h-[280px] max-md:w-full">

                <img
                  src={place.image}
                  alt={place.title}
                  className="
                    h-full
                    min-h-[380px]
                    w-full
                    object-cover
                    transition-transform
                    duration-700
                    group-hover:scale-105
                    max-md:min-h-0
                  "
                />

                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

                {/* Number */}
                <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-slate-900 shadow-lg backdrop-blur">
                  0{index + 1}
                </div>

              </div>

              {/* Content */}
              <div className="flex w-[57%] flex-col justify-center p-8 md:p-12 lg:p-16 max-md:w-full">

                {/* Location */}
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-blue-600">
                  <span>📍</span>
                  {place.location}
                </div>

                {/* Title */}
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                  {place.title}
                </h3>

                {/* Description */}
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-500 md:text-lg">
                  {place.description}
                </p>

                {/* Bottom */}
                <div className="mt-8 flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-start">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Starting from
                    </p>

                    <p className="mt-1 text-2xl font-extrabold text-slate-900">
                      $299
                      <span className="ml-1 text-sm font-medium text-slate-400">
                        / person
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBooking(place.title)}
                    className="
                      rounded-full
                      bg-gradient-to-r
                      from-blue-600
                      to-indigo-600
                      px-8
                      py-3.5
                      font-bold
                      text-white
                      shadow-lg
                      shadow-blue-500/25
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:from-blue-700
                      hover:to-indigo-700
                      hover:shadow-xl
                      hover:shadow-blue-500/30
                      active:scale-95
                    "
                  >
                    Book Now →
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          BOOKING FORM
      ====================================================== */}

      <section
        id="booking-form"
        className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 px-4 py-24 sm:px-6"
      >

        {/* Background decoration */}
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">

          {/* Form Header */}
          <div className="mb-12 text-center">

            <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-5 py-2 text-sm font-semibold text-blue-300">
              ✨ Reserve Your Trip
            </span>

            <h2 className="mt-5 text-4xl font-extrabold text-white md:text-5xl">
              Complete Your Booking
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
              Tell us a little about yourself and we'll take care of the rest.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl md:p-10 lg:p-14">

            <form onSubmit={handleSubmit}>

              {/* Personal Details */}
              <div className="mb-8">

                <h3 className="mb-6 text-xl font-bold text-slate-900">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        py-3.5
                        text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-blue-500
                        focus:bg-white
                        focus:ring-4
                        focus:ring-blue-500/10
                      "
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        py-3.5
                        text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-blue-500
                        focus:bg-white
                        focus:ring-4
                        focus:ring-blue-500/10
                      "
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        py-3.5
                        text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-blue-500
                        focus:bg-white
                        focus:ring-4
                        focus:ring-blue-500/10
                      "
                    />
                  </div>

                  {/* Destination */}
                  <div>
                    <label
                      htmlFor="destination"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Destination <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="destination"
                      name="destination"
                      value={selectedPlace}
                      onChange={(e) => setSelectedPlace(e.target.value)}
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        py-3.5
                        text-slate-900
                        outline-none
                        transition
                        focus:border-blue-500
                        focus:bg-white
                        focus:ring-4
                        focus:ring-blue-500/10
                      "
                    >
                      <option value="">Select a destination</option>

                      {places.map((place) => (
                        <option key={place.title} value={place.title}>
                          {place.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="border-t border-slate-100 pt-8">

                <h3 className="mb-6 text-xl font-bold text-slate-900">
                  Trip Details
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                  {/* Date */}
                  <div>
                    <label
                      htmlFor="date"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Booking Date <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="date"
                      name="date"
                      type="date"
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        py-3.5
                        text-slate-900
                        outline-none
                        transition
                        focus:border-blue-500
                        focus:bg-white
                        focus:ring-4
                        focus:ring-blue-500/10
                      "
                    />
                  </div>

                  {/* Guests */}
                  <div>
                    <label
                      htmlFor="guests"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Number of Guests <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="guests"
                      name="guests"
                      type="number"
                      min="1"
                      placeholder="2"
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        py-3.5
                        text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-blue-500
                        focus:bg-white
                        focus:ring-4
                        focus:ring-blue-500/10
                      "
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="mt-6">
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Address <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Enter your complete address"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-3.5
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-blue-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />
                </div>

                {/* Special Requests */}
                <div className="mt-6">
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Special Requests
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    placeholder="Tell us if you have any special requirements..."
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-3.5
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-blue-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="mt-10 border-t border-slate-100 pt-8">

                <button
                  type="submit"
                  className="
                    w-full
                    rounded-xl
                    bg-gradient-to-r
                    from-blue-600
                    to-indigo-600
                    px-6
                    py-4
                    text-lg
                    font-bold
                    text-white
                    shadow-lg
                    shadow-blue-500/25
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:from-blue-700
                    hover:to-indigo-700
                    hover:shadow-xl
                    active:scale-[0.99]
                  "
                >
                  Confirm Booking →
                </button>

                <p className="mt-4 text-center text-sm text-slate-400">
                  🔒 Your information is secure and will never be shared.
                </p>
              </div>

            </form>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-slate-950 px-6 py-8 text-center text-slate-400">
        <p className="text-sm">
          © 2026 Travel Explorer. All rights reserved.
        </p>
      </footer>

    </div>
  );
}

export default App;