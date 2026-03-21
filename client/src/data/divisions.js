import {
  faSolarPanel,
  faMicrochip,
  faIndustry,
  faSnowflake,
  faParagraph,
} from "@fortawesome/free-solid-svg-icons";

//Images
import solar from "../assets/images/solar/solar.jpg";
import automation from "../assets/images/automation/automation.jpg";
import heavyeng from "../assets/images/engineering/heavyeng.jpg";
import cooling from "../assets/images/cooling/cooling.jpg";
import industrySolar from "../assets/images/solar/industry_solar.png";
import homeSolar from "../assets/images/solar/home_solar.png";
import residentialCooling from "../assets/images/cooling/home_ac.png";
import commercialCooling from "../assets/images/cooling/industry_ac.png";

export const divisions = [
  {
    id: 1,
    title: "Solar & Energy Systems",
    subtitle: "Complete Solar Power Solutions",
    description: "Focused on performance, reliability, and long-term savings.",
    details:
      "Delivering complete solar power solutions for homes, businesses, and industries focused on performance, reliability, and long-term savings.",
    paragraph_one:
      "Embrace a sustainable future with S & D Solutions (Pvt) Ltd, Sri Lanka’s trusted partner for complete solar energy systems. Our Solar & Energy Systems division delivers high-performance, reliable, and cost-effective renewable solutions tailored to Sri Lanka’s abundant sunshine — empowering homes, businesses, and industries to slash electricity costs, gain energy independence, and build a greener nation.",
    paragraph_two:
      "Powered by premium solar panels, advanced inverters, high-capacity batteries (for hybrid/off-grid), and expert end-to-end execution — from site assessment and design to installation, commissioning, and long-term maintenance — we ensure maximum energy yield and lasting value.",
    image: solar,
    link: "/solar-energy",
    icon: faSolarPanel,
    path: "/solar-energy",
    subdivisions: [
      {
        id: 1,
        title: "Home / Residential Solar Solutions",
        description:
          "We offer 5–20 kW on-grid, off-grid, and hybrid rooftop systems, complete with battery storage and expert after-sales service.",
        services: [
          "Residential Rooftop Systems (5 kW, 10 kW, 20 kW)",
          "On-grid, Off-grid, and Hybrid Solutions",
          "High-Performance Battery Energy Storage",
          "End-to-End Design, Installation, and Commissioning",
          "Professional After-Sales: Cleaning, Inspection, and Repair",
        ],
        path: "/solar-home",
        image: homeSolar,
      },
      {
        id: 2,
        title: "Industry Solar Solutions",
        description:
          "Customized large-scale and hybrid installations for factories and commercial buildings.",
        services: [
          "Infrastructure & Design: We specialize in the engineering and deployment of large-scale rooftop and ground-mounted arrays, utilizing bespoke designs specifically optimized for the structural and energy requirements of factories, warehouses, and commercial facilities. Our technical expertise extends to advanced hybrid configurations, ensuring seamless integration with existing power grids or independent operation.",
          "Strategic Value & Sustainability : Our industrial solar solutions are a strategic investment designed to substantially mitigate escalating operational costs and shield businesses from energy price volatility. By implementing high-efficiency photovoltaic infrastructure, we empower organizations to achieve their ESG (Environmental, Social, and Governance) targets and demonstrate a clear commitment to corporate sustainability.",
        ],
        path: "/solar-industry",
        image: industrySolar,
      },
    ],
  },
  {
    id: 2,
    title: "Advanced Engineering & Automation",
    title_note:
      "Cutting-edge automation, control systems, and smart engineering solutions for enhanced efficiency and productivity across Sri Lanka.",
    subtitle: "Smart Industrial Technologies",
    description: "Industry 4.0, PLC/SCADA, IoT solutions.",
    details:
      "The Advanced Engineering & Automation Division at S & D Solutions (Pvt) Ltd accelerates digital transformation by integrating Industry 4.0 paradigms into the industrial landscape. We empower organizations to achieve heightened productivity, energy efficiency, and resource optimization through strategic deployment of PLC, SCADA, IoT, and advanced cooling solutions installation & commissioning for critical processes. By synthesizing intelligent automation with precision thermal management and engineering expertise, we ensure operational excellence and sustainable, future-proofed industrial growth.",
    paragraph_one:
      "FWe design and implement state-of-the-art automation systems that transform industrial processes, reduce downtime, improve safety, and significantly cut operational costs.",
    paragraph_two:
      "From concept to commissioning and after-sales support — our team delivers reliable, future-proof automation tailored to your industry requirements.",
    service_points: [
      "PLC & SCADA Systems",
      "Industrial Robotics",
      "Process Control & Instrumentation",
      "IoT & Industry 4.0 Integration",
      "Custom Control Panels",
      "Maintenance & Upgrades",
    ],
    services: [
      "Precision thermal management for high-demand industrial applications.",
      "Advanced cooling solutions installation and commissioning for critical processes.",
      "Integrated automation frameworks featuring PLC, SCADA, and intelligent controls.",
      "Bespoke product development and custom machinery engineering.",
      "Industry 4.0 ecosystems: IoT integration and real-time data monitoring.",
      "Strategic process optimization and energy-efficient system integration.",
    ],
    path: "/automation",
    image: automation,
    link: "/automation",
    icon: faMicrochip,
  },
  {
    id: 3,
    title: "Heavy and General Engineering",
    subtitle: "Reliable Engineering Services",
    title_note:
      "Comprehensive engineering services, custom fabrication, and project management tailored to diverse client needs across Sri Lanka.",
    description: "Fabrication, maintenance, and structural works.",
    details:
      "The Heavy & General Engineering Division at S & D Solutions (Pvt) Ltd. delivers precision-engineered, scalable solutions across the industrial and infrastructure sectors. Anchored by a commitment to technical excellence and rigorous safety standards, we provide cost-effective, high-performance engineering tailored to optimize operational lifecycle and efficiency.",
    paragraph_one:"From structural steel fabrication and heavy machinery components to complete turnkey industrial projects, we deliver robust, high-quality engineering solutions that meet the toughest demands.",
    paragraph_two:"With four years plus of experience and advanced facilities, we ensure every project is completed on time, within budget, and built to international standards.",
      service_points: [
      "Structural Steel Fabrication",
      "Custom Heavy Machinery Parts",
      "CNC Machining & Precision Parts",
      "Pressure Vessels & Tanks",
      "Industrial Plant Installation",
      "Project Management & Turnkey Solutions",
    ],
    services: [
      "Precision mechanical fabrication and turnkey installation services.",
      "Industrial utility systems, specialized piping, and structural engineering.",
      "Asset maintenance and integrated plant support to ensure operational uptime.",
      "Bespoke machinery modification, refurbishment, and repair.",
      "Technical advisory and dedicated on-site engineering support.",
    ],
    path: "/engineering",
    image: heavyeng,
    link: "/engineering",
    icon: faIndustry,
  },
  {
    id: 4,
    title: "Cooling Solutions",
    subtitle: "Advanced Climate Control Systems",
    description:
      "Energy-efficient air conditioning for residential, commercial & industrial needs.",
    details:
      "At S & D Solutions (Pvt) Ltd, we deliver state-of-the-art cooling solutions tailored to Sri Lanka’s tropical climate — from inverter split & cassette units for homes to high-efficiency VRV/VRF and chilled water systems for commercial and industrial applications. Our focus is on comfort, energy savings, quiet operation, and long-term reliability.",
    paragraph_one:"At S & D Solutions (Pvt) Ltd, we provide cutting-edge cooling solutions tailored to Sri Lanka’s tropical climate. From energy-efficient inverter ACs for homes to powerful VRV/VRF and central chilled water systems for commercial & industrial spaces — we ensure optimal comfort, energy savings, and reliability.",
    paragraph_two:"Our expert team delivers complete design, supply, installation, testing, and after-sales maintenance — giving you peace of mind and long-term performance.",
    image: cooling, // ← make sure this image exists
    link: "/cooling-solutions",
    icon: faSnowflake, // nice match for cooling
    path: "/cooling-solutions",
    subdivisions: [
      {
        id: 1,
        title: "Residential Air Conditioning",
        description:
          "Comfortable, quiet and energy-efficient cooling solutions for homes and apartments.",
        services: [
          "Wall-mounted & floor-standing inverter split systems",
          "Cassette & ducted units for villas and luxury apartments",
          "Smart Wi-Fi enabled ACs with energy monitoring",
          "Installation, annual maintenance contracts & refrigerant charging",
          "Fast response breakdown service",
        ],
        path: "/residential-cooling",
        image: residentialCooling,
      },
      {
        id: 2,
        title: "Commercial & Industrial Cooling",
        description:
          "High-capacity, reliable climate control for offices, factories, showrooms, hotels and data centers.",
        services: [
          "VRV / VRF multi-split systems for large buildings",
          "Central chilled water systems & air handling units",
          "Precision cooling for server rooms & medical facilities",
          "End-to-end project execution: design, supply, installation & commissioning",
          "BMS integration and remote monitoring capability",
        ],
        path: "/commercial-cooling",
        image: commercialCooling,
      },
    ],
  },
];
