import { faSolarPanel, faMicrochip, faIndustry } from '@fortawesome/free-solid-svg-icons';

//Images
import solar from '../assets/images/solar.jpg';
import automation from '../assets/images/automation.jpg';
import heavyeng from '../assets/images/heavyeng.jpg';


export const divisions = [
  {
    id: 1,
    title: 'Solar & Energy Systems',
    subtitle: 'Complete Solar Power Solutions',
    description: 'Focused on performance, reliability, and long-term savings.',
    details: 'Delivering complete solar power solutions for homes, businesses, and industries focused on performance, reliability, and long-term savings.',
    image: [solar],
    link: '/solar-energy',
    icon: faSolarPanel,
    path: "/solar-energy",
    subdivisions: [
      {
        id: 1,
        title: 'Home / Residential Solar Solutions',
        description: 'We offer 5–20 kW on-grid, off-grid, and hybrid rooftop systems, complete with battery storage and expert after-sales service.',
        services: [
          "Residential Rooftop Systems (5 kW, 10 kW, 20 kW)",
          "On-grid, Off-grid, and Hybrid Solutions",
          "High-Performance Battery Energy Storage",
          "End-to-End Design, Installation, and Commissioning",
          "Professional After-Sales: Cleaning, Inspection, and Repair"
        ],
        path: "/solar-home",
      },
      {
        id: 2,
        title: 'Industry Solar Solutions', 
        description: 'Customized large-scale and hybrid installations for factories and commercial buildings.',
        services: [
          "Infrastructure & Design: We specialize in the engineering and deployment of large-scale rooftop and ground-mounted arrays, utilizing bespoke designs specifically optimized for the structural and energy requirements of factories, warehouses, and commercial facilities. Our technical expertise extends to advanced hybrid configurations, ensuring seamless integration with existing power grids or independent operation.",
          "Strategic Value & Sustainability : Our industrial solar solutions are a strategic investment designed to substantially mitigate escalating operational costs and shield businesses from energy price volatility. By implementing high-efficiency photovoltaic infrastructure, we empower organizations to achieve their ESG (Environmental, Social, and Governance) targets and demonstrate a clear commitment to corporate sustainability."
        ],
        path: "/solar-industry",
      }
    ]
  },
  {
    id: 2,
    title: 'Advanced Engineering & Automation',
    subtitle: 'Smart Industrial Technologies',
    description: 'Industry 4.0, PLC/SCADA, IoT solutions.',
    details:'The Advanced Engineering & Automation Division at S & D Solutions (Pvt) Ltd accelerates digital transformation by integrating Industry 4.0 paradigms into the industrial landscape. We empower organizations to achieve heightened productivity, energy efficiency, and resource optimization through strategic deployment of PLC, SCADA, IoT, and advanced cooling solutions installation & commissioning for critical processes. By synthesizing intelligent automation with precision thermal management and engineering expertise, we ensure operational excellence and sustainable, future-proofed industrial growth.',
    services: [
      "Precision thermal management for high-demand industrial applications.",
      "Advanced cooling solutions installation and commissioning for critical processes.",
      "Integrated automation frameworks featuring PLC, SCADA, and intelligent controls.",
      "Bespoke product development and custom machinery engineering.",
      "Industry 4.0 ecosystems: IoT integration and real-time data monitoring.",
      "Strategic process optimization and energy-efficient system integration."
    ],
    path: "/automation",
    image: [automation],
    link: '/automation',
    icon: faMicrochip
  },
  {
    id: 3,
    title: 'Heavy and General Engineering',
    subtitle: 'Reliable Engineering Services',
    description: 'Fabrication, maintenance, and structural works.',
    details: 'The Heavy & General Engineering Division at S & D Solutions (Pvt) Ltd. delivers precision-engineered, scalable solutions across the industrial and infrastructure sectors. Anchored by a commitment to technical excellence and rigorous safety standards, we provide cost-effective, high-performance engineering tailored to optimize operational lifecycle and efficiency.',
    services: [
      "Precision mechanical fabrication and turnkey installation services.",
      "Industrial utility systems, specialized piping, and structural engineering.",
      "Asset maintenance and integrated plant support to ensure operational uptime.",
      "Bespoke machinery modification, refurbishment, and repair.",
      "Technical advisory and dedicated on-site engineering support."
    ],
    path: "/engineering",
    image: [heavyeng],
    link: '/engineering',
    icon: faIndustry
  }
];