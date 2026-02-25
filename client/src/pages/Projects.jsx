// src/pages/Projects.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProjectCard from '../components/ui/ProjectCard';
import ProjectModal from '../components/ui/ProjectModal';
import { supabase } from '../supabase';

import projectsBg from '../assets/images/background/projects-bg.jpg'; // Your background image

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]); // ← This line was missing
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const projectsPerPage = 6;

  // Fetch projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data || []);
        setFilteredProjects(data || []); // Initialize filtered state
      }
    };

    fetchProjects();
  }, []);

  // Apply filters whenever search or type changes
  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerSearch) ||
          p.description.toLowerCase().includes(lowerSearch)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((p) => p.type === typeFilter);
    }

    setFilteredProjects(filtered);
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [search, typeFilter, projects]);

  // Pagination logic
  const indexOfLast = currentPage * projectsPerPage;
  const indexOfFirst = indexOfLast - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  return (
    <main className="pt-0 bg-white">
      {/* Hero Section – Same as SolarEnergy.jsx */}
      <section className="relative h-96 pt-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed" 
          style={{ backgroundImage: `url(${projectsBg})` }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-6 h-full flex items-center justify-center text-center text-white">
          <div className="max-w-5xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
              Our Projects
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-md">
              Explore our completed installations and engineering achievements across Sri Lanka
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
              {/* Search */}
              <div className="w-full md:flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white border border-gray-300 rounded-lg focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none transition shadow-sm"
                />
              </div>

              {/* Type Filter */}
              <div className="w-full md:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white border border-gray-300 rounded-lg focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none transition shadow-sm"
                >
                  <option value="all">All Types</option>
                  <option value="residential-solar">Residential Solar</option>
                  <option value="industrial-solar">Industrial Solar</option>
                  <option value="automation">Automation</option>
                  <option value="engineering">Engineering</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          {filteredProjects.length === 0 ? (
            <p className="text-center text-xl text-gray-600 py-12">
              No projects match your criteria.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 max-w-7xl mx-auto">
                {currentProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => setSelectedProject(project)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-6 md:gap-8 mt-12 md:mt-16">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-6 md:px-8 py-3 md:py-4 bg-green-600 text-white rounded-lg font-medium 
                             disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition"
                  >
                    Previous
                  </button>
                  <span className="text-base md:text-lg font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-6 md:px-8 py-3 md:py-4 bg-green-600 text-white rounded-lg font-medium 
                             disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Interested in a Custom Solution?
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            Contact us today for a free consultation on your next project.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-green-700 shadow-md transition"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      {/* Modal */}
      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </main>
  );
};

export default Projects;