// frontend/src/pages/public/AddListingPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, Upload, X, Plus, Trash2, Facebook, Instagram, Twitter, Linkedin, Youtube, MessageCircle, Loader2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import api from '../../utils/api';

const STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];
const IMAGE_TYPES = [
  { value: 'logo', label: 'Logo' },
  { value: 'cover', label: 'Cover / Banner' },
  { value: 'office', label: 'Office / Shopfront' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'product', label: 'Product Image' },
  { value: 'sidebar', label: 'Side Banner' },
];

const Section = ({ title, children }) => (
  <div className="card p-6 mb-5">
    <h3 className="font-display font-semibold text-navy-900 text-base mb-4 pb-3 border-b border-slate-100">{title}</h3>
    {children}
  </div>
);

const Field = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

export default function AddListingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEdit, setFetchingEdit] = useState(isEditing);
  const [listingId, setListingId] = useState(id || null);
  const [activeSection, setActiveSection] = useState('basic');
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    title: '', category_id: '', description: '', shortDescription: '',
    phone: '', email: '', website: '', address: '', suburb: '', city: '', state: '', postcode: '',
    abn: '', tags: '',
    socialFacebook: '', socialInstagram: '', socialTwitter: '',
    socialLinkedin: '', socialYoutube: '', socialWhatsapp: '',
  });

  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadType, setUploadType] = useState('gallery');

  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', priceUnit: '', imageUrl: '', category: '', isFeatured: false });

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(() => {});
    
    if (isEditing && id) {
      // Use the correct endpoint - you need to add this to backend
      api.get(`/listings/id/${id}`)
        .then(res => {
          const listing = res.data;
          setListingId(listing.id);
          setForm({
            title: listing.title || '',
            category_id: listing.categoryId || '',
            description: listing.description || '',
            shortDescription: listing.shortDescription || '',
            phone: listing.phone || '',
            email: listing.email || '',
            website: listing.website || '',
            address: listing.address || '',
            suburb: listing.suburb || '',
            city: listing.city || '',
            state: listing.state || '',
            postcode: listing.postcode || '',
            abn: listing.abn || '',
            tags: (listing.tags || []).join(', '),
            socialFacebook: listing.socialFacebook || '',
            socialInstagram: listing.socialInstagram || '',
            socialTwitter: listing.socialTwitter || '',
            socialLinkedin: listing.socialLinkedin || '',
            socialYoutube: listing.socialYoutube || '',
            socialWhatsapp: listing.socialWhatsapp || '',
          });
          setImages(listing.images || []);
          setProducts(listing.products || []);
          setFetchingEdit(false);
        })
        .catch(err => {
          console.error('Error fetching listing:', err);
          toast.error('Failed to load listing for editing');
          setFetchingEdit(false);
        });
    }
  }, [id, isEditing]);

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category_id) return toast.error('Title and category are required');
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      let savedId = listingId;
      if (isEditing && listingId) {
        await api.put(`/listings/${listingId}`, payload);
        toast.success('Listing updated!');
        navigate(`/listings/${form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
      } else {
        const res = await api.post('/listings', payload);
        savedId = res.data.id;
        setListingId(savedId);
        toast.success('Listing submitted for review!');
        setActiveSection('images');
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save listing');
    } finally { setLoading(false); }
  };

  const handleImageUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file || !listingId) {
    if (!listingId) toast.error('Save the listing first before adding images');
    return;
  }
  setUploadingImage(true);
  try {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('type', uploadType);
    const res = await api.post(`/listings/${listingId}/images`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    // Add the new image to the images list
    setImages(prev => [...prev, res.data.image]);
    
    // If this was a logo or cover, also update the form data
    if (uploadType === 'logo' && res.data.listing?.logoUrl) {
      setForm(prev => ({ ...prev, logoUrl: res.data.listing.logoUrl }));
    }
    if ((uploadType === 'cover' || uploadType === 'banner') && res.data.listing?.coverUrl) {
      setForm(prev => ({ ...prev, coverUrl: res.data.listing.coverUrl }));
    }
    
    toast.success('Image uploaded!');
  } catch (err) {
    toast.error(err.response?.data?.error || 'Upload failed');
  } finally { 
    setUploadingImage(false); 
    e.target.value = ''; 
  }
};

  const deleteImage = async (imageId) => {
    try {
      await api.delete(`/listings/${listingId}/images/${imageId}`);
      setImages(prev => prev.filter(i => i.id !== imageId));
      toast.success('Image removed');
    } catch { toast.error('Failed to remove image'); }
  };

  const addProduct = async () => {
    if (!newProduct.name) return toast.error('Product name is required');
    if (!listingId) return toast.error('Save the listing first before adding products');
    try {
      const res = await api.post(`/listings/${listingId}/products`, newProduct);
      setProducts(prev => [...prev, res.data]);
      setNewProduct({ name: '', description: '', price: '', priceUnit: '', imageUrl: '', category: '', isFeatured: false });
      toast.success('Product added!');
    } catch { toast.error('Failed to add product'); }
  };

  const deleteProduct = async (productId) => {
    try {
      await api.delete(`/listings/${listingId}/products/${productId}`);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product removed');
    } catch { toast.error('Failed to remove product'); }
  };

  if (fetchingEdit) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-navy-800 border-t-transparent rounded-full" />
      </div>
    </div>
  );

  const sections = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'contact', label: 'Contact' },
    { id: 'location', label: 'Location' },
    { id: 'social', label: 'Social Media' },
    { id: 'images', label: 'Images' },
    { id: 'products', label: 'Products/Services' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="bg-navy-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-3">
            <ChevronLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="font-display text-2xl font-bold text-white">
            {isEditing ? 'Edit Listing' : 'Add New Listing'}
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {isEditing ? 'Update your business information' : 'Fill in your details — submit, then add photos and products.'}
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Section tabs */}
        <div className="flex gap-1 flex-wrap bg-white rounded-xl p-1.5 shadow-sm border border-slate-100 mb-6">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${activeSection === s.id ? 'bg-navy-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          {activeSection === 'basic' && (
            <Section title="Basic Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Business Name" required>
                    <input required value={form.title} onChange={set('title')} placeholder="e.g. Spice Route Restaurant" className="input" />
                  </Field>
                </div>
                <Field label="Category" required>
                  <select required value={form.category_id} onChange={set('category_id')} className="input">
                    <option value="">Select category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="ABN">
                  <input value={form.abn} onChange={set('abn')} placeholder="12 345 678 901" className="input" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Short Description" hint="One-line shown in search results (max 200 chars)">
                    <input value={form.shortDescription} onChange={set('shortDescription')} placeholder="Brief summary of your business" className="input" maxLength={200} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Full Description">
                    <textarea rows={5} value={form.description} onChange={set('description')} placeholder="Describe your business, services, specialties..." className="input resize-none" />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Tags / Keywords" hint="Comma separated — helps customers find you">
                    <div className="relative">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={form.tags} onChange={set('tags')} placeholder="indian food, curry, vegetarian, halal" className="input pl-8" />
                    </div>
                  </Field>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Submit & Continue'}
                </button>
              </div>
            </Section>
          )}

          {/* Contact */}
          {activeSection === 'contact' && (
            <Section title="Contact Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Phone"><input type="tel" value={form.phone} onChange={set('phone')} placeholder="03 XXXX XXXX" className="input" /></Field>
                <Field label="Email"><input type="email" value={form.email} onChange={set('email')} placeholder="info@yourbusiness.com.au" className="input" /></Field>
                <div className="sm:col-span-2">
                  <Field label="Website"><input type="url" value={form.website} onChange={set('website')} placeholder="https://www.yourbusiness.com.au" className="input" /></Field>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Changes
                </button>
              </div>
            </Section>
          )}

          {/* Location */}
          {activeSection === 'location' && (
            <Section title="Location">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><Field label="Street Address"><input value={form.address} onChange={set('address')} placeholder="123 Main Street" className="input" /></Field></div>
                <Field label="Suburb"><input value={form.suburb} onChange={set('suburb')} placeholder="e.g. Richmond" className="input" /></Field>
                <Field label="City"><input value={form.city} onChange={set('city')} placeholder="e.g. Melbourne" className="input" /></Field>
                <Field label="State"><select value={form.state} onChange={set('state')} className="input"><option value="">Select...</option>{STATES.map(s => <option key={s} value={s}>{s}</option>)}</select></Field>
                <Field label="Postcode"><input value={form.postcode} onChange={set('postcode')} placeholder="3000" className="input" maxLength={4} /></Field>
              </div>
              <div className="flex justify-end mt-4">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Changes
                </button>
              </div>
            </Section>
          )}

          {/* Social Media */}
          {activeSection === 'social' && (
            <Section title="Social Media & Messaging">
              <div className="space-y-3">
                {[
                  { key: 'socialFacebook', icon: Facebook, label: 'Facebook', placeholder: 'https://facebook.com/yourpage', color: 'text-blue-600' },
                  { key: 'socialInstagram', icon: Instagram, label: 'Instagram', placeholder: 'https://instagram.com/yourhandle', color: 'text-pink-600' },
                  { key: 'socialTwitter', icon: Twitter, label: 'Twitter / X', placeholder: 'https://twitter.com/yourhandle', color: 'text-slate-700' },
                  { key: 'socialLinkedin', icon: Linkedin, label: 'LinkedIn', placeholder: 'https://linkedin.com/company/...', color: 'text-blue-700' },
                  { key: 'socialYoutube', icon: Youtube, label: 'YouTube', placeholder: 'https://youtube.com/@channel', color: 'text-red-600' },
                  { key: 'socialWhatsapp', icon: MessageCircle, label: 'WhatsApp Number', placeholder: '61412345678', color: 'text-green-600' },
                ].map(({ key, icon: Icon, label, placeholder, color }) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 ${color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-0.5">{label}</label>
                      <input value={form[key]} onChange={set(key)} placeholder={placeholder} className="input text-sm" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Changes
                </button>
              </div>
            </Section>
          )}
        </form>

        {/* Images section */}
        {activeSection === 'images' && (
          <Section title="Business Images">
            {!listingId && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-amber-800 text-sm">⚠ Please save the basic info first before uploading images.</p>
              </div>
            )}
            <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm font-medium text-navy-800 mb-3">Upload a new image</p>
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Image Type</label>
                  <select value={uploadType} onChange={e => setUploadType(e.target.value)} className="input text-sm w-48">
                    {IMAGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <button type="button" disabled={!listingId || uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-primary text-sm px-5 py-2.5 disabled:opacity-50">
                    {uploadingImage ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                    {uploadingImage ? 'Uploading...' : 'Choose Image'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Max 5MB · JPG, PNG, WEBP</p>
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map(img => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <div className="aspect-video overflow-hidden">
                      <img src={img.url} alt={img.type} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600 capitalize bg-slate-100 px-2 py-0.5 rounded">{img.type}</span>
                      <button onClick={() => deleteImage(img.id)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-sm">
                <Upload size={28} className="mx-auto mb-2 text-slate-300" />
                No images uploaded yet. Use the form above to add your first image.
              </div>
            )}
          </Section>
        )}

        {/* Products/Services */}
        {activeSection === 'products' && (
          <Section title="Products & Services">
            {!listingId && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-amber-800 text-sm">⚠ Please save the basic info first before adding products.</p>
              </div>
            )}

            {/* Add product form */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-6">
              <p className="text-sm font-semibold text-navy-800 mb-3">Add Product / Service</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <input placeholder="Product / Service name *" value={newProduct.name}
                    onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} className="input text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <textarea rows={2} placeholder="Description" value={newProduct.description}
                    onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} className="input text-sm resize-none" />
                </div>
                <div className="flex gap-2">
                  <input placeholder="Price (e.g. 49.99)" type="number" step="0.01" value={newProduct.price}
                    onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} className="input text-sm flex-1" />
                  <input placeholder="Unit (per hr, each, from)" value={newProduct.priceUnit}
                    onChange={e => setNewProduct(p => ({ ...p, priceUnit: e.target.value }))} className="input text-sm flex-1" />
                </div>
                <input placeholder="Category (e.g. Food, Service)" value={newProduct.category}
                  onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} className="input text-sm" />
                <div className="sm:col-span-2">
                  <input placeholder="Image URL (optional)" value={newProduct.imageUrl}
                    onChange={e => setNewProduct(p => ({ ...p, imageUrl: e.target.value }))} className="input text-sm" />
                </div>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newProduct.isFeatured}
                      onChange={e => setNewProduct(p => ({ ...p, isFeatured: e.target.checked }))}
                      className="w-4 h-4 rounded" />
                    <span className="text-sm text-slate-600">Mark as Featured (shows on homepage)</span>
                  </label>
                </div>
              </div>
              <button type="button" onClick={addProduct} disabled={!listingId} className="btn-primary text-sm mt-3 px-5 py-2 disabled:opacity-50">
                <Plus size={14} /> Add Product
              </button>
            </div>

            {/* Product list */}
            {products.length > 0 ? (
              <div className="space-y-3">
                {products.map(p => (
                  <div key={p.id} className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-xl">
                    {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-lg object-cover border border-slate-100 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm text-navy-900">{p.name}</p>
                          {p.description && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.description}</p>}
                          <div className="flex items-center gap-2 mt-1">
                            {p.price != null && (
                              <span className="text-sm font-bold text-navy-800">
                                ${Number(p.price).toFixed(2)}
                                {p.priceUnit && <span className="text-xs font-normal text-slate-500 ml-1">{p.priceUnit}</span>}
                              </span>
                            )}
                            {p.category && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p.category}</span>}
                            {p.isFeatured && <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">Featured</span>}
                          </div>
                        </div>
                        <button onClick={() => deleteProduct(p.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-sm">
                No products or services added yet.
              </div>
            )}
          </Section>
        )}

        {listingId && activeSection !== 'basic' && (
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={() => navigate('/dashboard')} className="btn-outline">Done — Go to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}