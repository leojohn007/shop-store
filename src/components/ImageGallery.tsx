import React, { useState, useEffect } from 'react';

interface Image {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  tags: string[];
  createdAt: string;
}

interface ImageGalleryProps {
  token: string | null;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ token }) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setImages(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await fetch(`/api/images/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setImages(images.filter(image => image._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Your Images</h2>
      
      {images.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No images uploaded yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map(image => (
            <div key={image._id} className="bg-white rounded-lg shadow overflow-hidden">
              <img
                src={image.imageUrl}
                alt={image.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2">{image.name}</h3>
                {image.description && (
                  <p className="text-gray-600 text-sm mb-2">{image.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  {image.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(image._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};