// src/components/ui/ProjectCard.jsx (Updated – Uses Firestore URLs)
const ProjectCard = ({ project, onClick }) => {
  const firstImage = project.images.length > 0 ? project.images[0] : '/placeholder.jpg';

  return (
    <div onClick={onClick} className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition duration-300">
      <img src={firstImage} alt={project.title} className="w-full h-64 object-cover hover:scale-105 transition duration-500" />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-1">{project.title}</h3>
        <p className="text-md text-gray-800">{project.description}</p>
        <p className="text-md text-green-600 mt-3 font-medium">
          {project.type.replace('-', ' ').toUpperCase()}
        </p>
      </div>
    </div>
  );
};

export default ProjectCard;