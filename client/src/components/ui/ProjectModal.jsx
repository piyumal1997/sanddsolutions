// src/components/ui/ProjectModal.jsx (Updated – Image Fits Full Modal Width/Height Better, No Crop)
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const ProjectModal = ({ project, onClose }) => {
  const [currentImage, setCurrentImage] = useState(0);

  const prevImage = () => {
    setCurrentImage(prev => (prev > 0 ? prev - 1 : project.images.length - 1));
  };

  const nextImage = () => {
    setCurrentImage(prev => (prev < project.images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-title"
    >
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full mx-auto relative shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-50 hover:text-gray-900 text-3xl transition-colors duration-200 z-10"
          aria-label="Close modal"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        {/* Image Carousel – Full-width, natural height up to 80vh, no forced aspect */}
        <div className="relative flex-shrink-0">
          <div className="overflow-hidden max-h-[80vh] rounded-t-2xl">
            <img 
              src={project.images[currentImage] || '/placeholder.jpg'} 
              alt={`${project.title} - Image ${currentImage + 1}`} 
              className="w-full h-auto object-contain transition-opacity duration-300 ease-in-out"
              key={currentImage} // Key forces re-render for transition
            />
          </div>
          {project.images.length > 1 && (
            <>
              <button 
                onClick={prevImage} 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 px-3 py-2 rounded-full hover:bg-white transition-all duration-200"
                aria-label="Previous image"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button 
                onClick={nextImage} 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 px-3 py-2 rounded-full hover:bg-white transition-all duration-200"
                aria-label="Next image"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
              {/* Pagination Dots */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {project.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${index === currentImage ? 'bg-green-900' : 'bg-gray-300'}`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Project Details – Padded content below image, scrollable if needed */}
        <div className="p-6 text-center md:text-left flex-grow overflow-y-auto">
          <h2 id="project-title" className="text-2xl font-bold text-green-900 mb-2">{project.title}</h2>
          <p className="text-lg text-gray-900 mb-1">{project.description}</p>
          <p className="text-gray-700 whitespace-pre-wrap">{project.details}</p>
          <p className="text-md font-semibold text-gray-900 mt-2">
            {project.type.replace('-', ' ').toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;