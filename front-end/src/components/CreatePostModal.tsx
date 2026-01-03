import { useState } from 'react';
import { X, Image as ImageIcon, MapPin, Tag, Folder } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostsContext';

interface CreatePostModalProps {
  onClose: () => void;
}

export default function CreatePostModal({ onClose }: CreatePostModalProps) {
  const { user } = useAuth();
  const { addPost } = usePosts();
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState({
    address: '',
    latitude: 0,
    longitude: 0,
    isLocated: false
  });
  const [isLocating, setIsLocating] = useState(false);

  const categories = [
    {
      name: 'Infrastructure',
      description: 'roads, potholes, bridges, drainage, public buildings'
    },
    {
      name: 'Public Utilities',
      description: 'water supply, electricity, street lights, sewage, waste management'
    },
    {
      name: 'Urban Maintenance',
      description: 'road repairs, garbage collection, park maintenance, sanitation'
    },
    {
      name: 'Public Safety & Law Enforcement',
      description: 'theft, harassment, traffic violations, illegal activities'
    },
    {
      name: 'Emergency Services',
      description: 'ambulance, fire services, disaster response, medical emergencies'
    },
    {
      name: 'Traffic & Transportation',
      description: 'signals, congestion, public transport issues, accidents'
    },
    {
      name: 'Environmental Issues',
      description: 'air/noise pollution, illegal dumping, tree cutting, water contamination'
    },
    {
      name: 'Civic Administration',
      description: 'municipal services, documentation issues, approvals, grievances'
    },
    {
      name: 'Public Health & Hygiene',
      description: 'disease outbreaks, food safety, unhygienic conditions'
    },
    {
      name: 'Community & Social Issues',
      description: 'public nuisance, animal control, encroachments'
    }
  ] as const;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      
      // Get address from coordinates using reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      const data = await response.json();
      
      const address = data.display_name || 'Current Location';
      
      setLocation({
        address: address,
        latitude: latitude,
        longitude: longitude,
        isLocated: true
      });
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to retrieve your location. Please check your browser permissions.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const locationText = location.isLocated 
      ? `${location.address} (${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)})`
      : location.address || 'Location not specified';

    addPost({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      description,
      imageUrl: imagePreview || undefined,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      category: category || 'Other',
      location: locationText,
      latitude: location.isLocated ? location.latitude : undefined,
      longitude: location.isLocated ? location.longitude : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-gray-900 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Create Complaint</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Folder className="w-4 h-4" />
              Category *
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option 
                    key={cat.name} 
                    value={cat.name}
                    title={cat.description}
                    className="group"
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="absolute z-10 mt-1 w-full bg-white text-gray-800 rounded-lg shadow-lg hidden group-hover:block">
                {categories.map((cat) => (
                  <div 
                    key={cat.name}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setCategory(cat.name)}
                  >
                    <div className="font-medium">{cat.name}</div>
                    <div className="text-sm text-gray-600">{cat.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Describe the issue..."
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLocating}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLocating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Locating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Use Current Location
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-2">
              <input
                type="text"
                value={location.address}
                onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Main Street, Downtown"
              />
              {location.isLocated && (
                <div className="text-xs text-gray-400 bg-gray-800/30 px-3 py-2 rounded-lg">
                  <div className="font-medium text-blue-400">Current Location:</div>
                  <div className="truncate">{location.address}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    Latitude: {location.latitude.toFixed(6)}
                    <br />
                    Longitude: {location.longitude.toFixed(6)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., safety, urgent (comma separated)"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <ImageIcon className="w-4 h-4" />
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center justify-center w-full px-4 py-8 bg-gray-800/30 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:bg-gray-800/50 transition-all"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 rounded-lg object-cover"
                />
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Click to upload an image</p>
                </div>
              )}
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              Post Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
