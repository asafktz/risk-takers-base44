import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function AIEpisodeCreator() {
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploaded = [];

    for (const file of files) {
      const result = await base44.integrations.Core.UploadFile({ file });
      uploaded.push(result.file_url);
    }

    setImages([...images, ...uploaded]);
  };

  const handleCreate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { data } = await base44.functions.invoke('createEpisodeWithAI', {
        description,
        images
      });

      setResult(data);
      queryClient.invalidateQueries(['episodes']);
      queryClient.invalidateQueries(['guests']);
      
      // Reset form
      setDescription('');
      setImages([]);
    } catch (error) {
      console.error('Error creating episode:', error);
      alert('Error creating episode: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Episode Creator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Upload Guest Images (optional)
            </label>
            <div className="border-2 border-dashed border-[#1F1F1F] rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-[#666666]" />
                <p className="text-sm text-[#666666]">Click to upload guest photos</p>
              </label>
            </div>
            {images.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {images.map((img, idx) => (
                  <img key={idx} src={img} alt="" className="w-20 h-20 object-cover rounded" />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Episode Description
            </label>
            <Textarea
              placeholder="Describe the episode in free form. Include: title, guests (names, titles, bios), topic, date/time, description, any links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[200px]"
            />
          </div>

          <Button 
            onClick={handleCreate} 
            disabled={loading || !description}
            className="w-full bg-[#1F1F1F] hover:bg-[#111111]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Episode with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="text-green-700">✓ Episode Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Episode:</strong> {result.episode.title}</p>
              <p><strong>Guests Created:</strong> {result.guests.length}</p>
              <ul className="list-disc list-inside ml-4">
                {result.guests.map((guest, idx) => (
                  <li key={idx}>{guest.name} - {guest.title}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}