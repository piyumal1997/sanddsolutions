const partnerModules = import.meta.glob('../assets/images/partners/*.{png,jpg,jpeg,svg}', { eager: true });

export const partners = Object.values(partnerModules).map((module) => ({
  name: 'Partner Logo', // Generic name; derive from filename if needed
  logo: module.default // Path to image
}));