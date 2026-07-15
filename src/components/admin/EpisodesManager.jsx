import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function EpisodesManager() {
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ['episodes'],
    queryFn: () => base44.entities.Episode.list('-date')
  });

  const { data: guests = [] } = useQuery({
    queryKey: ['guests'],
    queryFn: () => base44.entities.Guest.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Episode.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['episodes']);
      setShowForm(false);
      setEditingEpisode(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Episode.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['episodes']);
      setEditingEpisode(null);
      setShowForm(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Episode.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['episodes'])
  });

  const EpisodeForm = ({ episode, onCancel }) => {
    const [formData, setFormData] = useState(episode || {
      title: '',
      description: '',
      date: '',
      spotify_link: '',
      youtube_link: '',
      recording_url: '',
      display_media: 'youtube',
      registration_link: '',
      event_registration_url: '',
      event_id: null,
      date_id: null,
      guest_ids: [],
      is_live: false,
      status: 'upcoming',
      hero_image: '',
      platform: 'demio',
      linkedin_live_url: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(episode?.hero_image || '');
    const [recordingFile, setRecordingFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setUploading(true);
      
      try {
        let finalData = { ...formData };
        
        // Upload image if a new one was selected
        if (imageFile) {
          const { file_url } = await base44.integrations.Core.UploadFile({
            file: imageFile
          });
          finalData.hero_image = file_url;
        }

        // Upload recording if a new one was selected
        if (recordingFile) {
          const { file_url } = await base44.integrations.Core.UploadFile({
            file: recordingFile
          });
          finalData.recording_url = file_url;
        }
        
        if (episode) {
          updateMutation.mutate({ id: episode.id, data: finalData });
        } else {
          createMutation.mutate(finalData);
        }
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setUploading(false);
      }
    };

    const toggleGuest = (guestId) => {
      const currentIds = formData.guest_ids || [];
      if (currentIds.includes(guestId)) {
        setFormData({ ...formData, guest_ids: currentIds.filter(id => id !== guestId) });
      } else {
        setFormData({ ...formData, guest_ids: [...currentIds, guestId] });
      }
    };

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{episode ? 'Edit Episode' : 'Add New Episode'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Episode Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              placeholder="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[100px]"
            />

            <div>
              <label className="text-sm font-medium mb-2 block">Hero Image</label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-20 object-cover rounded border-2"
                  />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>
            <Input
              type="datetime-local"
              value={formData.date || ''}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              placeholder="Spotify Link"
              value={formData.spotify_link || ''}
              onChange={(e) => setFormData({ ...formData, spotify_link: e.target.value })}
            />
            <Input
              placeholder="YouTube Link"
              value={formData.youtube_link || ''}
              onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })}
            />

            <div>
              <label className="text-sm font-medium mb-2 block">Episode Recording</label>
              <div className="space-y-2">
                {(formData.recording_url || recordingFile) && (
                  <p className="text-xs text-green-600 font-medium">
                    ✓ Recording {recordingFile ? 'selected' : 'uploaded'}
                  </p>
                )}
                <Input
                  type="file"
                  accept="video/*,audio/*"
                  onChange={(e) => {
                    if (e.target.files[0]) setRecordingFile(e.target.files[0]);
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Display Media On Episode Page</label>
              <Select value={formData.display_media || 'youtube'} onValueChange={(value) => setFormData({ ...formData, display_media: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="spotify">Spotify</SelectItem>
                  <SelectItem value="recording">Uploaded Recording</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="Registration Link"
              value={formData.registration_link || ''}
              onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
            />
            <div>
              <label className="text-sm font-medium mb-2 block">Platform</label>
              <Select value={formData.platform || 'demio'} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demio">Demio (Webinar)</SelectItem>
                  <SelectItem value="linkedin_live">LinkedIn Live</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.platform === 'linkedin_live' ? (
              <Input
                placeholder="LinkedIn Live Event URL"
                value={formData.linkedin_live_url || ''}
                onChange={(e) => setFormData({ ...formData, linkedin_live_url: e.target.value })}
              />
            ) : (
              <>
                <Input
                  placeholder="Event Registration URL (Demio)"
                  value={formData.event_registration_url || ''}
                  onChange={(e) => setFormData({ ...formData, event_registration_url: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Event ID (Demio)"
                    value={formData.event_id || ''}
                    onChange={(e) => setFormData({ ...formData, event_id: e.target.value ? parseInt(e.target.value) : null })}
                  />
                  <Input
                    type="number"
                    placeholder="Date ID (Demio)"
                    value={formData.date_id || ''}
                    onChange={(e) => setFormData({ ...formData, date_id: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="recorded">Recorded</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_live" 
                checked={formData.is_live}
                onCheckedChange={(checked) => setFormData({ ...formData, is_live: checked })}
              />
              <label htmlFor="is_live" className="text-sm font-medium">Mark as Live/Featured</label>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Guests</label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-3">
                {guests.map((guest) => (
                  <div key={guest.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={guest.id}
                      checked={(formData.guest_ids || []).includes(guest.id)}
                      onCheckedChange={() => toggleGuest(guest.id)}
                    />
                    <label htmlFor={guest.id} className="text-sm">{guest.name} - {guest.title}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  episode ? 'Update' : 'Create'
                )}
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
        <h2 className="text-2xl font-bold">Episodes</h2>
        <Button onClick={() => { setShowForm(true); setEditingEpisode(null); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Episode
        </Button>
      </div>

      {(showForm || editingEpisode) && (
        <EpisodeForm 
          episode={editingEpisode} 
          onCancel={() => { setShowForm(false); setEditingEpisode(null); }}
        />
      )}

      <div className="grid gap-4">
        {episodes.map((episode) => (
          <Card key={episode.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{episode.title}</h3>
                    {episode.is_live && (
                      <span className="bg-[#C0392B] text-white px-2 py-1 text-xs font-bold rounded">LIVE</span>
                    )}
                  </div>
                  <p className="text-sm text-[#666666] mb-2">{format(new Date(episode.date), 'PPP p')}</p>
                  <p className="text-sm mb-2">
                    Status: <span className="font-medium">{episode.status}</span>
                    {episode.platform === 'linkedin_live' && (
                      <span className="ml-2 bg-[#0A66C2] text-white px-2 py-0.5 text-xs font-bold rounded">LinkedIn Live</span>
                    )}
                  </p>
                  {episode.description && <p className="text-sm">{episode.description}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => { setEditingEpisode(episode); setShowForm(true); }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => deleteMutation.mutate(episode.id)}>
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
