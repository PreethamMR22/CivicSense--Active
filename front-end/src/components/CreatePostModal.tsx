import { useState } from 'react';
import { X, Image as ImageIcon, MapPin, Tag, Folder, Sparkles } from 'lucide-react';
import LoadingModal from './LoadingModal';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostsContext';
import { categorizePost } from '../utils/gemini';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
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
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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


  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    
    try { 
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          (error) => {
            let errorMessage = 'Unable to retrieve your location';
            
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access was denied. Please enable location services and try again.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable. Please check your connection and try again.';
                break;
              case error.TIMEOUT:
                errorMessage = 'The request to get your location timed out. Please try again.';
                break;
              default:
                errorMessage = `An unknown error occurred: ${error.message}`;
            }
            
            console.error('Geolocation error:', error);
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 15000, // 15 seconds
            maximumAge: 0 // Force fresh location
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Get address from coordinates using reverse geocoding with rate limiting
      try {
        // Add a small delay to respect rate limits (max 1 request per second)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'CivicSense/1.0 (your-email@example.com)' // Replace with your app's name and contact email
            }
          }
        );
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a few seconds.');
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch address: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const address = data.display_name || 'Current Location';
        
        setLocation({
          address: address,
          latitude: latitude,
          longitude: longitude,
          isLocated: true
        });
      } catch (error) {
        // If address lookup fails, still use the coordinates
        console.warn('Error getting address, using coordinates only:', error);
        setLocation({
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          latitude: latitude,
          longitude: longitude,
          isLocated: true
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert(error instanceof Error ? error.message : 'Unable to retrieve your location. Please check your browser permissions.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)');
      return;
    }

    setLocation({
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      latitude: lat,
      longitude: lng,
      isLocated: true
    });

    // Close the manual input section
    setShowManualInput(false);
    setManualLat('');
    setManualLng('');
  };

  const handleAutoCategorize = async () => {
    if (!description.trim()) {
      alert('Please enter a description first');
      return;
    }

    setIsCategorizing(true);
    try {
      const category = await categorizePost(description);
      setCategory(category);
    } catch (error) {
      console.error('Auto-categorization failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to auto-categorize. Please select a category manually.');
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
       const formData = new FormData();
      
      // Add text fields
      formData.append('userId', user._id);
      formData.append('userName', user.name);
      formData.append('description', description);
      formData.append('category', category || 'Other');
      formData.append('location', location.isLocated 
        ? `${location.latitude},${location.longitude}` 
        : location.address || '');
      formData.append('tags', tags.split(',').map(tag => tag.trim()).filter(Boolean).join(','));
      
      // Add image file if available
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput.files && fileInput.files[0]) {
        formData.append('image', fileInput.files[0]);
      }

      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Don't set Content-Type header - let the browser set it with the correct boundary
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create post');
      }

      // Submit to our backend API which will forward to the external service
      setIsSubmitting(true);
      
      // First submit to our backend API which will forward to the external service
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('User email not found. Please log in again.');
      }

      // Call our backend endpoint which will handle the external API call
      const complaintResponse = await fetch('http://localhost:5000/api/external/submit-complaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          description,
          latitude: location.latitude,
          longitude: location.longitude,
          citizen_email: userEmail
        })
      });

      if (!complaintResponse.ok) {
        const errorData = await complaintResponse.json();
        throw new Error(errorData.error || 'Failed to submit complaint');
      }

      // Close the modal on success
      onClose();
    } catch (error: unknown) {
      console.error('Failed to create post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post. Please try again.';
      alert(errorMessage);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900">Create Complaint</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{user?.name || 'User'}</h3>
              <p className="text-xs text-gray-500">Posting as yourself</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Folder className="w-4 h-4 text-gray-500" />
                Category *
              </label>
<button
                type="button"
                onClick={handleAutoCategorize}
                disabled={isCategorizing || !description.trim()}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all ${
                  isCategorizing || !description.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isCategorizing ? 'opacity-50' : ''}`} />
                {isCategorizing ? 'Analyzing...' : 'Auto Categorize'}
              </button>
            </div>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-colors"
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                rows={4}
                placeholder="Describe the issue in detail..."
                required
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {description.length}/1000
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4 text-gray-500" />
                Location
              </label>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLocating}
                className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-100"
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
            
            <div className="mt-2 mb-3">
              <button
                type="button"
                onClick={() => setShowManualInput(!showManualInput)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {showManualInput ? 'Hide manual input' : 'Enter coordinates manually'}
              </button>

              {showManualInput && (
                <form onSubmit={handleManualLocationSubmit} className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        step="any"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        placeholder="Latitude (-90 to 90)"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs"
                        min="-90"
                        max="90"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        step="any"
                        value={manualLng}
                        onChange={(e) => setManualLng(e.target.value)}
                        placeholder="Longitude (-180 to 180)"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs"
                        min="-180"
                        max="180"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowManualInput(false);
                        setManualLat('');
                        setManualLng('');
                      }}
                      className="px-2 py-1 text-xs text-gray-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-500"
                    >
                      Use Coordinates
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            <div className="space-y-2">
              <input
                type="text"
                value={location.address}
                onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 text-gray-500" />
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., safety, urgent (comma separated, max 5 tags)"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Add Image (Optional)
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 border-gray-300 hover:bg-gray-100 transition-colors relative"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    <span className="text-blue-600 hover:underline">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (max. 5MB)</p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            {imagePreview && (
              <div className="mt-2 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-48 rounded-lg object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>Post Complaint</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </form>
      </div>
      
<LoadingModal 
        isOpen={isSubmitting || isCategorizing} 
        animationType={isCategorizing ? 'categorize' : 'submit'}
      />
    </div>
  );
}
