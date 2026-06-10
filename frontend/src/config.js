export const CONFIG = {
  phone: import.meta.env.VITE_CONTACT_PHONE || '+919916625306',
  phoneDisplay: import.meta.env.VITE_CONTACT_PHONE_DISPLAY || '+91 9916625306',
  whatsappPhone: import.meta.env.VITE_WHATSAPP_PHONE || '918073183863',
  email: import.meta.env.VITE_CONTACT_EMAIL || 'parichayatoursandtravels@gmail.com',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  get whatsappUrl() {
    return `https://wa.me/${this.whatsappPhone}`;
  }
};
