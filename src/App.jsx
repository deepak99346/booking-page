import { useState } from "react";
import "./App.css";

const REQUIRED_PAGE_OPTIONS = [
  "Home",
  "About",
  "Services",
  "Products",
  "Portfolio",
  "Contact",
  "Blog",
  "FAQ",
  "Other",
];

function App() {
  const [service, setService] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Common Fields
  const [name, setName] = useState("");
  const [instituteCompany, setInstituteCompany] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  // PCB Fabrication State
  const [pcbLength, setPcbLength] = useState("");
  const [pcbBreadth, setPcbBreadth] = useState("");
  const [pcbThickness, setPcbThickness] = useState("");
  const [pcbMaterial, setPcbMaterial] = useState("");
  const [pcbLayer, setPcbLayer] = useState("");
  const [pcbDesignFile, setPcbDesignFile] = useState(null);

  // Laser Cutter State
  const [laserMaterial, setLaserMaterial] = useState("");
  const [laserThickness, setLaserThickness] = useState("");
  const [laserDesignFile, setLaserDesignFile] = useState(null);

  // PCB Design State
  const [pcbDesignOnlyFile, setPcbDesignOnlyFile] = useState(null);

  // 3D Design State
  const [filament, setFilament] = useState("");
  const [threeDDesignFile, setThreeDDesignFile] = useState(null);

  // Website Design State
  const [websiteType, setWebsiteType] = useState("");
  const [websitePagesCount, setWebsitePagesCount] = useState("");
  const [websiteRequiredPages, setWebsiteRequiredPages] = useState([]);
  const [websiteResponsive, setWebsiteResponsive] = useState("Yes");
  const [websiteReferenceUrl, setWebsiteReferenceUrl] = useState("");
  const [websiteRequiredFeatures, setWebsiteRequiredFeatures] = useState("");
  const [websiteContentStatus, setWebsiteContentStatus] = useState("");
  const [websiteDesignReference, setWebsiteDesignReference] = useState("");
  const [websitePreferredTechnology, setWebsitePreferredTechnology] = useState("");
  const [websiteExpectedTimeline, setWebsiteExpectedTimeline] = useState("");
  const [websiteAdditionalRequirements, setWebsiteAdditionalRequirements] = useState("");

  const resetFacilityFields = () => {
    // Reset PCB Fabrication
    setPcbLength("");
    setPcbBreadth("");
    setPcbThickness("");
    setPcbMaterial("");
    setPcbLayer("");
    setPcbDesignFile(null);

    // Reset Laser Cutter
    setLaserMaterial("");
    setLaserThickness("");
    setLaserDesignFile(null);

    // Reset PCB Design
    setPcbDesignOnlyFile(null);

    // Reset 3D Design
    setFilament("");
    setThreeDDesignFile(null);

    // Reset Website Design
    setWebsiteType("");
    setWebsitePagesCount("");
    setWebsiteRequiredPages([]);
    setWebsiteResponsive("Yes");
    setWebsiteReferenceUrl("");
    setWebsiteRequiredFeatures("");
    setWebsiteContentStatus("");
    setWebsiteDesignReference("");
    setWebsitePreferredTechnology("");
    setWebsiteExpectedTimeline("");
    setWebsiteAdditionalRequirements("");
  };

  const handleServiceChange = (event) => {
    const selectedService = event.target.value;
    setService(selectedService);
    setStatusMessage(null);
    resetFacilityFields();
  };

  // PCB Fabrication File Change
  const handlePcbFabFileChange = (event) => {
    const file = event.target.files?.[0];
    setStatusMessage(null);

    if (!file) {
      setPcbDesignFile(null);
      return;
    }

    const fileName = file.name.toLowerCase();
    const isGbr = fileName.endsWith(".gbr");
    const isDxf = fileName.endsWith(".dxf");
    const isZip = fileName.endsWith(".zip");
    const isDrl = fileName.endsWith(".drl");

    if (!isGbr && !isDxf && !isZip && !isDrl) {
      setStatusMessage({
        type: "error",
        text: "PCB Fabrication design file must be a .gbr, .dxf, .zip, or .drl file.",
      });
      event.target.value = "";
      setPcbDesignFile(null);
      return;
    }

    setPcbDesignFile(file);
  };

  // Laser Cutter File Change
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

  // PCB Design File Change
  const handlePcbDesignOnlyFileChange = (event) => {
    const file = event.target.files?.[0];
    setStatusMessage(null);

    if (!file) {
      setPcbDesignOnlyFile(null);
      return;
    }

    const fileName = file.name.toLowerCase();
    const isPdf = fileName.endsWith(".pdf");
    const isZip = fileName.endsWith(".zip");

    if (!isPdf && !isZip) {
      setStatusMessage({
        type: "error",
        text: "PCB Design file must be a .pdf or .zip file.",
      });
      event.target.value = "";
      setPcbDesignOnlyFile(null);
      return;
    }

    setPcbDesignOnlyFile(file);
  };

  // 3D Design File Change
  const handleThreeDFileChange = (event) => {
    const file = event.target.files?.[0];
    setStatusMessage(null);

    if (!file) {
      setThreeDDesignFile(null);
      return;
    }

    const fileName = file.name.toLowerCase();

    if (!fileName.endsWith(".stl")) {
      setStatusMessage({
        type: "error",
        text: "3D Design file must be a .stl file.",
      });
      event.target.value = "";
      setThreeDDesignFile(null);
      return;
    }

    setThreeDDesignFile(file);
  };

  // Website Required Pages Toggle
  const toggleRequiredPage = (pageName) => {
    setWebsiteRequiredPages((prev) =>
      prev.includes(pageName)
        ? prev.filter((p) => p !== pageName)
        : [...prev, pageName]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage(null);

    if (!service) {
      setStatusMessage({
        type: "error",
        text: "Please select a facility.",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatusMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    // Determine design file requirement per facility
    let activeFile = null;

    if (service === "PCB Fabrication") {
      activeFile = pcbDesignFile;
      if (!activeFile) {
        setStatusMessage({
          type: "error",
          text: "Please select a valid PCB Fabrication design file (.gbr, .dxf, .zip, .drl).",
        });
        return;
      }
      if (!pcbLayer) {
        setStatusMessage({
          type: "error",
          text: "Layer is required for PCB Fabrication.",
        });
        return;
      }
    } else if (service === "Laser Cutter") {
      activeFile = laserDesignFile;
      if (!activeFile) {
        setStatusMessage({
          type: "error",
          text: "Please select a valid Laser Cutter design file (.dxf).",
        });
        return;
      }
    } else if (service === "PCB Design") {
      activeFile = pcbDesignOnlyFile;
      if (!activeFile) {
        setStatusMessage({
          type: "error",
          text: "Please select a valid PCB Design file (.pdf, .zip).",
        });
        return;
      }
    } else if (service === "3D Design") {
      activeFile = threeDDesignFile;
      if (!activeFile) {
        setStatusMessage({
          type: "error",
          text: "Please select a valid 3D Design file (.stl).",
        });
        return;
      }
      if (!filament) {
        setStatusMessage({
          type: "error",
          text: "Filament is required for 3D Design.",
        });
        return;
      }
    } else if (service === "Website Design") {
      if (!websiteType) {
        setStatusMessage({
          type: "error",
          text: "Website Type is required for Website Design.",
        });
        return;
      }
    }

    // Prepare FormData
    const apiFormData = new FormData();

    apiFormData.append("service", service);
    apiFormData.append("name", name.trim());
    apiFormData.append("instituteCompany", instituteCompany.trim());
    apiFormData.append("department", department.trim());
    apiFormData.append("email", email.trim());
    apiFormData.append("contactNumber", contactNumber.trim());

    if (service === "PCB Fabrication") {
      apiFormData.append("length", pcbLength);
      apiFormData.append("breadth", pcbBreadth);
      apiFormData.append("thickness", pcbThickness);
      apiFormData.append("material", pcbMaterial.trim());
      apiFormData.append("layer", pcbLayer);
      apiFormData.append("designFile", activeFile);
    } else if (service === "Laser Cutter") {
      apiFormData.append("material", laserMaterial);
      apiFormData.append("thickness", laserThickness);
      apiFormData.append("designFile", activeFile);
    } else if (service === "PCB Design") {
      apiFormData.append("designFile", activeFile);
    } else if (service === "3D Design") {
      apiFormData.append("filament", filament);
      apiFormData.append("designFile", activeFile);
    } else if (service === "Website Design") {
      apiFormData.append("websiteType", websiteType);
      apiFormData.append("websitePagesCount", websitePagesCount);
      apiFormData.append("websiteRequiredPages", websiteRequiredPages.join(", "));
      apiFormData.append("websiteResponsive", websiteResponsive);
      apiFormData.append("websiteReferenceUrl", websiteReferenceUrl);
      apiFormData.append("websiteRequiredFeatures", websiteRequiredFeatures);
      apiFormData.append("websiteContentStatus", websiteContentStatus);
      apiFormData.append("websiteDesignReference", websiteDesignReference);
      apiFormData.append("websitePreferredTechnology", websitePreferredTechnology);
      apiFormData.append("websiteExpectedTimeline", websiteExpectedTimeline);
      apiFormData.append("websiteAdditionalRequirements", websiteAdditionalRequirements);
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        body: apiFormData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: data.message || "Booking request submitted successfully!",
        });

        // Reset common and facility form fields
        setName("");
        setInstituteCompany("");
        setDepartment("");
        setEmail("");
        setContactNumber("");
        setService("");
        resetFacilityFields();
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    value={instituteCompany}
                    onChange={(e) => setInstituteCompany(e.target.value)}
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
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Enter your contact number"
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />
                </div>

              </div>
            </div>

            {/* ================= FACILITY ================= */}
            <div className="mt-10">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">
                Facility Details
              </h2>

              <div>
                <label
                  htmlFor="service"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Facility <span className="text-red-500">*</span>
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
                  <option value="">Select a facility</option>
                  <option value="PCB Fabrication">PCB Fabrication</option>
                  <option value="Laser Cutter">Laser Cutter</option>
                  <option value="PCB Design">PCB Design</option>
                  <option value="3D Design">3D Design</option>
                  <option value="Website Design">Website Design</option>
                </select>
              </div>
            </div>

            {/* ===================================================== */}
            {/* ================= PCB FABRICATION =================== */}
            {/* ===================================================== */}

            {service === "PCB Fabrication" && (
              <div className="mb-10 border-t border-slate-100 pt-8">

                <h2 className="mb-6 text-2xl font-bold text-slate-900">
                  PCB Fabrication Details
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                  {/* ================= LENGTH ================= */}
                  <div>
                    <label
                      htmlFor="pcbLength"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Length (mm){" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        id="pcbLength"
                        name="length"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={pcbLength}
                        onChange={(e) => setPcbLength(e.target.value)}
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
                      htmlFor="pcbBreadth"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Breadth (mm){" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        id="pcbBreadth"
                        name="breadth"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={pcbBreadth}
                        onChange={(e) => setPcbBreadth(e.target.value)}
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

                  {/* ================= THICKNESS ================= */}
                  <div>
                    <label
                      htmlFor="pcbThickness"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Thickness (mm){" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        id="pcbThickness"
                        name="thickness"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={pcbThickness}
                        onChange={(e) => setPcbThickness(e.target.value)}
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

                  {/* ================= MATERIAL ================= */}
                  <div>
                    <label
                      htmlFor="pcbMaterial"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Material <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="pcbMaterial"
                      name="material"
                      type="text"
                      value={pcbMaterial}
                      onChange={(e) => setPcbMaterial(e.target.value)}
                      placeholder="Enter material"
                      required
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    />
                  </div>

                  {/* ================= LAYER ================= */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="pcbLayer"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Layer <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="pcbLayer"
                      name="layer"
                      value={pcbLayer}
                      onChange={(e) => setPcbLayer(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    >
                      <option value="">Select layer</option>
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                    </select>
                  </div>

                  {/* ================= PCB DESIGN FILE ================= */}
                  <div className="md:col-span-2">

                    <label
                      htmlFor="pcbDesign"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      PCB Fabrication Design File{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-blue-400 hover:bg-blue-50/30">

                      <input
                        id="pcbDesign"
                        name="pcbDesign"
                        type="file"
                        accept=".gbr,.dxf,.zip,.drl"
                        required
                        disabled={isSubmitting}
                        onChange={handlePcbFabFileChange}
                        className="block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-5 file:py-2.5 file:font-semibold file:text-white hover:file:bg-blue-700 disabled:opacity-60"
                      />

                      <p className="mt-3 text-sm text-slate-500">
                        Accepted:
                        <span className="ml-1 font-semibold text-blue-600">
                          .gbr, .dxf, .zip, .drl
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
                      htmlFor="laserMaterial"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Material <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="laserMaterial"
                      name="material"
                      value={laserMaterial}
                      onChange={(e) => setLaserMaterial(e.target.value)}
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
                      htmlFor="laserThickness"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Thickness (mm){" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        id="laserThickness"
                        name="thickness"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={laserThickness}
                        onChange={(e) => setLaserThickness(e.target.value)}
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

                  {/* ================= LASER DESIGN FILE ================ */}
                  <div className="md:col-span-2">

                    <label
                      htmlFor="laserDesign"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Laser Cutter Design File{" "}
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
                        Accepted:
                        <span className="ml-1 font-semibold text-blue-600">
                          .dxf, .zip,
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
            {/* ================= PCB DESIGN DETAILS ================ */}
            {/* ===================================================== */}

            {service === "PCB Design" && (
              <div className="mb-10 border-t border-slate-100 pt-8">

                <h2 className="mb-6 text-2xl font-bold text-slate-900">
                  PCB Design Details
                </h2>

                <div className="grid grid-cols-1 gap-6">

                  {/* ================= PCB DESIGN FILE ================ */}
                  <div>

                    <label
                      htmlFor="pcbDesignOnly"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      PCB Design File{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-blue-400 hover:bg-blue-50/30">

                      <input
                        id="pcbDesignOnly"
                        name="pcbDesignOnly"
                        type="file"
                        accept=".pdf,.zip"
                        required
                        disabled={isSubmitting}
                        onChange={handlePcbDesignOnlyFileChange}
                        className="block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-5 file:py-2.5 file:font-semibold file:text-white hover:file:bg-blue-700 disabled:opacity-60"
                      />

                      <p className="mt-3 text-sm text-slate-500">
                        Accepted:
                        <span className="ml-1 font-semibold text-blue-600">
                          .pdf, .zip
                        </span>
                      </p>

                      {pcbDesignOnlyFile && (
                        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                          <span className="font-semibold">
                            Selected file:
                          </span>{" "}
                          {pcbDesignOnlyFile.name}
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ===================================================== */}
            {/* ================= 3D DESIGN DETAILS ================= */}
            {/* ===================================================== */}

            {service === "3D Design" && (
              <div className="mb-10 border-t border-slate-100 pt-8">

                <h2 className="mb-6 text-2xl font-bold text-slate-900">
                  3D Design Details
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                  {/* ================= FILAMENT ================= */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="filament"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Filament <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="filament"
                      name="filament"
                      value={filament}
                      onChange={(e) => setFilament(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    >
                      <option value="">Select filament</option>
                      <option value="PLA">PLA</option>
                      <option value="ABS">ABS</option>
                    </select>
                  </div>

                  {/* ================= 3D DESIGN FILE ================ */}
                  <div className="md:col-span-2">

                    <label
                      htmlFor="threeDDesign"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      3D Design File{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-blue-400 hover:bg-blue-50/30">

                      <input
                        id="threeDDesign"
                        name="threeDDesign"
                        type="file"
                        accept=".stl"
                        required
                        disabled={isSubmitting}
                        onChange={handleThreeDFileChange}
                        className="block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-5 file:py-2.5 file:font-semibold file:text-white hover:file:bg-blue-700 disabled:opacity-60"
                      />

                      <p className="mt-3 text-sm text-slate-500">
                        Accepted:
                        <span className="ml-1 font-semibold text-blue-600">
                          .stl
                        </span>
                      </p>

                      {threeDDesignFile && (
                        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                          <span className="font-semibold">
                            Selected file:
                          </span>{" "}
                          {threeDDesignFile.name}
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ===================================================== */}
            {/* ============= WEBSITE DESIGN DETAILS ================ */}
            {/* ===================================================== */}

            {service === "Website Design" && (
              <div className="mb-10 border-t border-slate-100 pt-8">

                <h2 className="mb-6 text-2xl font-bold text-slate-900">
                  Website Design Requirements
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                  {/* 1. WEBSITE TYPE */}
                  <div>
                    <label
                      htmlFor="websiteType"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Website Type <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="websiteType"
                      name="websiteType"
                      value={websiteType}
                      onChange={(e) => setWebsiteType(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    >
                      <option value="">Select website type</option>
                      <option value="Business Website">Business Website</option>
                      <option value="Portfolio Website">Portfolio Website</option>
                      <option value="E-commerce Website">E-commerce Website</option>
                      <option value="Educational Website">Educational Website</option>
                      <option value="Blog / Content Website">Blog / Content Website</option>
                      <option value="Landing Page">Landing Page</option>
                      <option value="Web Application">Web Application</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* 2. NUMBER OF PAGES */}
                  <div>
                    <label
                      htmlFor="websitePagesCount"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Number of Pages
                    </label>

                    <input
                      id="websitePagesCount"
                      name="websitePagesCount"
                      type="number"
                      min="1"
                      step="1"
                      value={websitePagesCount}
                      onChange={(e) => setWebsitePagesCount(e.target.value)}
                      placeholder="e.g. 5"
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    />
                  </div>

                  {/* 3. REQUIRED PAGES */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Required Pages
                    </label>
                    <div className="flex flex-wrap gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                      {REQUIRED_PAGE_OPTIONS.map((page) => {
                        const isSelected = websiteRequiredPages.includes(page);
                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() => toggleRequiredPage(page)}
                            disabled={isSubmitting}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${isSelected
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                              }`}
                          >
                            {isSelected ? "✓ " : "+ "}{page}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. RESPONSIVE DESIGN */}
                  <div>
                    <label
                      htmlFor="websiteResponsive"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Responsive Design
                    </label>

                    <select
                      id="websiteResponsive"
                      name="websiteResponsive"
                      value={websiteResponsive}
                      onChange={(e) => setWebsiteResponsive(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {/* 5. EXISTING WEBSITE / REFERENCE URL */}
                  <div>
                    <label
                      htmlFor="websiteReferenceUrl"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Existing Website / Reference URL
                    </label>

                    <input
                      id="websiteReferenceUrl"
                      name="websiteReferenceUrl"
                      type="url"
                      value={websiteReferenceUrl}
                      onChange={(e) => setWebsiteReferenceUrl(e.target.value)}
                      placeholder="https://example.com"
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    />
                  </div>

                  {/* 6. REQUIRED FEATURES */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="websiteRequiredFeatures"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Required Features
                    </label>

                    <textarea
                      id="websiteRequiredFeatures"
                      name="websiteRequiredFeatures"
                      rows="3"
                      value={websiteRequiredFeatures}
                      onChange={(e) => setWebsiteRequiredFeatures(e.target.value)}
                      placeholder="Login, contact form, payment gateway, admin panel, booking system, animations, etc."
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    />
                  </div>

                  {/* 7. CONTENT AVAILABILITY */}
                  <div>
                    <label
                      htmlFor="websiteContentStatus"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Content Availability
                    </label>

                    <select
                      id="websiteContentStatus"
                      name="websiteContentStatus"
                      value={websiteContentStatus}
                      onChange={(e) => setWebsiteContentStatus(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    >
                      <option value="">Select content status</option>
                      <option value="Content Ready">Content Ready</option>
                      <option value="Content Required">Content Required</option>
                      <option value="Partially Ready">Partially Ready</option>
                    </select>
                  </div>

                  {/* 8. DESIGN REFERENCE / INSPIRATION */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="websiteDesignReference"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Design Reference / Inspiration
                    </label>

                    <textarea
                      id="websiteDesignReference"
                      name="websiteDesignReference"
                      rows="3"
                      value={websiteDesignReference}
                      onChange={(e) => setWebsiteDesignReference(e.target.value)}
                      placeholder="Describe the design, style, colors, or websites you want us to refer to."
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    />
                  </div>

                  {/* 9. PREFERRED TECHNOLOGY */}
                  <div>
                    <label
                      htmlFor="websitePreferredTechnology"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Preferred Technology
                    </label>

                    <select
                      id="websitePreferredTechnology"
                      name="websitePreferredTechnology"
                      value={websitePreferredTechnology}
                      onChange={(e) => setWebsitePreferredTechnology(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    >
                      <option value="">Select technology preference</option>
                      <option value="No Preference">No Preference</option>
                      <option value="React">React</option>
                      <option value="Next.js">Next.js</option>
                      <option value="HTML/CSS/JavaScript">HTML/CSS/JavaScript</option>
                      <option value="WordPress">WordPress</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* 10. EXPECTED TIMELINE */}
                  <div>
                    <label
                      htmlFor="websiteExpectedTimeline"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Expected Timeline
                    </label>

                    <select
                      id="websiteExpectedTimeline"
                      name="websiteExpectedTimeline"
                      value={websiteExpectedTimeline}
                      onChange={(e) => setWebsiteExpectedTimeline(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    >
                      <option value="">Select timeline</option>
                      <option value="Urgent">Urgent</option>
                      <option value="1 Week">1 Week</option>
                      <option value="2 Weeks">2 Weeks</option>
                      <option value="1 Month">1 Month</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>

                  {/* 11. ADDITIONAL REQUIREMENTS */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="websiteAdditionalRequirements"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Additional Requirements
                    </label>

                    <textarea
                      id="websiteAdditionalRequirements"
                      name="websiteAdditionalRequirements"
                      rows="3"
                      value={websiteAdditionalRequirements}
                      onChange={(e) => setWebsiteAdditionalRequirements(e.target.value)}
                      placeholder="Enter any other requirements for the website."
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    />
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