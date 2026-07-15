import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function GuestsManager() {
  const [editingGuest, setEditingGuest] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: guests = [], isLoading } = useQuery({
    queryKey: ['guests'],
    queryFn: () => base44.entities.Guest.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Guest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['guests']);
      setShowForm(false);
      setEditingGuest(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Guest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['guests']);
      setEditingGuest(null);
      setShowForm(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Guest.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['guests'])
  });

  const GuestForm = ({ guest, onCancel }) => {
    const [formData, setFormData] = useState(guest || {
      name: '',
      title: '',
      bio: '',
      linkedin_link: '',
      image_url: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (guest) {
        updateMutation.mutate({ id: guest.id, data: formData });
      } else {
        createMutation.mutate(formData);
      }
    };

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{guest ? 'Edit Guest' : 'Add New Guest'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              placeholder="Title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Bio"
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="min-h-[100px]"
            />
            <Input
              placeholder="LinkedIn URL"
              value={formData.linkedin_link || ''}
              onChange={(e) => setFormData({ ...formData, linkedin_link: e.target.value })}
            />
            <Input
              placeholder="Image URL"
              value={formData.image_url || ''}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {guest ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Guests</h2>
        <Button onClick={() => { setShowForm(true); setEditingGuest(null); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Guest
        </Button>
      </div>

      {(showForm || editingGuest) && (
        <GuestForm 
          guest={editingGuest} 
          onCancel={() => { setShowForm(false); setEditingGuest(null); }}
        />
      )}

      <div className="grid gap-4">
        {guests.map((guest) => (
          <Card key={guest.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                {guest.image_url && (
                  <img src={guest.image_url} alt={guest.name} className="w-16 h-16 object-cover rounded" />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{guest.name}</h3>
                  <p className="text-sm text-[#666666]">{guest.title}</p>
                  {guest.bio && <p className="text-sm mt-2">{guest.bio}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => { setEditingGuest(guest); setShowForm(true); }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => deleteMutation.mutate(guest.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}