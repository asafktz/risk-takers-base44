import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import TornPaper from '../components/TornPaper';
import { Loader2, CheckCircle2, Upload, AlertCircle } from 'lucide-react';
import { setSEO } from '@/lib/seo';

export default function GuestIntake() {
  React.useEffect(() => {
    setSEO({
      title: 'Guest Information',
      description: 'Private guest intake form for upcoming Risk Takers guests.',
      path: '/GuestIntake',
      noindex: true
    });
  }, []);

  const [formData, setFormData] = useState({
    full_name: '',
    preferred_name: '',
    title: '',
    bio: '',
    photo_preference: 'upload', // 'upload' or 'we_provide'
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    phone: '',
    phone_extension: ''
  });
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let imageUrl = '';
      
      // Upload photo if provided
      if (photoFile && formData.photo_preference === 'upload') {
        const { file_url } = await base44.integrations.Core.UploadFile({
          file: photoFile
        });
        imageUrl = file_url;
        if (!imageUrl) {
          throw new Error('Failed to upload photo. Please try again.');
        }
      }

      // Create guest record
      await base44.entities.Guest.create({
        name: formData.full_name,
        preferred_name: formData.preferred_name,
        title: formData.title,
        bio: formData.bio,
        image_url: imageUrl,
        shipping_address: {
          line1: formData.address_line1,
          line2: formData.address_line2,
          city: formData.city,
          state: formData.state,
          zip: formData.zip_code,
          country: formData.country
        },
        phone: formData.phone,
        phone_extension: formData.phone_extension,
        photo_preference: formData.photo_preference
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError('Unable to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-4 border-[#1F1F1F]">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-[#111111] mb-2">Thank You!</h2>
            <p className="text-[#666666]">
              Your information has been submitted successfully. We'll be in touch soon!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E6E1] py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <TornPaper variant="both" bgColor="#1F1F1F" className="inline-block mb-6" rotate={-0.5}>
            <h1 className="px-8 py-5 text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
              Guest Information
            </h1>
          </TornPaper>
          <p className="text-lg text-[#333333]">
            Help us get to know you better for your upcoming appearance on Risk Takers.
          </p>
        </div>

        <Card className="border-4 border-[#1F1F1F]">
          <CardContent className="p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-black text-[#111111] mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name" className="text-[#111111] font-bold">Full Name *</Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                      className="mt-1 border-2 border-[#E5E3DE]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferred_name" className="text-[#111111] font-bold">How would you like to be called?</Label>
                    <Input
                      id="preferred_name"
                      type="text"
                      value={formData.preferred_name}
                      onChange={(e) => setFormData({ ...formData, preferred_name: e.target.value })}
                      placeholder="e.g., Bob instead of Robert"
                      className="mt-1 border-2 border-[#E5E3DE]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="title" className="text-[#111111] font-bold">Professional Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., CEO @ Company"
                      required
                      className="mt-1 border-2 border-[#E5E3DE]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-[#111111] font-bold">How would you like to be seen/introduced? *</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself and what you'd like viewers to know..."
                      required
                      rows={4}
                      className="mt-1 border-2 border-[#E5E3DE]"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Section */}
              <div className="border-t-2 border-[#E5E3DE] pt-6">
                <h3 className="text-xl font-black text-[#111111] mb-4">Profile Photo</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="photo_preference"
                        value="upload"
                        checked={formData.photo_preference === 'upload'}
                        onChange={(e) => setFormData({ ...formData, photo_preference: e.target.value })}
                        className="w-4 h-4"
                      />
                      <span className="text-[#333333]">I'll upload a photo</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="photo_preference"
                        value="we_provide"
                        checked={formData.photo_preference === 'we_provide'}
                        onChange={(e) => setFormData({ ...formData, photo_preference: e.target.value })}
                        className="w-4 h-4"
                      />
                      <span className="text-[#333333]">We'll provide a photo</span>
                    </label>
                  </div>

                  {formData.photo_preference === 'upload' && (
                    <div>
                      <Label htmlFor="photo" className="text-[#111111] font-bold">Upload Photo</Label>
                      <div className="mt-2 flex items-center gap-4">
                        {photoPreview ? (
                          <img 
                            src={photoPreview} 
                            alt="Preview" 
                            className="w-24 h-24 object-cover rounded border-2 border-[#E5E3DE]"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-[#F4F2ED] border-2 border-dashed border-[#E5E3DE] rounded flex items-center justify-center">
                            <Upload className="w-8 h-8 text-[#999999]" />
                          </div>
                        )}
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="border-2 border-[#E5E3DE]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t-2 border-[#E5E3DE] pt-6">
                <h3 className="text-xl font-black text-[#111111] mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="phone" className="text-[#111111] font-bold">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        required
                        className="mt-1 border-2 border-[#E5E3DE]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone_extension" className="text-[#111111] font-bold">Extension</Label>
                      <Input
                        id="phone_extension"
                        type="text"
                        value={formData.phone_extension}
                        onChange={(e) => setFormData({ ...formData, phone_extension: e.target.value })}
                        placeholder="123"
                        className="mt-1 border-2 border-[#E5E3DE]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-t-2 border-[#E5E3DE] pt-6">
                <h3 className="text-xl font-black text-[#111111] mb-2">Shipping Address</h3>
                <p className="text-sm text-[#666666] mb-4">We'd like to send you a little something to say thank you!</p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address_line1" className="text-[#111111] font-bold">Address Line 1 *</Label>
                    <Input
                      id="address_line1"
                      type="text"
                      value={formData.address_line1}
                      onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                      placeholder="Street address, P.O. box"
                      required
                      className="mt-1 border-2 border-[#E5E3DE]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address_line2" className="text-[#111111] font-bold">Address Line 2</Label>
                    <Input
                      id="address_line2"
                      type="text"
                      value={formData.address_line2}
                      onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                      placeholder="Apartment, suite, unit, building, floor, etc."
                      className="mt-1 border-2 border-[#E5E3DE]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-[#111111] font-bold">City *</Label>
                      <Input
                        id="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                        className="mt-1 border-2 border-[#E5E3DE]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="state" className="text-[#111111] font-bold">State / Province *</Label>
                      <Input
                        id="state"
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                        className="mt-1 border-2 border-[#E5E3DE]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zip_code" className="text-[#111111] font-bold">Zip / Postal Code *</Label>
                      <Input
                        id="zip_code"
                        type="text"
                        value={formData.zip_code}
                        onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                        required
                        className="mt-1 border-2 border-[#E5E3DE]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="country" className="text-[#111111] font-bold">Country *</Label>
                      <Input
                        id="country"
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        required
                        className="mt-1 border-2 border-[#E5E3DE]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-300 rounded">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-[#C0392B] hover:bg-[#A0301B] text-white font-bold py-6 text-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Information'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
