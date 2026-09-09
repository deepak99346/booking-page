import { useState } from "react";
import "./App.css";

function App() {
  const [service, setService] = useState("");
  const [pcbDesignFile, setPcbDesignFile] = useState(null);
  const [laserDesignFile, setLaserDesignFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleServiceChange = (event) => {
    const selectedService = event.target.value;

    setService(selectedService);
    setStatusMessage(null);

    // Reset files when service changes
    setPcbDesignFile(null);
    setLaserDesignFile(null);
  };

  const handlePcbFileChange = (event) => {
    const file = event.target.files?.[0];
    setStatusMessage(null);

    if (!file) {
      setPcbDesignFile(null);
      return;
    }

    const fileName = file.name.toLowerCase();

    if (!fileName.endsWith(".gbr") && !fileName.endsWith(".dxf")) {
      setStatusMessage({
        type: "error",
        text: "PCB design file must be a .gbr or .dxf file.",
      });
      event.target.value = "";
      setPcbDesignFile(null);
      return;
    }

    setPcbDesignFile(file);
  };

  const handleLaserFileChange = (event) => {
    const file = event.target.files?.[0];
    setStatusMessage(null);

    if (!file) {
      setLaserDesignFile(null);
      return;
    }

    const fileName = file.name.toLowerCase();

    if (!fileName.endsWith(".dxf")) {
      setStatusMessage({
        type: "error",
        text: "Laser Cutter design file must be a .dxf file.",
      });
      event.target.value = "";
      setLaserDesignFile(null);
      return;
    }

    setLaserDesignFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage(null);

    const activeFile = service === "PCB" ? pcbDesignFile : laserDesignFile;

    if (!activeFile) {
      setStatusMessage({
        type: "error",
        text: "Please select a valid design file before submitting.",
      });
      return;
    }

    const rawFormData = new FormData(event.target);
    const email = (rawFormData.get("email") || "").toString().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatusMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    // Prepare FormData
    const apiFormData = new FormData();

    apiFormData.append("service", service);
    apiFormData.append("name", rawFormData.get("name") || "");
    apiFormData.append("instituteCompany", rawFormData.get("instituteCompany") || "");
    apiFormData.append("department", rawFormData.get("department") || "");
    apiFormData.append("email", email);
    apiFormData.append("contactNumber", rawFormData.get("contactNumber") || "");
    apiFormData.append("material", rawFormData.get("material") || "");
    apiFormData.append("thickness", rawFormData.get("thickness") || "");

    if (service === "PCB") {
      apiFormData.append("length", rawFormData.get("length") || "");
      apiFormData.append("breadth", rawFormData.get("breadth") || "");
    }

    apiFormData.append("designFile", activeFile);

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        body: apiFormData, // Send FormData; browser sets multipart/form-data boundary automatically
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: data.message || "Booking request submitted successfully!",
        });

        // Reset form & state on success
        event.target.reset();
        setService("");
        setPcbDesignFile(null);
        setLaserDesignFile(null);
      } else {
        setStatusMessage({
          type: "error",
          text: data.message || "Failed to submit booking request. Please check input values.",
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatusMessage({
        type: "error",
        text: "Unable to communicate with the server. Please check your backend connection.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">

        {/* ================= HEADER ================= */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-700">
            Service Booking
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Facilities by IC IITP
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500 md:text-lg">
            Fill in the required details below to submit your service request.
          </p>
        </div>

        {/* ================= FORM CARD ================= */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8 md:p-10">

          {/* ================= STATUS BANNER ================= */}
          {statusMessage && (
            <div
              className={`mb-8 flex items-center justify-between rounded-2xl p-4 text-sm font-medium shadow-sm transition-all duration-300 ${statusMessage.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-rose-200 bg-rose-50 text-rose-800"
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {statusMessage.type === "success" ? "✓" : "⚠️"}
                </span>
                <span>{statusMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-xs font-bold uppercase tracking-wider opacity-70 hover:opacity-100"
              >
                Dismiss
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* ===================================================== */}
            {/* ================= CONTACT DETAILS =================== */}
            {/* ===================================================== */}

            <div className="border-t border-slate-100 pt-8">

              <h2 className="mb-6 text-2xl font-bold text-slate-900">
                Contact Details
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* ================= NAME ================= */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />
                </div>

                {/* ================= INSTITUTE / COMPANY ================= */}
                <div>
                  <label
                    htmlFor="instituteCompany"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Institute / Company{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="instituteCompany"
                    name="instituteCompany"
                    type="text"
                    placeholder="Enter institute or company name"
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />
                </div>

                {/* ================= DEPARTMENT ================= */}
                <div>
                  <label
                    htmlFor="department"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Department <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="department"
                    name="department"
                    type="text"
                    placeholder="Enter department"
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />
                </div>

                {/* ================= EMAIL ================= */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email ID <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />
                </div>

                {/* ================= CONTACT NUMBER ================= */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="contactNumber"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Contact Number{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    placeholder="Enter your contact number"
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />
                </div>

              </div>
            </div>

            {/* ================= SERVICE ================= */}
            <div className="mt-10">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">
                Service Details
              </h2>

              <div>
                <label
                  htmlFor="service"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Services <span className="text-red-500">*</span>
                </label>

                <select
                  id="service"
                  name="service"
                  value={service}
                  onChange={handleServiceChange}
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                >
                  <option value="">Select a service</option>
                  <option value="PCB">PCB</option>
                  <option value="Laser Cutter">Laser Cutter</option>
                </select>
              </div>
            </div>

            {/* ===================================================== */}
            {/* ================= PCB DETAILS ======================== */}
            {/* ===================================================== */}

            {service === "PCB" && (
              <div className="mb-10 border-t border-slate-100 pt-8">

                <h2 className="mb-6 text-2xl font-bold text-slate-900">
                  PCB Details
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                  {/* ================= LENGTH ================= */}
                  <div>
                    <label
                      htmlFor="length"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Length (mm){" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        id="length"
                        name="length"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Enter length"
                        required
                        disabled={isSubmitting}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 pr-16 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        mm
                      </span>
                    </div>
                  </div>

                  {/* ================= BREADTH ================= */}
                  <div>
                    <label
                      htmlFor="breadth"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Breadth (mm){" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        id="breadth"
                        name="breadth"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Enter breadth"
                        required
                        disabled={isSubmitting}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 pr-16 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        mm
                      </span>
                    </div>
                  </div>

                  {/* ================= MATERIAL ================= */}
                  <div>
                    <label
                      htmlFor="material"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Material <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="material"
                      name="material"
                      type="text"
                      placeholder="Enter material"
                      required
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    />
                  </div>

                  {/* ================= THICKNESS ================= */}
                  <div>
                    <label
                      htmlFor="thickness"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Thickness (mm){" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        id="thickness"
                        name="thickness"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Enter thickness"
                        required
                        disabled={isSubmitting}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 pr-16 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        mm
                      </span>
                    </div>
                  </div>

                  {/* ================================================= */}
                  {/* ================= PCB DESIGN ==================== */}
                  {/* ================================================= */}

                  <div className="md:col-span-2">

                    <label
                      htmlFor="pcbDesign"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Design File{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-blue-400 hover:bg-blue-50/30">

                      <input
                        id="pcbDesign"
                        name="pcbDesign"
                        type="file"
                        accept=".gbr,.dxf"
                        required
                        disabled={isSubmitting}
                        onChange={handlePcbFileChange}
                        className="block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-5 file:py-2.5 file:font-semibold file:text-white hover:file:bg-blue-700 disabled:opacity-60"
                      />

                      <p className="mt-3 text-sm text-slate-500">
                        Supported file formats:
                        <span className="ml-1 font-semibold text-blue-600">
                          .gbr, .dxf
                        </span>
                      </p>

                      {pcbDesignFile && (
                        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                          <span className="font-semibold">
                            Selected file:
                          </span>{" "}
                          {pcbDesignFile.name}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================== */}
            {/* ============== LASER CUTTER DETAILS ================= */}
            {/* ===================================================== */}

            {service === "Laser Cutter" && (
              <div className="mb-10 border-t border-slate-100 pt-8">

                <h2 className="mb-6 text-2xl font-bold text-slate-900">
                  Laser Cutter Details
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                  {/* ================= MATERIAL ================= */}
                  <div>
                    <label
                      htmlFor="material"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Material <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="material"
                      name="material"
                      required
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    >
                      <option value="">Select material</option>
                      <option value="Acrylic">Acrylic</option>
                      <option value="Wood">Wood</option>
                      <option value="Leather">Leather</option>
                    </select>
                  </div>

                  {/* ================= THICKNESS ================= */}
                  <div>
                    <label
                      htmlFor="thickness"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Thickness (mm){" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        id="thickness"
                        name="thickness"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Enter thickness"
                        required
                        disabled={isSubmitting}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 pr-16 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        mm
                      </span>
                    </div>
                  </div>

                  {/* ================================================= */}
                  {/* ============= LASER DESIGN FILE ================ */}
                  {/* ================================================= */}

                  <div className="md:col-span-2">

                    <label
                      htmlFor="laserDesign"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Design File{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-blue-400 hover:bg-blue-50/30">

                      <input
                        id="laserDesign"
                        name="laserDesign"
                        type="file"
                        accept=".dxf"
                        required
                        disabled={isSubmitting}
                        onChange={handleLaserFileChange}
                        className="block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-5 file:py-2.5 file:font-semibold file:text-white hover:file:bg-blue-700 disabled:opacity-60"
                      />

                      <p className="mt-3 text-sm text-slate-500">
                        Supported file format:
                        <span className="ml-1 font-semibold text-blue-600">
                          .dxf
                        </span>
                      </p>

                      {laserDesignFile && (
                        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                          <span className="font-semibold">
                            Selected file:
                          </span>{" "}
                          {laserDesignFile.name}
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              </div>
            )}



            {/* ===================================================== */}
            {/* ===================== SUBMIT ======================== */}
            {/* ===================================================== */}

            <div className="mt-10 border-t border-slate-100 pt-8">

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isSubmitting ? "Submitting..." : "Submit Booking"}
              </button>

              <p className="mt-4 text-center text-sm text-slate-400">
                <span className="text-red-500">*</span> Required fields
              </p>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default App;