import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Phone, MapPin, User, Briefcase, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function GuestIntakeManager() {
  const [selectedGuest, setSelectedGuest] = useState(null);

  const { data: guests = [], isLoading, refetch } = useQuery({
    queryKey: ['guestIntakes'],
    queryFn: () => base44.entities.Guest.list('-created_date')
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#666666]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#111111]">Guest Intake Forms</h2>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {guests.length} Total Submissions
        </Badge>
      </div>

      {guests.length === 0 ? (
        <Card className="border-2 border-[#E5E3DE]">
          <CardContent className="py-12 text-center">
            <p className="text-[#666666]">No guest intake forms submitted yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {guests.map((guest) => (
            <Card key={guest.id} className="border-2 border-[#E5E3DE] hover:border-[#1F1F1F] transition-colors">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    {guest.image_url ? (
                      <img 
                        src={guest.image_url} 
                        alt={guest.name}
                        className="w-24 h-24 object-cover rounded border-2 border-[#E5E3DE]"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-[#F4F2ED] border-2 border-[#E5E3DE] rounded flex items-center justify-center">
                        <User className="w-10 h-10 text-[#999999]" />
                      </div>
                    )}
                    {guest.photo_preference && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {guest.photo_preference === 'upload' ? 'Uploaded' : 'We Provide'}
                      </Badge>
                    )}
                  </div>

                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-black text-[#111111]">{guest.name}</h3>
                        {guest.preferred_name && (
                          <p className="text-sm text-[#666666]">Prefers: "{guest.preferred_name}"</p>
                        )}
                      </div>
                      <span className="text-xs text-[#999999]">
                        {format(new Date(guest.created_date), 'MMM d, yyyy')}
                      </span>
                    </div>

                    {guest.title && (
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-[#666666]" />
                        <span className="text-sm text-[#333333] font-medium">{guest.title}</span>
                      </div>
                    )}

                    {guest.bio && (
                      <div className="mb-3">
                        <p className="text-sm text-[#666666] italic">"{guest.bio}"</p>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {guest.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#666666]" />
                          <span className="text-[#333333]">
                            {guest.phone}
                            {guest.phone_extension && ` ext. ${guest.phone_extension}`}
                          </span>
                        </div>
                      )}

                      {guest.shipping_address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#666666]" />
                          <span className="text-[#333333]">
                            {guest.shipping_address.city}, {guest.shipping_address.state}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Full Address Details */}
                    {selectedGuest === guest.id && guest.shipping_address && (
                      <div className="mt-4 p-4 bg-[#F4F2ED] rounded border border-[#E5E3DE]">
                        <h4 className="text-sm font-bold text-[#111111] mb-2">Shipping Address:</h4>
                        <div className="text-sm text-[#333333] space-y-1">
                          <p>{guest.shipping_address.line1}</p>
                          {guest.shipping_address.line2 && <p>{guest.shipping_address.line2}</p>}
                          <p>
                            {guest.shipping_address.city}, {guest.shipping_address.state} {guest.shipping_address.zip}
                          </p>
                          <p>{guest.shipping_address.country}</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedGuest(selectedGuest === guest.id ? null : guest.id)}
                        className="border-2 border-[#1F1F1F]"
                      >
                        {selectedGuest === guest.id ? 'Hide' : 'View'} Full Address
                      </Button>
                      {guest.linkedin_link && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-2 border-[#1F1F1F]"
                        >
                          <a href={guest.linkedin_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            LinkedIn
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
